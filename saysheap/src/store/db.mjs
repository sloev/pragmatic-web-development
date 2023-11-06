import GUN from 'gun';

import 'gun/sea.js';
import 'gun/lib/open.js'
import 'gun/lib/load.js'
import { sha256 } from 'js-sha256';
import Geohash from 'latlon-geohash';
import { ref, toRaw } from 'vue'

import { defineStore } from 'pinia'

import { useLocalStorage } from "@vueuse/core"


const uuid = () => {
    return self.crypto.randomUUID()
}
const createSecret = () => {
    return (Math.random() + 1).toString(36).substring(7).toUpperCase();
}

const hashSecret = (secret) => {
    return sha256(secret)
}

const randomHash = () => {
    const array = new Uint32Array(8);
    return self.crypto.getRandomValues(array).toString('base64');
}


export const useDbStore = defineStore('dbStore', () => {

    var SEA = GUN.SEA;
    var gun = GUN({
        localStorage: true,
        radisk: true,
    })
    const settings = {
        cert: null,
        adminPub: null
    }
    const dbInitialized = ref(false)

    const user = {
        username: useLocalStorage("username", ""),
        saltedUsername: useLocalStorage("saltedUsername", ""),
        createdAt: useLocalStorage("createdAt", Date.now()),
        pub: useLocalStorage("pub", ""),
        loggedIn: useLocalStorage("loggedIn", false)
    }

    const tables = {
        users: null,
        messages: null,
        sheeps: null,
        takens: null,
        geohashes: null
    }


    const create = async () => {
        var serverAdmin = await SEA.pair();
        await gun.user().auth(serverAdmin);

        let rules = [
            { "#": { "*": "users" }, ".": { "+": "*" } },
            { "#": { "*": "messages" }, ".": { "+": "*" } },
            { "#": { "*": "sheeps" }, ".": { "+": "*" } },
            { "#": { "*": "takens" }, ".": { "+": "*" } },
            { "#": { "*": "geohashes" }, ".": { "+": "*" } }
        ]
        var certificate = await SEA.certify("*", rules, serverAdmin, null)
        await gun.user(serverAdmin.pub).get("admin").get("cert").put(certificate).then()
        return serverAdmin
    }
    const load = async (pub) => {

        settings.adminPub = pub;

        let certificate = await gun.user(pub).get("admin").get("cert");
        console.log(certificate)
        settings.cert = certificate;


        for (const table in tables) {
            tables[table] = gun.user(pub).get(table)
        }
        tables.root = gun.user(pub)
        console.log(tables)
        dbInitialized.value = true
    }

    const createUser = async (username, password) => {
        let existingUser = await getUserByUsername(username)
        console.log("existing user:", existingUser)
        if (existingUser) {
            throw Error("user already exists")
        }

        try {
            let salt = randomHash()
            let saltedUsername = username + salt
            await new Promise((resolve, reject) => {
                gun.user().create(saltedUsername, password, ack => {
                    if (ack.err) {
                        reject(ack.err)
                    } else {
                        resolve(ack)
                    }
                })
            })
            console.log("created new user")
            await new Promise((resolve, reject) => {
                gun.user().auth(saltedUsername, password, ack => {
                    if (ack.err) {
                        reject(ack.err)
                    } else {
                        resolve(ack)
                    }
                })
            })
            console.log("logged in with new user")
            let userPub = gun.user().is.pub

            let newUser = {
                username: username,
                saltedUsername: saltedUsername,
                createdAt: Date.now(),
                pub: userPub,
                loggedIn: true
            }
            user.username.value = newUser.username
            user.saltedUsername.value = newUser.saltedUsername
            user.createdAt.value = newUser.createdAt
            user.pub.value = newUser.pub
            user.loggedIn.value = newUser.loggedIn



            await tables.users.get(username).get(userPub).put(newUser, null, { opt: { cert: settings.cert } }).then()
            console.log("saved new user")

            return user
        } catch (e) {
            return Error(e)
        }
    }

    const getUserByUsername = async (username) => {
        return await new Promise((resolve, reject) => {
            const TimerId = setTimeout(() => {
                resolve(null)          // the requested node seems not to exist (yet)
            }, 2000)
            tables.users.get(username).map().load(data => {
                clearTimeout(TimerId)
                resolve(data)
            }, { wait: 0 })
        })
    }

    const login = async (username, password) => {
        let existingUser = await getUserByUsername(username)
        if (!existingUser) {
            throw Error("user doesnt exists")
        }
        console.log("existing", existingUser)

        try {
            await new Promise((resolve, reject) => {
                gun.user().auth(existingUser.saltedUsername, password, ack => {
                    if (ack.err) {
                        reject(ack.err)
                    } else {
                        resolve(ack)
                    }
                })
            })

            user.username.value = existingUser.username
            user.saltedUsername.value = existingUser.saltedUsername
            user.createdAt.value = existingUser.createdAt
            user.pub.value = existingUser.pub
            user.loggedIn.value = true
            return user

        } catch (e) {
            return Error("auth user error:", e)
        }
    }

    const listenForGeoHashes = (geohashPrefix) => {
        var geohashItem = this.tables.geohashes
        for (let i = 0; i < geohashPrefix.length; i++) {
            geohashItem = geohashItem.get(geohashPrefix.charAt(i))
        }
        geohashItem.map().open((data, doc, key, opt, eve) => {
            // console.log(doc, key, opt, eve)
            console.log("got eveeeeent, data:", data)
            //...
        })
    }
    const createSheep = async ({ image, tags, lat, lon }) => {
        var sheepId = uuid()
        var secret = createSecret()
        var geohash = Geohash.encode(lat, lon, 10);
        var tagsObject = {}
        for (var i = 0; i < tags.length; ++i) {
            tagsObject[tags[i]] = tags[i];
        }

        var info = {
            id: sheepId,
            date: Date.now(),
            image: image,
            lat: lat,
            lon: lon,
            geohash: geohash,
            secret_hash: hashSecret(secret),
            author: { username: user.username, pub: user.pub },
            tags: tagsObject

        };
        var geohashItem = tables.geohashes
        for (let i = 0; i < geohash.length; i++) {
            geohashItem = geohashItem.get(geohash.charAt(i))
        }

        var sheep = tables.sheeps.get(sheepId).get(user.pub).put(JSON.parse(JSON.stringify(info)), null, { opt: { cert: settings.cert } })
        geohashItem.get(sheepId).get(user.pub).put(sheep, null, { opt: { cert: settings.cert } })

        tables.users.get(user.username).get(user.pub).get("sheeps").set(JSON.parse(JSON.stringify(sheep)), null, { opt: { cert: settings.cert } })
        return { secret, ...info }
    }

    const createMessage = async ({ sheepId, message, sheepAuthorPub }) => {
        var messageId = uuid()

        var info = {
            author: { username: user.username, pub: user.pub },
            sheepId: sheepId,
            id: messageId,
            date: Date.now(),
            message: message,
            taken: ""
        };
        var message = tables.messages.get(messageId).get(user.pub).put(JSON.parse(JSON.stringify(info)), null, { opt: { cert: settings.cert } })
        var sheep = tables.sheeps.get(sheepId).get(sheepAuthorPub)
        sheep.get("messages").get(messageId).put(JSON.parse(JSON.stringify(message)), null, { opt: { cert: settings.cert } })


        sheep = await tables.sheeps.get(sheepId).get(sheepAuthorPub).then()
        message = await tables.messages.get(messageId).get(user.pub).then()

        return { messageId }
    }

    const logout = () => {
        user.value = { "loggedIn": false }
    }

    return {
        login, create, createUser, logout, createMessage, createSheep, listenForGeoHashes, load, getUserByUsername, user, dbInitialized
    }

})