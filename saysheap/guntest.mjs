import DB from './src/helpers/db.mjs';

(async () => {
    let db = new DB()
    let admin = await db.create()
    let err
    err = await db.load(admin.pub)
    err = await db.createUser("foobarbas", "foobarbas")
    
    err = await db.login("foobarbas", "foobarbas")
    // console.log("logged in user", db.user, "err", err)
    db.listenForGeoHashes("u120fwxrh1")
    var sheep= await db.createSheep({image:"foo", tags:["lol", "cat"], lat:52.20,  lon:0.12});
    sheep = await db.getSheepById(sheep.id)

    // console.log("sheep", sheep)
    await db.createMessage({sheepId:sheep.id, message:"lol", sheepAuthorPub:sheep.author.pub})
    sheep = await db.getSheepById(sheep.id)

    // console.log("sheep and messages", sheep)





})();
