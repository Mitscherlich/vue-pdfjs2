import Vue from 'vue';
import Component from 'vue-class-component';
import PropTypes from './shared/vue-types';
import makeCancellable from 'make-cancellable-promise';

import DocumentContext from './DocumentContext';
import PageContext from './PageContext';

import Message from './Message';
import PageCanvas from './Page/PageCanvas';
import PageSVG from './Page/PageSVG';
import TextLayer from './Page/TextLayer';
import AnnotationLayer from './Page/AnnotationLayer';

import {
  cancelRunningTask,
  errorOnDev,
  isProvided,
  makePageCallback,
  dispatchEvents,
} from './shared/utils';

import { isRenderMode, isRotate } from './shared/propTypes';

const defaultScale = 1;

const PageProps = {
  customTextRenderer: PropTypes.func,
  error: PropTypes.any.def('Failed to load the page.'),
  height: PropTypes.number,
  imageResourcesPath: PropTypes.string,
  loading: PropTypes.any.def('Loading page…'),
  noData: PropTypes.any.def('No page specified.'),
  pageIndex: PropTypes.any,
  pageNumber: PropTypes.any,
  pdf: PropTypes.any,
  registerPage: PropTypes.func,
  renderAnnotation: PropTypes.bool.def(true),
  renderInteractiveForms: PropTypes.bool.def(false),
  renderMode: isRenderMode.def('canvas'),
  renderTextLayer: PropTypes.bool.def(true),
  rotate: isRotate,
  scale: PropTypes.number.def(defaultScale),
  unregisterPage: PropTypes.func,
  width: PropTypes.number,
};

@Component({
  name: 'Page',
  props: PageProps,
  watch: {
    $props: function (props, prevProps) {
      const { pdf } = props;

      if (
        (prevProps.pdf && pdf !== prevProps.pdf) ||
        this.getPageNumber() !== this.getPageNumber(prevProps)
      ) {
        const { unregisterPage } = props;

        if (unregisterPage) {
          unregisterPage(this.getPageIndex(prevProps));
        }

        this.loadPage();
      }
    },
  },
})
class PageInternal extends Vue {
  page = null;

  mounted() {
    if (!this.pdf) {
      throw new Error('Attempted to load a page, but no document was specified.');
    }

    this.loadPage();
  }

  beforeDestroy() {
    const { unregisterPage } = this.$props;

    if (unregisterPage) {
      unregisterPage(this.getPageIndex());
    }

    cancelRunningTask(this.runningTask);
  }

  get childContext() {
    const { page } = this;

    if (!page) {
      return {};
    }

    const { customTextRenderer, renderInteractiveForms } = this.$props;

    return {
      customTextRenderer,
      page,
      renderInteractiveForms,
      rotate: this.getRotate(),
      scale: this.getScale(),
    };
  }

  /**
   * Called when a page is loaded successfully
   */
  onLoadSuccess() {
    const { page, registerPage } = this;

    dispatchEvents(this, 'loaded load:success', makePageCallback(page, this.getScale()));

    if (registerPage) {
      registerPage(this.pageIndex, this.$refs.pageRef);
    }
  }

  /**
   * Called when a page failed to load
   */
  onLoadError(error) {
    errorOnDev(error);

    dispatchEvents(this, 'error load:error', error);
  }

  getPageIndex(props = this.$props) {
    if (isProvided(props.pageNumber)) {
      return props.pageNumber - 1;
    }

    if (isProvided(props.pageIndex)) {
      return props.pageIndex;
    }

    return null;
  }

  getPageNumber(props = this.$props) {
    if (isProvided(props.pageNumber)) {
      return props.pageNumber;
    }

    if (isProvided(props.pageIndex)) {
      return props.pageIndex + 1;
    }

    return null;
  }

  getRotate() {
    const { rotate } = this.$props;

    if (isProvided(rotate)) {
      return rotate;
    }

    const { page } = this;

    if (!page) {
      return null;
    }

    return page.rotate;
  }

  getScale() {
    const { page } = this;

    if (!page) {
      return null;
    }

    const { scale, width, height } = this.$props;
    const { rotate } = this;

    // Be default, we'll render page at 100% * scale width.
    let pageScale = 1;

    // Passing scale explicitly null would cause the page not to render
    const scaleWithDefault = scale === null ? defaultScale : scale;

    // If width/height is defined, calculate the scale of the page so it could be of desired width.
    if (width || height) {
      const viewport = page.getViewport({ scale: 1, rotation: rotate });
      pageScale = width ? width / viewport.width : height / viewport.height;
    }

    return scaleWithDefault * pageScale;
  }

  get pageKey() {
    return `${this.page.pageIndex}@${this.getScale()}/${this.getRotate()}`;
  }

  get pageKeyNoScale() {
    return `${this.page.pageIndex}/${this.getRotate()}`;
  }

  async loadPage() {
    const { pdf } = this.$props;

    const pageNumber = this.getPageNumber();

    if (!pageNumber) {
      return;
    }

    if (this.page) {
      this.page = null;
    }

    const cancellable = makeCancellable(pdf.getPage(pageNumber));
    this.runningTask = cancellable;

    try {
      this.page = await cancellable.promise;
      this.onLoadSuccess();
    } catch (error) {
      this.page = false;
      this.onLoadError(error);
    }
  }

  genMainLayer() {
    const { renderMode } = this.$props;

    switch (renderMode) {
      case 'none':
        return null;
      case 'svg':
        return <PageSVG key={`${this.pageKeyNoScale}_svg`} page={this.page} />;
      case 'canvas':
      default:
        return (
          <PageCanvas key={`${this.pageKey}_canvas`} page={this.page} scale={this.getScale()} />
        );
    }
  }

  genTextLayer() {
    const { renderTextLayer } = this.$props;

    if (!renderTextLayer) {
      return null;
    }

    return <TextLayer key={`${this.pageKey}_text`} page={this.page} />;
  }

  genAnnotationLayer() {
    const { renderAnnotation } = this.$props;

    if (!renderAnnotation) {
      return null;
    }

    /**
     * As of now, PDF.js 2.0.943 returns warnings on unimplemented annotations in SVG mode.
     * Therefore, as a fallback, we render "traditional" AnnotationLayer component.
     */

    return <AnnotationLayer key={`${this.pageKey}_annotations`} page={this.page} />;
  }

  renderChildren() {
    return (
      <PageContext.Provider value={this.childContext}>
        {this.genMainLayer()}
        {this.genTextLayer()}
        {this.genAnnotationLayer()}
        {this.$slots['default']}
      </PageContext.Provider>
    );
  }

  renderContent() {
    const { page, pageNumber, pdf } = this;

    if (!pageNumber) {
      const { noData } = this.$props;

      return <Message type="no-data">{typeof noData === 'function' ? noData() : noData}</Message>;
    }

    if (pdf === null || page === null) {
      const { loading } = this.$props;

      return (
        <Message type="loading">{typeof loading === 'function' ? loading() : loading}</Message>
      );
    }

    if (pdf === false || page === false) {
      const { error } = this.$props;

      return <Message type="error">{typeof error === 'function' ? error() : error}</Message>;
    }

    return this.renderChildren();
  }

  render() {
    const { pageNumber } = this;

    return (
      <div
        class="vue-pdf__Page"
        data-page-number={pageNumber}
        ref="pageRef"
        style="position: relative"
      >
        {this.renderContent()}
      </div>
    );
  }
}

const Page = ({ props }) => (
  <DocumentContext.Consumer
    customRender={(context) => <PageInternal {...{ props: { ...context, ...props } }} />}
  />
);

export default Page;
