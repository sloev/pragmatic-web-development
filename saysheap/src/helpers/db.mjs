import crypto from 'crypto'
import GUN from 'gun';

import 'gun/sea.js';
import 'gun/lib/open.js'
import 'gun/lib/load.js'
import { sha256 } from 'js-sha256';
import Geohash from 'latlon-geohash';



var SEA = GUN.SEA;
var gun = GUN({
    localStorage: true,
    radisk: true,
})


const uuid = () => {
    return crypto.randomUUID()
}
const createSecret = () => {
    return (Math.random() + 1).toString(36).substring(7).toUpperCase();
}

const hashSecret = (secret) => {
    return sha256(secret)
}

class DB {
    constructor() {
        this.settings = {
            cert: null,
            admin_pub: null,
            logged_in_user: null
        }

        this.tables = {
            users: null,
            messages: null,
            sheeps: null,
            takens: null,
            geohashes: null
        }
    }
    get user() {
        return this.settings.logged_in_user
    }
    get cert() {
        return this.settings.cert
    }
    get adminPub() {
        return this.settings.admin_pub
    }


    randomHash() {
        return crypto.randomBytes(8).toString('base64');
    }

    async create() {
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

    async load(adminPub) {

        this.settings.cert = await gun.user(adminPub).get("admin").get("cert");

        this.settings.admin_pub = adminPub;

        for (const table in this.tables) {
            this.tables[table] = gun.user(this.settings.admin_pub).get(table)
        }
        this.tables.root = gun.user(this.settings.admin_pub)
    }

    async createUser(username, password) {
        let existingUser = await this.getUserByUsername(username)
        if (existingUser) {
            throw Error("user already exists")
        }

        try {
            let salt = this.randomHash()
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
            await new Promise((resolve, reject) => {
                gun.user().auth(saltedUsername, password, ack => {
                    if (ack.err) {
                        reject(ack.err)
                    } else {
                        resolve(ack)
                    }
                })
            })
            let userPub = gun.user().is.pub
            var user = {
                username: username,
                salted_username: saltedUsername,
                created_at: Date.now(),
                pub: userPub
            }
            this.settings.logged_in_user = user
            await this.tables.users.get(username).get(userPub).put(user, null, { opt: { cert: this.cert } }).then()
        } catch (e) {
            return Error("error creating user:", e)
        }
    }

    async getUserByUsername(username) {
        return await new Promise((resolve, reject) => {
            const TimerId = setTimeout(() => {
                resolve(null)          // the requested node seems not to exist (yet)
            }, 2000)
            this.tables.users.get(username).map().load(data => {
                clearTimeout(TimerId)
                resolve(data)
            }, { wait: 0 })
        })
    }

    async getSheepById(sheepId) {
        return await new Promise((resolve, reject) => {
            const TimerId = setTimeout(() => {
                resolve(null)          // the requested node seems not to exist (yet)
            }, 2000)
            this.tables.sheeps.get(sheepId).map().load(data => {
                clearTimeout(TimerId)
                resolve(data)
            }, { wait: 0 })
        })
    }

    async login(username, password) {
        let existingUser = await this.getUserByUsername(username)
        if (!existingUser) {
            throw Error("user doesnt exists")
        }

        try {
            await new Promise((resolve, reject) => {
                gun.user().auth(existingUser.salted_username, password, ack => {
                    if (ack.err) {
                        reject(ack.err)
                    } else {
                        resolve(ack)
                    }
                })
            })
            var user = {
                username: existingUser.username,
                salted_username: existingUser.salted_username,
                created_at: existingUser.created_at,
                pub: existingUser.pub
            }
            this.settings.logged_in_user = user
        } catch (e) {
            return Error("auth user error:", e)
        }
    }

    listenForGeoHashes(geohashPrefix) {
        var geohashItem = this.tables.geohashes
        for (let i = 0; i < geohashPrefix.length; i++) {
            geohashItem = geohashItem.get(geohashPrefix.charAt(i))
        }
        geohashItem.map().open((data, doc, key, opt, eve)=> {
            // console.log(doc, key, opt, eve)
            console.log("got eveeeeent, data:",data)
            //...
        })
    }

    async createSheep({ image, tags, lat, lon }) {
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
            author: { username: this.user.username, pub: this.user.pub },
            tags: tagsObject

        };
        var geohashItem = this.tables.geohashes
        for (let i = 0; i < geohash.length; i++) {
            geohashItem = geohashItem.get(geohash.charAt(i))
        }

        var sheep = this.tables.sheeps.get(sheepId).get(this.user.pub).put(info, null, { opt: { cert: this.cert } })
        geohashItem.get(sheepId).get(this.user.pub).put(sheep, null, { opt: { cert: this.cert } })

        this.tables.users.get(this.user.username).get(this.user.pub).get("sheeps").set(sheep, null, { opt: { cert: this.cert } })
        return { secret, ...info }
    }

    async createMessage({ sheepId, message, sheepAuthorPub }) {
        var messageId = uuid()

        var info = {
            author: { username: this.user.username, pub: this.user.pub },
            sheepId: sheepId,
            id: messageId,
            date: Date.now(),
            message: message,
            taken: ""
        };
        var message = this.tables.messages.get(messageId).get(this.user.pub).put(info, null, { opt: { cert: this.cert } })
        var sheep = this.tables.sheeps.get(sheepId).get(sheepAuthorPub)
        sheep.get("messages").get(messageId).put(message, null, { opt: { cert: this.cert } })


        sheep = await this.tables.sheeps.get(sheepId).get(sheepAuthorPub).then()
        message = await this.tables.messages.get(messageId).get(this.user.pub).then()

        return { messageId }
    }

}

export default DB