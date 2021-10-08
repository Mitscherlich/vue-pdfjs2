import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/objectWithoutPropertiesLoose";
import _extends from "@babel/runtime/helpers/extends";
import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import _createClass from "@babel/runtime/helpers/createClass";
import _inheritsLoose from "@babel/runtime/helpers/inheritsLoose";
var _excluded = ["url"];

var _dec, _class;

import _regeneratorRuntime from "@babel/runtime/regenerator";
import Vue from 'vue';
import Component from 'vue-class-component';
import PropTypes from 'vue-types';
import makeCancellable from 'make-cancellable-promise';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf';
import DocumentContext from './DocumentContext';
import Message from './Message';
import LinkService from './LinkService';
import PasswordResponses from './PasswordResponses';
import { cancelRunningTask, dataURItoByteString, displayCORSWarning, errorOnDev, isArrayBuffer, isBlob, isBrowser, isDataURI, isFile, loadFromFile, warnOnDev, dispatchEvents } from './shared/utils';
import { isFile as isFileProp } from './shared/propTypes';
var PDFDataRangeTransport = pdfjs.PDFDataRangeTransport;
export var DocumentProps = {
  options: PropTypes.object.def({}),
  error: PropTypes.any.def('Failed to load PDF file.'),
  file: isFileProp,
  imageResourcesPath: PropTypes.string,
  loading: PropTypes.any.def('Loading PDF…'),
  noData: PropTypes.any.def('No PDF file specified.'),
  onItemClick: PropTypes.func,
  onPassword: PropTypes.func.def(function (callback, reason) {
    switch (reason) {
      case PasswordResponses.NEED_PASSWORD:
        {
          var password = prompt('Enter the password to open this PDF file.');
          callback(password);
          break;
        }

      case PasswordResponses.INCORRECT_PASSWORD:
        {
          var _password = prompt('Invalid password. Please try again.');

          callback(_password);
          break;
        }

      default:
    }
  }),
  renderMode: PropTypes.oneOf(['canvas', 'svg']),
  rotate: PropTypes.number
};
var Document = (_dec = Component({
  props: DocumentProps,
  watch: {
    file: function file(newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        this.loadDocument();
      }
    }
  }
}), _dec(_class = /*#__PURE__*/function (_Vue) {
  _inheritsLoose(Document, _Vue);

  function Document() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _Vue.call.apply(_Vue, [this].concat(args)) || this;
    _this.pdf = null;
    _this.viewer = {
      scrollPageIntoView: function scrollPageIntoView(_ref) {
        var pageNumber = _ref.pageNumber;
        // Handling jumping to internal links target
        var onItemClick = _this.$props.onItemClick; // First, check if custom handling of onItemClick was provided

        if (onItemClick) {
          onItemClick({
            pageNumber: pageNumber
          });
          return;
        } // If not, try to look for target page within the <Document>.


        var page = _this.pages[pageNumber - 1];

        if (page) {
          // Scroll to the page automatically
          page.scrollIntoView();
          return;
        }

        warnOnDev("----> <Document>\nWarning: An internal link leading to page " + pageNumber + " was clicked,\nbut neither <Document> was provided with onItemClick nor it was able to find the page within itself.\nEither provide onItemClick to <Document> and handle navigating by yourself or ensure that all pages are rendered within <Document>.");
      }
    };
    _this.linkService = new LinkService();
    return _this;
  }

  var _proto = Document.prototype;

  _proto.mounted = function mounted() {
    this.loadDocument();
    this.setupLinkService();
  };

  _proto.beforeDestroy = function beforeDestroy() {
    // If rendering is in progress, let's cancel it
    cancelRunningTask(this.runningTask); // If loading is in progress, let's destroy it

    if (this.loadingTask) {
      this.loadingTask.destroy();
    }
  };

  _proto.loadDocument = /*#__PURE__*/function () {
    var _loadDocument = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
      var _this2 = this;

      var source, _this$$props, options, onPassword, cancelable, pdf;

      return _regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return this.findDocumentSource();

            case 3:
              source = _context.sent;
              _context.next = 10;
              break;

            case 6:
              _context.prev = 6;
              _context.t0 = _context["catch"](0);
              this.onSourceError(_context.t0);
              return _context.abrupt("return");

            case 10:
              this.onSourceSuccess();

              if (source) {
                _context.next = 13;
                break;
              }

              return _context.abrupt("return");

            case 13:
              if (this.pdf) {
                this.pdf = null;
              } // If another rendering is in progress, let's cancel it


              cancelRunningTask(this.runningTask); // If another loading is in progress, let's destroy it

              if (this.loadingTask) {
                this.loadingTask.destroy();
              }

              _this$$props = this.$props, options = _this$$props.options, onPassword = _this$$props.onPassword;
              this.loadingTask = pdfjs.getDocument(_extends({}, source, options));
              this.loadingTask.onPassword = onPassword;

              this.loadingTask.onProgress = function (_ref2) {
                var loaded = _ref2.loaded,
                    total = _ref2.total;
                dispatchEvents(_this2, 'progress load:progress', {
                  loaded: loaded,
                  total: total
                });
              };

              cancelable = makeCancellable(this.loadingTask.promise);
              this.runningTask = cancelable;
              _context.prev = 22;
              _context.next = 25;
              return cancelable.promise;

            case 25:
              pdf = _context.sent;

              if (!this.pdf || this.pdf.fingerprint !== pdf.fingerprint) {
                this.pdf = pdf;
              }

              this.onLoadSuccess();
              _context.next = 33;
              break;

            case 30:
              _context.prev = 30;
              _context.t1 = _context["catch"](22);
              this.onLoadError(_context.t1);

            case 33:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[0, 6], [22, 30]]);
    }));

    function loadDocument() {
      return _loadDocument.apply(this, arguments);
    }

    return loadDocument;
  }();

  _proto.setupLinkService = function setupLinkService() {
    this.linkService.setViewer(this.viewer);
    var documentInstance = this;
    Object.defineProperty(this.linkService, 'externalLinkTarget', {
      get: function get() {
        var externalLinkTarget = documentInstance.externalLinkTarget; // prettier-ignore

        switch (externalLinkTarget) {
          case '_self':
            return 1;

          case '_blank':
            return 2;

          case '_parent':
            return 3;

          case '_top':
            return 4;

          default:
            return 0;
        }
      }
    });
  };

  /**
   * Called when a document source is resolved correctly
   */
  _proto.onSourceSuccess = function onSourceSuccess() {
    dispatchEvents(this, 'success source:success');
  }
  /**
   * Called when a document source failed to be resolved correctly
   */
  ;

  _proto.onSourceError = function onSourceError(error) {
    dispatchEvents(this, 'error source:error', error);
  }
  /**
   * Called when a document is read successfully
   */
  ;

  _proto.onLoadSuccess = function onLoadSuccess() {
    var _this3 = this;

    var pdf = this.pdf;
    this.pages = new Array(pdf.numPages);
    this.linkService.setDocument(pdf);
    this.$nextTick(function () {
      dispatchEvents(_this3, 'loaded load:success', pdf);
    });
  }
  /**
   * Called when a document failed to read successfully
   */
  ;

  _proto.onLoadError = function onLoadError(error) {
    this.pdf = false;
    errorOnDev(error);
    dispatchEvents(this, 'error load:error loadError', error);
  }
  /**
   * Finds a document source based on props.
   */
  ;

  _proto.findDocumentSource =
  /*#__PURE__*/
  function () {
    var _findDocumentSource = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2() {
      var file, fileByteString, data, url, otherParams, _fileByteString;

      return _regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              file = this.$props.file;

              if (file) {
                _context2.next = 3;
                break;
              }

              return _context2.abrupt("return", null);

            case 3:
              if (!(typeof file === 'string')) {
                _context2.next = 9;
                break;
              }

              if (!isDataURI(file)) {
                _context2.next = 7;
                break;
              }

              fileByteString = dataURItoByteString(file);
              return _context2.abrupt("return", {
                data: fileByteString
              });

            case 7:
              displayCORSWarning();
              return _context2.abrupt("return", {
                url: file
              });

            case 9:
              if (!(file instanceof PDFDataRangeTransport)) {
                _context2.next = 11;
                break;
              }

              return _context2.abrupt("return", {
                range: file
              });

            case 11:
              if (!isArrayBuffer(file)) {
                _context2.next = 13;
                break;
              }

              return _context2.abrupt("return", {
                data: file
              });

            case 13:
              if (!isBrowser) {
                _context2.next = 19;
                break;
              }

              if (!(isBlob(file) || isFile(file))) {
                _context2.next = 19;
                break;
              }

              _context2.next = 17;
              return loadFromFile(file);

            case 17:
              data = _context2.sent;
              return _context2.abrupt("return", {
                data: data
              });

            case 19:
              if (!(typeof file !== 'object')) {
                _context2.next = 21;
                break;
              }

              throw new Error('Invalid parameter in file, need either Uint8Array, string or a parameter object');

            case 21:
              if (!(!file.url && !file.data && !file.range)) {
                _context2.next = 23;
                break;
              }

              throw new Error('Invalid parameter object: need either .data, .range or .url');

            case 23:
              if (!(typeof file.url === 'string')) {
                _context2.next = 29;
                break;
              }

              if (!isDataURI(file.url)) {
                _context2.next = 28;
                break;
              }

              url = file.url, otherParams = _objectWithoutPropertiesLoose(file, _excluded);
              _fileByteString = dataURItoByteString(url);
              return _context2.abrupt("return", _extends({
                data: _fileByteString
              }, otherParams));

            case 28:
              displayCORSWarning();

            case 29:
              return _context2.abrupt("return", file);

            case 30:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function findDocumentSource() {
      return _findDocumentSource.apply(this, arguments);
    }

    return findDocumentSource;
  }();

  _proto.registerPage = function registerPage(pageIndex, ref) {
    this.pages[pageIndex] = ref;
  };

  _proto.unregisterPage = function unregisterPage(pageIndex) {
    delete this.pages[pageIndex];
  };

  _proto.renderChildren = function renderChildren() {
    var h = this.$createElement;
    return h(DocumentContext.Provider, {
      "attrs": {
        "value": this.childContext
      }
    }, [this.$slots['default']]);
  };

  _proto.renderContent = function renderContent() {
    var h = this.$createElement;
    var pdf = this.pdf,
        file = this.file;

    if (!file) {
      var noData = this.$props.noData;
      h(Message, {
        "attrs": {
          "type": "no-data"
        }
      }, [typeof noData === 'function' ? noData() : noData]);
    }

    if (pdf === null) {
      var loading = this.$props.loading;
      return h(Message, {
        "attrs": {
          "type": "loading"
        }
      }, [typeof loading === 'function' ? loading() : loading]);
    }

    if (pdf === false) {
      var error = this.$props.error;
      return h(Message, {
        "attrs": {
          "type": "error"
        }
      }, [typeof error === 'function' ? error() : error]);
    }

    return this.renderChildren();
  };

  _proto.render = function render() {
    var h = arguments[0];
    return h("div", {
      "class": "vue-pdf__Document"
    }, [this.renderContent()]);
  };

  _createClass(Document, [{
    key: "childContext",
    get: function get() {
      var linkService = this.linkService,
          registerPage = this.registerPage,
          unregisterPage = this.unregisterPage,
          pdf = this.pdf;
      var _this$$props2 = this.$props,
          imageResourcesPath = _this$$props2.imageResourcesPath,
          renderMode = _this$$props2.renderMode,
          rotate = _this$$props2.rotate;
      return {
        imageResourcesPath: imageResourcesPath,
        linkService: linkService,
        pdf: pdf,
        registerPage: registerPage,
        renderMode: renderMode,
        rotate: rotate,
        unregisterPage: unregisterPage
      };
    }
  }]);

  return Document;
}(Vue)) || _class);
export { Document as default };