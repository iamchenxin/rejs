"use strict"; 

function OBSERVER_EXCEPTION(message) {
    this._message = message;
    this.name = "OBSERVER_EXCEPTION";

}

class _OpNode
{
    constructor(parent, func) {
        this._parent = parent;
        this._children = [];

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

    static _InitRoot(rootToThisChain) {
        let root = rootToThisChain[0];
        if (root instanceof Creations) {
            if (root._inPlace) {
                root._InitFunc(root);
            }
        }
    }

// ------------
    _ThisToRoot(action){ // action(node)
        let node = this;
        do{
            action(node);
            node = node._parent;
        }while (node != null);
    }

    _IfRoot(){
        if(this._parent==null){
            return this;
        }
    }
    _RefToRoot(refv=1){
        this._ThisToRoot(node=>node._refCount+=refv);
    }
    _UnRefToRoot() {
        return this._RefToRoot(-1);
    }
    _BuildRootToThisChain(){
        let thisToRootChain = [];
        let cloneNode=null;
        this._ThisToRoot(node=> thisToRootChain.push(node));

        thisToRootChain.reverse();
        let rootToThisChain = [];
        let tmpNode =null;
        for(let node of thisToRootChain){
            tmpNode = node._ShallowClone(tmpNode);
            tmpNode._refCount+=1;
            rootToThisChain.push(tmpNode);
        }
        return rootToThisChain;
    }
    _GetRoot(){
        let root=null;
        this._ThisToRoot(node=>{
            root=node._IfRoot();
        });
        return root;
    }
// <<< ---


    _Subscribe(func, InitRoot = true) {
        let child = this._CreateChild(func);

        let root=null;
        child._ThisToRoot(node=>{
            node._refCount+=1;
            root=node._IfRoot();
        });

        if (InitRoot) {
            _OpNode._InitRoot(child._BuildRootToThisChain());
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
    _ShallowClone(parent){
        let node =new Operators(parent, this._func);
        if(parent){parent._children[0]=node;}
        return  node;
    }

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
        let root = this._GetRoot();
        root._Excute(value);
    }

    UpdateMe(value) {
        let rootToThisChain = this._BuildRootToThisChain(); // make a clone path leaf to root
        let root = rootToThisChain[0];
        root._Excute(value);
    }

}


// all Creations are static ,there are factory
class Creations extends Operators {

    constructor(parent, func, InitFunc, inPlace=true) {
        super(parent, func);

        this._InitFunc = InitFunc;
        this._inPlace = inPlace;
    }
    _ShallowClone(parent){
        let node = new Creations(parent,this._func,this._InitFunc,this._inPlace);
        if(parent){parent._children[0]=node;}
        return  node;
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