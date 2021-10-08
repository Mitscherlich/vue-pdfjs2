import Vue from 'vue';
import PropTypes from 'vue-types';
import Component from 'vue-class-component';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf';
import makeCancellable from 'make-cancellable-promise';

import DocumentContext from '../DocumentContext';
import PageContext from '../PageContext';

import { cancelRunningTask, errorOnDev, dispatchEvents } from '../shared/utils';

import { isLinkService, isRotate } from '../shared/propTypes';

export const AnnotationLayerProps = {
  imageResourcesPath: PropTypes.string,
  linkService: isLinkService.isRequired,
  page: PropTypes.any,
  renderInteractiveForms: PropTypes.bool,
  rotate: isRotate,
  scale: PropTypes.number,
};

@Component({
  name: 'AnnotationLayer',
  props: AnnotationLayerProps,
  watch: {
    $props: function (props, prevProps) {
      const { page, renderInteractiveForms } = props;

      if (
        (prevProps.page && page !== prevProps.page) ||
        renderInteractiveForms !== prevProps.renderInteractiveForms
      ) {
        this.loadAnnotations();
      }
    },
  },
})
class AnnotationLayerInternal extends Vue {
  annotations = null;

  mounted() {
    const { page } = this.$props;

    if (!page) {
      throw new Error('Attempted to load page annotations, but no page was specified.');
    }

    this.annotationLayer = this.$el;
    this.loadAnnotations();
  }

  beforeDestroy() {
    cancelRunningTask(this.runningTask);
  }

  async loadAnnotations() {
    const { page } = this.$props;

    const cancellable = makeCancellable(page.getAnnotations());
    this.runningTask = cancellable;

    try {
      this.annotations = await cancellable.promise;
      this.onLoadSuccess();
    } catch (error) {
      this.onLoadError(error);
    }
  }

  onLoadSuccess() {
    const { annotations } = this;

    dispatchEvents(this, 'loaded annotations:loaded GetAnnotationsSuccess', annotations);
  }

  onLoadError(error) {
    this.annotations = false;

    errorOnDev(error);

    dispatchEvents(this, 'error annotations:error GetAnnotationsError', error);
  }

  onRenderSuccess() {
    dispatchEvents(this, 'rendered annotations:rendered RenderAnnotationLayerSuccess');
  }

  /**
   * Called when a annotations fails to render.
   */
  onRenderError(error) {
    errorOnDev(error);

    dispatchEvents(this, 'error annotations:error RenderAnnotationLayerError');
  }

  get viewport() {
    const { page, rotate, scale } = this.$props;

    return page.getViewport({ scale, rotation: rotate });
  }

  renderAnnotationLayer() {
    const { annotations } = this;

    if (!annotations) {
      return;
    }

    const { imageResourcesPath, linkService, page, renderInteractiveForms } = this.$props;

    const viewport = this.viewport.clone({ dontFlip: true });

    const parameters = {
      annotations,
      div: this.annotationLayer,
      imageResourcesPath,
      linkService,
      page,
      renderInteractiveForms,
      viewport,
    };

    this.annotationLayer.innerHTML = '';

    try {
      pdfjs.AnnotationLayer.render(parameters);
      this.onRenderSuccess();
    } catch (error) {
      this.onRenderError(error);
    }
  }

  render() {
    return (
      <div class="vue-pdf__Page__annotations annotationLayer">{this.renderAnnotationLayer()}</div>
    );
  }
}

const AnnotationLayer = ({ props }) => (
  <DocumentContext.Consumer>
    {(documentContext) => (
      <PageContext.Consumer>
        {(pageContext) => (
          <AnnotationLayerInternal
            {...{ props: { ...documentContext, ...pageContext, ...props } }}
          />
        )}
      </PageContext.Consumer>
    )}
  </DocumentContext.Consumer>
);

export default AnnotationLayer;
