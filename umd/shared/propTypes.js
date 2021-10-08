"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.isRotate = exports.isRenderMode = exports.isPageNumber = exports.isPageIndex = exports.isLinkTarget = exports.isLinkService = exports.isFile = void 0;

var _vueTypes = _interopRequireDefault(require("vue-types"));

var _utils = require("./utils");

var _LinkService = _interopRequireDefault(require("../LinkService"));

var fileTypes = [_vueTypes["default"].string, _vueTypes["default"].instanceOf(ArrayBuffer), _vueTypes["default"].shape({
  data: _vueTypes["default"].oneOfType([_vueTypes["default"].object, _vueTypes["default"].string]),
  httpHeaders: _vueTypes["default"].object,
  range: _vueTypes["default"].object,
  url: _vueTypes["default"].string,
  withCredentials: _vueTypes["default"].bool
})];

if (typeof File !== 'undefined') {
  fileTypes.push(_vueTypes["default"].instanceOf(File));
}

if (typeof Blob !== 'undefined') {
  fileTypes.push(_vueTypes["default"].instanceOf(Blob));
}

var isFile = _vueTypes["default"].oneOfType(fileTypes);

exports.isFile = isFile;

var isLinkService = _vueTypes["default"].instanceOf(_LinkService["default"]);

exports.isLinkService = isLinkService;

var isLinkTarget = _vueTypes["default"].oneOf(['_self', '_blank', '_parent', '_top']);

exports.isLinkTarget = isLinkTarget;

var isPageIndex = function isPageIndex(props, propName, componentName) {
  var pageIndex = props[propName],
      pageNumber = props.pageNumber,
      pdf = props.pdf;

  if (!(0, _utils.isDefined)(pdf)) {
    return null;
  }

  if ((0, _utils.isDefined)(pageIndex)) {
    if (typeof pageIndex !== 'number') {
      return new Error("`" + propName + "` of type `" + typeof pageIndex + "` supplied to `" + componentName + "`, expected `number`.");
    }

    if (pageIndex < 0) {
      return new Error("Expected `" + propName + "` to be greater or equal to 0.");
    }

    var numPages = pdf.numPages;

    if (pageIndex + 1 > numPages) {
      return new Error("Expected `" + propName + "` to be less or equal to " + (numPages - 1) + ".");
    }
  } else if (!(0, _utils.isDefined)(pageNumber)) {
    return new Error("`" + propName + "` not supplied. Either pageIndex or pageNumber must be supplied to `" + componentName + "`.");
  } // Everything is fine


  return null;
};

exports.isPageIndex = isPageIndex;

var isPageNumber = function isPageNumber(props, propName, componentName) {
  var pageNumber = props[propName],
      pageIndex = props.pageIndex,
      pdf = props.pdf;

  if (!(0, _utils.isDefined)(pdf)) {
    return null;
  }

  if ((0, _utils.isDefined)(pageNumber)) {
    if (typeof pageNumber !== 'number') {
      return new Error("`" + propName + "` of type `" + typeof pageNumber + "` supplied to `" + componentName + "`, expected `number`.");
    }

    if (pageNumber < 1) {
      return new Error("Expected `" + propName + "` to be greater or equal to 1.");
    }

    var numPages = pdf.numPages;

    if (pageNumber > numPages) {
      return new Error("Expected `" + propName + "` to be less or equal to " + numPages + ".");
    }
  } else if (!(0, _utils.isDefined)(pageIndex)) {
    return new Error("`" + propName + "` not supplied. Either pageIndex or pageNumber must be supplied to `" + componentName + "`.");
  } // Everything is fine


  return null;
};

exports.isPageNumber = isPageNumber;

var isRenderMode = _vueTypes["default"].oneOf(['canvas', 'none', 'svg']);

exports.isRenderMode = isRenderMode;

var isRotate = _vueTypes["default"].oneOf([0, 90, 180, 270]);

exports.isRotate = isRotate;