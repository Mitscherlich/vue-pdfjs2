"use strict";

exports.__esModule = true;
exports.inject = inject;
exports.provide = provide;

var _utils = require("../utils");

var provides = {};

function provide(key, value) {
  provides[key] = value;
}

function inject(key, defaultValue) {
  if (key in provides) {
    return provides[key];
  }

  if (arguments.length > 1) {
    return defaultValue;
  }

  (0, _utils.warnOnDev)("injection \"" + String(key) + "\" not found.");
}