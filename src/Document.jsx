import Vue from 'vue';
import Component from 'vue-class-component';
import PropTypes from 'vue-types';
import makeCancellable from 'make-cancellable-promise';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf';

import DocumentContext from './DocumentContext';
import Message from './Message';

import LinkService from './LinkService';
import PasswordResponses from './PasswordResponses';

import {
  cancelRunningTask,
  dataURItoByteString,
  displayCORSWarning,
  errorOnDev,
  isArrayBuffer,
  isBlob,
  isBrowser,
  isDataURI,
  isFile,
  loadFromFile,
  warnOnDev,
  dispatchEvents,
} from './shared/utils';

import { isFile as isFileProp } from './shared/propTypes';

const { PDFDataRangeTransport } = pdfjs;

export const DocumentProps = {
  options: PropTypes.object.def({}),
  error: PropTypes.any.def('Failed to load PDF file.'),
  file: isFileProp,
  imageResourcesPath: PropTypes.string,
  loading: PropTypes.any.def('Loading PDF…'),
  noData: PropTypes.any.def('No PDF file specified.'),
  onItemClick: PropTypes.func,
  onPassword: PropTypes.func.def((callback, reason) => {
    switch (reason) {
      case PasswordResponses.NEED_PASSWORD: {
        const password = prompt('Enter the password to open this PDF file.');
        callback(password);
        break;
      }
      case PasswordResponses.INCORRECT_PASSWORD: {
        const password = prompt('Invalid password. Please try again.');
        callback(password);
        break;
      }
      default:
    }
  }),
  renderMode: PropTypes.oneOf(['canvas', 'svg']),
  rotate: PropTypes.number,
};

@Component({
  props: DocumentProps,
  watch: {
    file: function (newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        this.loadDocument();
      }
    },
  },
})
export default class Document extends Vue {
  pdf = null;

  viewer = {
    scrollPageIntoView: ({ pageNumber }) => {
      // Handling jumping to internal links target
      const { onItemClick } = this.$props;

      // First, check if custom handling of onItemClick was provided
      if (onItemClick) {
        onItemClick({ pageNumber });
        return;
      }

      // If not, try to look for target page within the <Document>.
      const page = this.pages[pageNumber - 1];

      if (page) {
        // Scroll to the page automatically
        page.scrollIntoView();
        return;
      }

      warnOnDev(
        `----> <Document>
Warning: An internal link leading to page ${pageNumber} was clicked,
but neither <Document> was provided with onItemClick nor it was able to find the page within itself.
Either provide onItemClick to <Document> and handle navigating by yourself or ensure that all pages are rendered within <Document>.`
      );
    },
  };

  linkService = new LinkService();

  mounted() {
    this.loadDocument();
    this.setupLinkService();
  }

  beforeDestroy() {
    // If rendering is in progress, let's cancel it
    cancelRunningTask(this.runningTask);

    // If loading is in progress, let's destroy it
    if (this.loadingTask) {
      this.loadingTask.destroy();
    }
  }

  async loadDocument() {
    let source;
    try {
      source = await this.findDocumentSource();
    } catch (error) {
      this.onSourceError(error);
      return;
    }

    this.onSourceSuccess();

    if (!source) {
      return;
    }

    if (this.pdf) {
      this.pdf = null;
    }

    // If another rendering is in progress, let's cancel it
    cancelRunningTask(this.runningTask);

    // If another loading is in progress, let's destroy it
    if (this.loadingTask) {
      this.loadingTask.destroy();
    }

    const { options, onPassword } = this.$props;

    this.loadingTask = pdfjs.getDocument({ ...source, ...options });
    this.loadingTask.onPassword = onPassword;
    this.loadingTask.onProgress = ({ loaded, total }) => {
      dispatchEvents(this, 'progress load:progress', { loaded, total });
    };
    const cancelable = makeCancellable(this.loadingTask.promise);
    this.runningTask = cancelable;

    try {
      const pdf = await cancelable.promise;

      if (!this.pdf || this.pdf.fingerprint !== pdf.fingerprint) {
        this.pdf = pdf;
      }

      this.onLoadSuccess();
    } catch (error) {
      this.onLoadError(error);
    }
  }

  setupLinkService() {
    this.linkService.setViewer(this.viewer);
    const documentInstance = this;
    Object.defineProperty(this.linkService, 'externalLinkTarget', {
      get() {
        const { externalLinkTarget } = documentInstance;
        // prettier-ignore
        switch (externalLinkTarget) {
          case '_self': return 1;
          case '_blank': return 2;
          case '_parent': return 3;
          case '_top': return 4;
          default: return 0;
        }
      },
    });
  }

  get childContext() {
    const { linkService, registerPage, unregisterPage, pdf } = this;
    const { imageResourcesPath, renderMode, rotate } = this.$props;

    return {
      imageResourcesPath,
      linkService,
      pdf,
      registerPage,
      renderMode,
      rotate,
      unregisterPage,
    };
  }

  /**
   * Called when a document source is resolved correctly
   */
  onSourceSuccess() {
    dispatchEvents(this, 'success source:success');
  }

  /**
   * Called when a document source failed to be resolved correctly
   */
  onSourceError(error) {
    dispatchEvents(this, 'error source:error', error);
  }

  /**
   * Called when a document is read successfully
   */
  onLoadSuccess() {
    const { pdf } = this;

    this.pages = new Array(pdf.numPages);
    this.linkService.setDocument(pdf);

    this.$nextTick(() => {
      dispatchEvents(this, 'loaded load:success', pdf);
    });
  }

  /**
   * Called when a document failed to read successfully
   */
  onLoadError(error) {
    this.pdf = false;

    errorOnDev(error);

    dispatchEvents(this, 'error load:error', error);
  }

  /**
   * Finds a document source based on props.
   */
  async findDocumentSource() {
    const { file } = this.$props;

    if (!file) {
      return null;
    }

    // File is a string
    if (typeof file === 'string') {
      if (isDataURI(file)) {
        const fileByteString = dataURItoByteString(file);
        return { data: fileByteString };
      }

      displayCORSWarning();
      return { url: file };
    }

    // File is PDFDataRangeTransport
    if (file instanceof PDFDataRangeTransport) {
      return { range: file };
    }

    // File is an ArrayBuffer
    if (isArrayBuffer(file)) {
      return { data: file };
    }

    /**
     * The cases below are browser-only.
     * If you're running on a non-browser environment, these cases will be of no use.
     */
    if (isBrowser) {
      // File is a Blob
      if (isBlob(file) || isFile(file)) {
        const data = await loadFromFile(file);
        return { data };
      }
    }

    // At this point, file must be an object
    if (typeof file !== 'object') {
      throw new Error(
        'Invalid parameter in file, need either Uint8Array, string or a parameter object'
      );
    }

    if (!file.url && !file.data && !file.range) {
      throw new Error('Invalid parameter object: need either .data, .range or .url');
    }

    // File .url is a string
    if (typeof file.url === 'string') {
      if (isDataURI(file.url)) {
        const { url, ...otherParams } = file;
        const fileByteString = dataURItoByteString(url);
        return { data: fileByteString, ...otherParams };
      }

      displayCORSWarning();
    }

    return file;
  }

  registerPage(pageIndex, ref) {
    this.pages[pageIndex] = ref;
  }

  unregisterPage(pageIndex) {
    delete this.pages[pageIndex];
  }

  renderChildren() {
    return (
      <DocumentContext.Provider value={this.childContext}>
        {this.$slots['default']}
      </DocumentContext.Provider>
    );
  }

  renderContent() {
    const { pdf, file } = this;

    if (!file) {
      const { noData } = this.$props;

      <Message type="no-data">{typeof noData === 'function' ? noData() : noData}</Message>;
    }

    if (pdf === null) {
      const { loading } = this.$props;

      return (
        <Message type="loading">{typeof loading === 'function' ? loading() : loading}</Message>
      );
    }

    if (pdf === false) {
      const { error } = this.$props;

      return <Message type="error">{typeof error === 'function' ? error() : error}</Message>;
    }

    return this.renderChildren();
  }

  render() {
    return <div class="vue-pdf__Document">{this.renderContent()}</div>;
  }
}
