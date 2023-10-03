import crypto from 'crypto'
import GUN from 'gun';
import { sha256 } from 'js-sha256';


const uuid = () => {
    return crypto.randomUUID()
}

var SEA = GUN.SEA;
var gun = GUN()
const db = gun.get(uuid())

const createUser = (opt) => {
    var bobInfo = {
        name: "bob",
        username: "bob@bob.dk"
    };
    return db.get('users/' + bobInfo.username).put(bobInfo, null)
}
const createSecret =() =>{
    return (Math.random() + 1).toString(36).substring(7).toUpperCase();
}

const hashSecret =(secret) =>{
    return sha256(secret)
}

const createHeap = (opt) => {
    const { user, image, tags, coordinate, description } = opt
    var heapId = uuid()
    var secret = createSecret()
    var heapInfo = {
        id: heapId,
        date: new Date(),
        image: image,
        coordinate: coordinate,
        description: description,
        secret_hash: hashSecret(secret)
    };
    var heap = db.get('heaps/' + heapId).put(heapInfo, null)
    heap.get("author").put(user).get("heaps").set(heap)
    tags.forEach(tag => {
        db.get('heaps/' + heapId).get('tags').get(tag).put(tag)
    });
    return {heapId, secret}
}

const createHeapMessage = (opt) => {
    var { user, heapId, message } = opt
    var messageId = uuid()
    var messageInfo = {
        id: messageId,
        date: new Date(),
        message: message
    };
    message = db.get('messages/' + messageId).put(messageInfo, null)
    message.get('author').put(user).get('messages').put(message)
    var heap = db.get('heaps/' + heapId)
    heap.get('messages').set(message).get('heap').put(heap)
}

const markTaken = (heap_id, secret) =>{
    let secret_hash = hashSecret(secret.toUpperCase())
    var heap = db.get('heaps/' + heapId)
    if (heap.secret_hash == secret_hash) {
        var heap = db.get('taken/' + heap_id).get(secret).put(secret)
    }
}

const deleteTakenHeaps = (username) => {
    db.get('users/'+username).get('heaps')
    // go through all the heaps and check if any of them has an entry in /taken/
    // if it is in /taken/ then check if the heaps secret matches the one in /taken/
    // if so, then put null your heap
    heap.get("author").put(user).get("heaps").set(heap)

    let secret_hash = hashSecret(secret.toUpperCase())
    var heap = db.get('heaps/' + heapId)
    if (heap.secret_hash == secret_hash) {
        var heap = db.get('taken/' + heap_id).get(secret).put(secret)
    }
}

(async () => {

    var bobSea = await SEA.pair()
    await gun.user().auth(bobSea)

    var bobInfo = {
        name: "bob",
        username: "bob@bob.dk"
    };

    var bob = gun.user(ServerAdmin.pub).get(dbName).get('users/' + bobInfo.username).put(bobInfo, null)

})();
