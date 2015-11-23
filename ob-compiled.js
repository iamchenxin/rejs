"use strict";

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var _createClass = (function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
})();

function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
    }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function OBSERVER_EXCEPTION(message) {
    this._message = message;
    this.name = "OBSERVER_EXCEPTION";
}

var _OpNode = (function () {
    function _OpNode(parent, func) {
        _classCallCheck(this, _OpNode);

        this._parent = parent;
        this._children = new Array();

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
        key: "_InitRoot",
        value: function _CheckRoot(root) {
            if (root instanceof Creations) {
                if (root._inPlace) {
                    root._InitFunc();
                }
            }
        }
    }, {
        key: "_LeafTraceToRoot",
        value: function _LeafToRootRefcount(step) {
            var checkRoot = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
            var buildChain = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

            var node = this;
            var leafToRootChain = [];
            var rootToLeafChain = null;

            do {
                if (buildChain) {
                    leafToRootChain.push(node);
                }

                node._refCount += step;
                node = node._parent;
            } while (node != null);
            if (checkRoot) {
                rootToLeafChain = new RootToLeafChain(leafToRootChain);
            }
            return rootToLeafChain;
        }
    }, {
        key: "_RefToRoot",
        value: function _RefToRoot() {
            this._LeafTraceToRoot(1);
        }
    }, {
        key: "_UnRefToRoot",
        value: function _UnRefToRoot() {
            this._LeafTraceToRoot(-1);
        }
    }, {
        key: "_Subscribe",
        value: function _Subscribe(func) {
            var checkRoot = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

            var child = this._CreateChild(func);
            var rootToLeafChain = child._RefToRoot();

            if (checkRoot) {
                this._InitRoot(rootToLeafChain._rootToLeafChain[0]);
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

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this._children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var child = _step.value;

                    child._Excute(arg);
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
        value: function Update() {}
    }, {
        key: "UpdateMe",
        value: function UpdateMe() {}
    }, {
        key: "Update",
        value: function Update(observer1, observer2, observer3) {}
    }, {
        key: "UpdateAll",
        value: function UpdateAll() {}
    }]);

    return Operators;
})(_OpNode);

var RootToLeafChain = (function (_Operators) {
    _inherits(RootToLeafChain, _Operators);

    function RootToLeafChain(leafToRootChain) {
        _classCallCheck(this, RootToLeafChain);

        var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(RootToLeafChain).call(this, null, null));

        _this2._rootToLeafChain = [];

        leafToRootChain.reverse();
        var node = new Operators(null, leafToRootChain[0]._func);
        _this2._rootToLeafChain.push(node);
        for (var i = 1; i < leafToRootChain.length; i++) {
            node = new Operators(node, leafToRootChain[i]._func);
            _this2._rootToLeafChain.push(node);
        }

        return _this2;
    }

    return RootToLeafChain;
})(Operators);

// all Creations are static ,there are factory

var Creations = (function (_Operators2) {
    _inherits(Creations, _Operators2);

    function Creations(parent, func, inPlaceInit) {
        var inPlace = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];

        _classCallCheck(this, Creations);

        var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(Creations).call(this, parent, func));

        _this3._InitFunc = inPlaceInit;
        _this3._inPlace = inPlace;
        return _this3;
    }

    _createClass(Creations, null, [{
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

var Observer = (function (_Operators3) {
    _inherits(Observer, _Operators3);

    function Observer(parent, func) {
        _classCallCheck(this, Observer);

        var _this4 = _possibleConstructorReturn(this, Object.getPrototypeOf(Observer).call(this, parent, func));

        _this4._subscriptions = [];
        if (parent) {
            _this4._subscriptions.push(parent);
        }
        return _this4;
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

//# sourceMappingURL=ob-compiled.js.map