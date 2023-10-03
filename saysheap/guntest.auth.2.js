(async () => {
    const GUN = require('gun');
    const suffix = Date.now()
    require('gun/sea')
    var SEA = GUN.SEA;
    var gun = GUN()
    async function auth( username, password ) {
        return new Promise(( resolve, reject ) => {
          gun.user()
            .auth( username, password, ack =>
              ack.err
                ? reject( ack.err )
                : resolve( {
                    username:username,
                    sea:ack.sea,
                    pub: ack.sea.pub
                })
            )
        })
      }
    async function createUser( username, password ) {
        return await new Promise(( resolve, reject ) => {
          gun.user().create( username, password, ack =>
            ack.err
              ? reject( ack.err )
              // Return authenticated user.
              : resolve( auth( username, password ))
          )
        })
      }
    

    
    var serverAdmin = await createUser('admin'+suffix, 'lolCat1234')
    // await gun.user().auth(serverAdmin)


    var certificate = await SEA.certify("*", [{ "*": "users", "+": "*" },{ "*": "messages", "+": "*" }], serverAdmin.sea, null)

    var bobSea = await createUser('bob'+suffix, 'lolCat1234')
    // await gun.user().auth(bobSea)

    var bobInfo = {
        name: "bob",
        username: "bob@bob.dk"
    };

    var bob = await gun.user(serverAdmin.pub).get('messages').get(bobSea.pub).put(bobInfo, null, {opt: {cert: certificate }})
    console.log(bob)

    var aliceSea = await createUser('alice'+suffix, 'lolCat1234')

    var aliceInfo = {
        name: "alice",
        username: "bob@bob.dk"
    };


    var alice = await gun.user(serverAdmin.pub).get('users').get(aliceSea.pub).put(aliceInfo, null,{opt: {cert: certificate }})
    console.log(alice)
    



})();
