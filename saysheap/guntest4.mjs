import crypto from 'crypto'
import GUN from 'gun';
import 'gun/sea.js';
import { sha256 } from 'js-sha256';
(async () => {

    var SEA = GUN.SEA;
    var gun = GUN()
   
    console.log(await SEA.encrypt("foobar", 'secret passphrase'));
    console.log(await SEA.encrypt("foobar", 'secret passphrase'));
    console.log(await SEA.encrypt("foobar", 'secret passphrase'));




})();