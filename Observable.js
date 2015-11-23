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
                root._inPlaceInit(root);
            }
        }
    }

    _LeafTraceToRoot(refCount, buildChain = true) {
        let node = this;
        let leafToRootChain = [];

        do {
            if (buildChain) { leafToRootChain.push(node); }

            node._refCount += refCount;
            node = node._parent;
        } while (node != null);
        return leafToRootChain;
    }

    _LeafToRoot(action){
        let node = this;
        do{
            action(node);
            node = node._parent;
        }while (node != null);
    }

    _RefToRoot2(refv=1){
        _LeafToRoot(node=>node._refCount+=refv);
    }

    _RefToRoot() {
        return this._LeafTraceToRoot(1);
    }

    _UnRefToRoot() {
        return this._LeafTraceToRoot(-1);
    }

    _Subscribe(func, checkRoot = true) {
        let child = this._CreateChild(func);
        let leafToRootChain = child._RefToRoot();

        if (checkRoot) {
            let rootToLeafChain = this._RootToLeafChain(leafToRootChain);
            this._CheckRoot(rootToLeafChain[0]);
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

    _RootToLeafChain(leafToRootChain){
        let rootToLeafChain = [];

        leafToRootChain.reverse();
        let node = leafToRootChain[0].ShallowClone(null);
        node._refCount+=1;
        rootToLeafChain.push(node);
        for (let i = 1; i < leafToRootChain.length ; i++) {
            node = leafToRootChain[i].ShallowClone(node);
            node._refCount+=1;
            rootToLeafChain.push(node);
        }
        return rootToLeafChain;
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


    Update(value) {
        let leafToRoot = this._LeafTraceToRoot(0);
        leafToRoot[leafToRoot.length-1]._Excute(value);
    }

    UpdateMe(rootToLeafChain=[]) {
        if(rootToLeafChain==false){

          //  rootToLeafChain =
        }
    }


    UpdateAll() {

    }

    ShallowClone(parent){
        let node =new Operators(parent, this._func);
        if(parent){parent._children[0]=node;}
        return  node;
    }

}

class RootToLeafChain extends Operators {

    constructor(leafToRootChain) {
        super(null, null);
        this._rootToLeafChain = [];

        leafToRootChain.reverse();
        let node = leafToRootChain[0].ShallowClone(null);
        this._rootToLeafChain.push(node);
        for (let i = 1; i < leafToRootChain.length ; i++) {
            node = leafToRootChain[i].ShallowClone(node);
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

    ShallowClone(parent){
        let node = new Creations(parent,this._func,this._inPlaceInit,this._inPlace);
        if(parent){parent._children[0]=node;}
        return  node;
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