"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function OBSERVER_EXCEPTION(message) {
    this._message = message;
    this.name = "OBSERVER_EXCEPTION";
}

var _OpNode = (function () {
    function _OpNode(parent, func) {
        _classCallCheck(this, _OpNode);

        this._parent = parent;
        this._children = [];

        this._func = func;
        this._refCount = 0;
    }

    _createClass(_OpNode, [{
        key: "_CreateChild",
        value: function _CreateChild(func) {
            var newNode = new Operators(this, func);
            this._children.push(newNode);
            return newNode;
        }
    }, {
        key: "_ThisToRoot",

        // ------------
        value: function _ThisToRoot(action) {
            // action(node)
            var node = this;
            do {
                action(node);
                node = node._parent;
            } while (node != null);
        }
    }, {
        key: "_IfRoot",
        value: function _IfRoot() {
            if (this._parent == null) {
                return this;
            }
        }
    }, {
        key: "_RefToRoot",
        value: function _RefToRoot() {
            var refv = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

            this._ThisToRoot(function (node) {
                return node._refCount += refv;
            });
        }
    }, {
        key: "_UnRefToRoot",
        value: function _UnRefToRoot() {
            return this._RefToRoot(-1);
        }
    }, {
        key: "_BuildRootToThisChain",
        value: function _BuildRootToThisChain() {
            var thisToRootChain = [];
            var cloneNode = null;
            this._ThisToRoot(function (node) {
                return thisToRootChain.push(node);
            });

            thisToRootChain.reverse();
            var rootToThisChain = [];
            var tmpNode = null;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = thisToRootChain[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var node = _step.value;

                    tmpNode = node._ShallowClone(tmpNode);
                    tmpNode._refCount += 1;
                    rootToThisChain.push(tmpNode);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return rootToThisChain;
        }
    }, {
        key: "_GetRoot",
        value: function _GetRoot() {
            var root = null;
            this._ThisToRoot(function (node) {
                root = node._IfRoot();
            });
            return root;
        }
        // <<< ---

    }, {
        key: "_Subscribe",
        value: function _Subscribe(func) {
            var InitRoot = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

            var child = this._CreateChild(func);

            var root = null;
            child._ThisToRoot(function (node) {
                node._refCount += 1;
                root = node._IfRoot();
            });

            if (InitRoot) {
                _OpNode._InitRoot(child._BuildRootToThisChain());
            }
            return child;
        }
    }, {
        key: "_UnSubscribe",
        value: function _UnSubscribe() {
            this._UnRefToRoot();
            return null;
        }
    }, {
        key: "_Excute",
        value: function _Excute(inarg) {
            if (this._refCount == 0) return;

            var arg = this._func(inarg);
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this._children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var child = _step2.value;

                    child._Excute(arg);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        }

        // Transforming base

    }, {
        key: "_Op_Transform",
        value: function _Op_Transform(func) {
            return this._CreateChild(func);
        }
    }], [{
        key: "_Create",
        value: function _Create(func) {
            return new Operators(null, func);
        }
    }, {
        key: "_InitRoot",
        value: function _InitRoot(rootToThisChain) {
            var root = rootToThisChain[0];
            if (root instanceof Creations) {
                if (root._inPlace) {
                    root._InitFunc(root);
                }
            }
        }
    }]);

    return _OpNode;
})();

var Operators = (function (_OpNode2) {
    _inherits(Operators, _OpNode2);

    function Operators() {
        _classCallCheck(this, Operators);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Operators).apply(this, arguments));
    }

    _createClass(Operators, [{
        key: "_ShallowClone",
        value: function _ShallowClone(parent) {
            var node = new Operators(parent, this._func);
            if (parent) {
                parent._children[0] = node;
            }
            return node;
        }
    }, {
        key: "Subscribe",
        value: function Subscribe(func) {
            return this._Subscribe(func);
        }
    }, {
        key: "UnSubscribe",
        value: function UnSubscribe() {
            return this._UnSubscribe();
        }
    }, {
        key: "Map",
        value: function Map(func) {
            return this._Op_Transform(func);
        }
    }, {
        key: "Update",
        value: function Update(value) {
            var root = this._GetRoot();
            root._Excute(value);
        }
    }, {
        key: "UpdateMe",
        value: function UpdateMe(value) {
            var rootToThisChain = this._BuildRootToThisChain(); // make a clone path leaf to root
            var root = rootToThisChain[0];
            root._Excute(value);
        }
    }]);

    return Operators;
})(_OpNode);

// all Creations are static ,there are factory

var Creations = (function (_Operators) {
    _inherits(Creations, _Operators);

    function Creations(parent, func, InitFunc) {
        var inPlace = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];

        _classCallCheck(this, Creations);

        var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(Creations).call(this, parent, func));

        _this2._InitFunc = InitFunc;
        _this2._inPlace = inPlace;
        return _this2;
    }

    _createClass(Creations, [{
        key: "_ShallowClone",
        value: function _ShallowClone(parent) {
            var node = new Creations(parent, this._func, this._InitFunc, this._inPlace);
            if (parent) {
                parent._children[0] = node;
            }
            return node;
        }
    }], [{
        key: "InPlace",
        value: function InPlace(inPlaceFunc) {
            return new Creations(null, function (v) {
                return v;
            }, inPlaceFunc);
        }
    }, {
        key: "Init",
        value: function Init(func) {
            return new Creations(null, func, null, false);
        }
    }]);

    return Creations;
})(Operators);

var Observer = (function (_Operators2) {
    _inherits(Observer, _Operators2);

    function Observer(parent, func) {
        _classCallCheck(this, Observer);

        var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(Observer).call(this, parent, func));

        _this3._subscriptions = [];
        if (parent) {
            _this3._subscriptions.push(parent);
        }
        return _this3;
    }

    _createClass(Observer, [{
        key: "SubscribeTo",
        value: function SubscribeTo(operator) {
            var func = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

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
    }]);

    return Observer;
})(Operators);

exports.Operators = Operators;
exports.Creations = Creations;
exports.Observer = Observer;

//# sourceMappingURL=Observable-compiled.js.map