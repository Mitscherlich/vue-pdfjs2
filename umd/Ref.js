"use strict";

exports.__esModule = true;
exports["default"] = void 0;

var Ref = /*#__PURE__*/function () {
  function Ref(_ref) {
    var num = _ref.num,
        gen = _ref.gen;
    this.num = num;
    this.gen = gen;
  }

  var _proto = Ref.prototype;

  _proto.toString = function toString() {
    var str = this.num + "R";

    if (this.gen !== 0) {
      str += this.gen;
    }

    return str;
  };

  return Ref;
}();

exports["default"] = Ref;