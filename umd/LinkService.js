"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

/* Copyright 2015 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var LinkService = /*#__PURE__*/function () {
  function LinkService() {
    this.externalLinkTarget = null;
    this.externalLinkRel = null;
    this.externalLinkEnabled = true;
  }

  var _proto = LinkService.prototype;

  _proto.setDocument = function setDocument(pdfDocument) {
    this.pdfDocument = pdfDocument;
  };

  _proto.setViewer = function setViewer(pdfViewer) {
    this.pdfViewer = pdfViewer;
  };

  _proto.setHistory = function setHistory() {// TODO: implement or delete this
  };

  _proto.goToDestination = function goToDestination(dest) {
    var _this = this;

    new Promise(function (resolve) {
      if (typeof dest === 'string') {
        _this.pdfDocument.getDestination(dest).then(resolve);
      } else {
        dest.then(resolve);
      }
    }).then(function (explicitDest) {
      if (!Array.isArray(explicitDest)) {
        throw new Error("\"" + explicitDest + "\" is not a valid destination array.");
      }

      var destRef = explicitDest[0];
      new Promise(function (resolve) {
        if (destRef instanceof Object) {
          _this.pdfDocument.getPageIndex(destRef).then(function (pageIndex) {
            resolve(pageIndex + 1);
          })["catch"](function () {
            throw new Error("\"" + destRef + "\" is not a valid page reference.");
          });
        } else if (typeof destRef === 'number') {
          resolve(destRef + 1);
        } else {
          throw new Error("\"" + destRef + "\" is not a valid destination reference.");
        }
      }).then(function (pageNumber) {
        if (!pageNumber || pageNumber < 1 || pageNumber > _this.pagesCount) {
          throw new Error("\"" + pageNumber + "\" is not a valid page number.");
        }

        _this.pdfViewer.scrollPageIntoView({
          pageNumber: pageNumber
        });
      });
    });
  };

  _proto.navigateTo = function navigateTo(dest) {
    this.goToDestination(dest);
  };

  _proto.goToPage = function goToPage() {// TODO: implement or delete this
  };

  _proto.getDestinationHash = function getDestinationHash() {
    return '#';
  };

  _proto.getAnchorUrl = function getAnchorUrl() {
    return '#';
  };

  _proto.setHash = function setHash() {// TODO: implement or delete this
  };

  _proto.executeNamedAction = function executeNamedAction() {// TODO: implement or delete this
  };

  _proto.cachePageRef = function cachePageRef() {// TODO: implement or delete this
  };

  _proto.isPageVisible = function isPageVisible() {
    return true;
  };

  _proto.isPageCached = function isPageCached() {
    return true;
  };

  (0, _createClass2["default"])(LinkService, [{
    key: "pagesCount",
    get: function get() {
      return this.pdfDocument ? this.pdfDocument.numPages : 0;
    }
  }, {
    key: "page",
    get: function get() {
      return this.pdfViewer.currentPageNumber;
    },
    set: function set(value) {
      this.pdfViewer.currentPageNumber = value;
    }
  }, {
    key: "rotation",
    get: function get() {
      return 0;
    },
    set: function set(value) {// TODO: implement or delete this
    }
  }]);
  return LinkService;
}();

exports["default"] = LinkService;