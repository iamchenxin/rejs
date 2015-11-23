"use strict"; 

let r = require("./Observable-compiled.js");
let Operators = r.Operators;
let Creations = r.Creations;
let Observer = r.Observer;

function Test1() {
    let root = Creations.InPlace(node=> {
        console.log("iam inplace");
        node.Update(1);
        node.Update(2);
    });

    console.log("begin ..");
    let s2=root
        .Map(v=> v * 2)
        .Map(v=> v + 100);
    let s3 = s2.Map(v=>v+1000).Subscribe(v=> {
        console.log(`s3 v= ${v}`);
    });
    let s4 = s2.Subscribe(v=> {
        console.log(`s4 v= ${v}`);
    });

    s4.Update(7);
//    root.Update(3);

    console.log("end ..");
}

exports.t = Test1;