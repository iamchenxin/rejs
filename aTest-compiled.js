"use strict";

var r = require("./Observable-compiled.js");
var Operators = r.Operators;
var Creations = r.Creations;
var Observer = r.Observer;

function Test1() {
    var root = Creations.InPlace(function (node) {
        console.log("iam inplace");
        node.Update(1);
        node.Update(2);
    });

    console.log("begin ..");
    var s2 = root.Map(function (v) {
        return v * 2;
    }).Map(function (v) {
        return v + 100;
    });
    var s3 = s2.Map(function (v) {
        return v + 1000;
    }).Subscribe(function (v) {
        console.log("s3 v= " + v);
    });
    var s4 = s2.Subscribe(function (v) {
        console.log("s4 v= " + v);
    });

    s4.Update(7);
    //    root.Update(3);

    console.log("end ..");
}

exports.t = Test1;

//# sourceMappingURL=aTest-compiled.js.map