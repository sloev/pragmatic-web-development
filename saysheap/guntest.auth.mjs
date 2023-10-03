'use-strict'
import GUN from 'gun';
import SEA from 'gun/sea.js';


(async () => {
    const dbName = "saysheepdb_" + Date.now()
    var SEA = GUN.SEA;
    var gun = GUN()
    const userNew = async (username, password) => {
        return new Promise((resolve, reject) => {
            gun.user().create(username, password, (s) => {
                if ("err" in s) {
                    reject(s);
                } else {
                    userLogout()
                    gun.user().auth(username, password, (su) => {
                        if ("err" in su) {
                            reject(su);
                            userLogout()
                        } else {
                            let user = {
                                username: username,
                                image: "foo",
                                sea: su.sea,
                                pub: su.sea.pub,
                            }
                            resolve(user);
                        }
                    })
                }
            });
        })
    }
    const userLogin = async (username, password) => {
        return new Promise((resolve, reject) => {
            gun.user().auth(username, password, (s) => {
                if ("err" in s) {
                    reject(s);
                    userLogout()
                } else {
                    let user = {
                        username: username,
                        image: "foo",
                        sea: s.sea,
                        pub: s.sea.pub,
                    }
                    resolve(user);
                }
            })
        });
    }

    /**
     * Log the user out
     */
    const userLogout = () => {
        gun.user().leave()
    }

    const checkResponse = (s) => {
        if ('err' in s) {
            console.warn("error in gun response, error:", s.err, "s:")
        }
    }

    const createCert = async (rules, certName, user) => {
        return new Promise((resolve, reject) => {
            SEA.certify("*", rules, user.sea, (a) => {
                if (!a){
                    reject()
                }
                gun.user(user.pub)
                    .get('certs')
                    .get(certName)
                    .put(a, (b) => {
                        if (!!b.err) {
                            reject()
                        }

                        gun.user(user.pub).get('certs').get(certName, (cert) => {

                            resolve(cert)
                        })
                    })
            })
        })
    }


    // 1......
    // create server certificate for database (allowing server to delete all user objects)

    var serverAdmin = await userNew('server' + dbName, "lolCat1234")
        var rules = [
            { "*": "users", "+": "*" },
            { "*": "messages", "+": "*" },
           { "*": "sheeps", "+": "*" },
           { "*": "takens", "+": "*" },
           { "*": "geohashes", "+": "*" }
        ]
        // var certificate = await createCert(rules, 'cert', serverAdmin)
        var certificate = await SEA.certify("*", rules, serverAdmin.sea)
        console.log("got cert:", certificate)
        // Authenticate with the ServerAdmin pair



        userLogout()


        // 2......
        // create new user, use cert to store user in database


        var bobUser = await userNew('bob' + dbName, "lolCat1234")
        var bobInfo = {
            name: "bob",
            username: "bob@bob.dk"
        };

        var bob = gun.user(serverAdmin.pub).get('users').get(bobUser.pub).put(bobInfo, null,{ opt: { cert: certificate } })
        checkResponse(bob)

        var sheepInfo = {
            id: 10,
            image: "foo",
            decription: "",
            secret_hash_for_delete: ""
        }
        var sheep = gun.user(serverAdmin.pub).get('sheeps').get(sheepInfo.id + "/" + bobUser.pub).put(sheepInfo, null, { opt: { cert: certificate } })
        checkResponse(sheep)

        userLogout()

        var aliceUser = await userNew('alice' + dbName, "lolCat1234")


        var aliceInfo = {
            name: "alice",
            username: "alice@bob.dk"
        };

        var alice = gun.user(serverAdmin.pub).get('users').get(aliceUser.pub).put(aliceInfo, null, { opt: { cert: certificate } })
        checkResponse(alice)
        var sheepInfo = {
            image: "foo",
            decription: "",
            secret_hash_for_delete: ""
        }
        sheep = gun.user(serverAdmin.pub).get('sheeps').get(sheepInfo.id + "/" + aliceUser.pub).put(sheepInfo, null, { opt: { cert: certificate } })
        checkResponse(sheep)
        // heap.path("author").put(bob, null, {opt: {cert: certificate }}).path("heaps").set(heap, null, {opt: {cert: certificate }})



    })();
