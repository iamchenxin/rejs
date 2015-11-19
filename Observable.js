"use strict"; 

function OBSERVER_EXCEPTION(message) {
    this._message = message;
    this.name = "OBSERVER_EXCEPTION";
}

class _OpNode
{
    constructor(parent, func) {
        this._parent = parent;
        this._children = new Array();

        this._func = func;
        this._refCount = 0;
    }

    static _Create(func) {
        return new Operators(null, func);
    }

    _CreateChild(func) {
        let newNode = new Operators(this, func);
        this._children.push(newNode);
        return newNode;
    }

    _CheckRoot(root) {
        if (root instanceof Creations) {
            if (root._inPlace) {
                root._inPlaceInit();
            }
        }
    }

    _LeafToRootRefcount(step, checkRoot = true, buildChain = true) {
        let node = this;
        let leafToRootChain = [];
        let rootToLeafChain = null;

        do {
            if (buildChain) { leafToRootChain.push(node); }

            node._refCount += step;
            node = node._parent;
        } while (node != null);
        if (checkRoot) {
            rootToLeafChain = new RootToLeafChain(leafToRootChain);
        }
        return rootToLeafChain;
    }

    _RefToRoot() {
        this._LeafToRootRefcount(1);
    }

    _UnRefToRoot() {
        this._LeafToRootRefcount(-1);
    }

    _Subscribe(func, checkRoot = true) {
        let child = this._CreateChild(func);
        let rootToLeafChain = child._RefToRoot();

        if (checkRoot) {
            this._CheckRoot(rootToLeafChain._rootToLeafChain[0]);
        }
        return child;
    }

    _UnSubscribe() {
        this._UnRefToRoot();
        return null;
    }

    _Excute(inarg) {
        if (this._refCount == 0) return;

        let arg = this._func(inarg);

        for (let child of this._children) {
            child._Excute(arg);
        }
    }

    // Transforming base
    _Op_Transform(func) {
        return this._CreateChild(func);
    }
}

class Operators extends _OpNode
{

    Subscribe(func) {
        return this._Subscribe(func);
    }

    UnSubscribe() {
        return this._UnSubscribe();
    }

    Map(func) {
        return this._Op_Transform(func);
    }


    Update() {

    }

    UpdateMe() {

    }

    Update(observer1, observer2, observer3) {

    }

    UpdateAll() {

    }



}

class RootToLeafChain extends Operators {

    constructor(leafToRootChain) {
        super(null, null);
        this._rootToLeafChain = [];

        leafToRootChain.reverse();
        let node = new Operators(null, leafToRootChain[0]._func);
        this._rootToLeafChain.push(node);
        for (let i = 1; i < leafToRootChain.length ; i++) {
            node = new Operators(node, leafToRootChain[i]._func);
            this._rootToLeafChain.push(node);
        }

    }

}

// all Creations are static ,there are factory
class Creations extends Operators {

    constructor(parent, func, inPlaceInit, inPlace=true) {
        super(parent, func);

        this._inPlaceInit = inPlaceInit;
        this._inPlace = inPlace;
    }

    static InPlace(inPlaceFunc) {
        return new Creations(null, v=> v, inPlaceFunc);
    }

    static Init(func) {
        return new Creations(null, func, null, false);
    }

}

class Observer extends Operators {

    constructor(parent, func) {
        super(parent, func);
        this._subscriptions = [];
        if (parent) {
            this._subscriptions.push(parent);
        }
    }

    SubscribeTo(operator, func = null) {
        if (func == null) {
            if (this._func != null) {
                func = this._func;
            } else {
                throw new OBSERVER_EXCEPTION("the func of observer should not be null");
            }
        } 
    //CONTINOUS
      //  operator.Subscribe();
    }

}

exports.Operators = Operators;
exports.Creations = Creations;
exports.Observer = Observer;