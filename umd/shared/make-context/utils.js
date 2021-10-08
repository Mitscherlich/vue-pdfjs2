"use strict";

exports.__esModule = true;
exports.provide = provide;
exports.inject = inject;
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

  if (process.env.NODE_ENV !== 'production') {
    console.warn("injection \"" + String(key) + "\" not found.");
  }
}