"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.pdfjs = void 0;

var pdfjs = _interopRequireWildcard(require("pdfjs-dist/legacy/build/pdf"));

exports.pdfjs = pdfjs;

var _Document = _interopRequireDefault(require("./Document"));

exports.Document = _Document["default"];

var _Page = _interopRequireDefault(require("./Page"));

exports.Page = _Page["default"];

var _utils = require("./shared/utils");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// import Outline from './Outline';
if (_utils.isLocalFileSystem) {
  (0, _utils.warnOnDev)("You are running VuePDF from your local file system.\nPDF.js Worker may fail to load due to browser's security policies.\nIf you're on Google Chrome, you can use --allow-file-access-from-files flag for debugging purposes.");
}

if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjs.GlobalWorkerOptions.workerPort = new Worker('./pdf.worker.entry.js');
}