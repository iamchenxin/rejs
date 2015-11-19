"use strict"; 

let r = require("./ob.js");
console.dir(r);
let Operators = r.Operators;
let Creations = r.Creations;
let Observer = r.Observer;

function Test1() {
    let root = Creations.InPlace(node=> {
        node.Update(1);
        node.Update(2);
    });

    root
        .Map(v=> v * 2)
        .Map(v=> v + 100)
        .Subscribe(v=> {
            console.log(` v= ${v}`);
        });

}

exports.t = Test1;