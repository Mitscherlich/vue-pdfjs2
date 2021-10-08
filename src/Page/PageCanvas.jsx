import Vue from 'vue';
import PropTypes from 'vue-types';
import Component from 'vue-class-component';

import PageContext from '../PageContext';

import {
  errorOnDev,
  getPixelRatio,
  isCancelException,
  makePageCallback,
  dispatchEvents,
} from '../shared/utils';

import { isRef, isRotate } from '../shared/propTypes';

export const PageCanvasProps = {
  canvasRef: isRef,
  page: PropTypes.any.isRequired,
  renderInteractiveForms: PropTypes.bool,
  rotate: isRotate,
  scale: PropTypes.number.isRequired,
};

@Component({
  name: 'PageCanvas',
  props: PageCanvasProps,
  watch: {
    $props: function (props, prevProps) {
      const { page, renderInteractiveForms } = props;
      if (renderInteractiveForms !== prevProps.renderInteractiveForms) {
        // Ensures the canvas will be re-rendered from scratch. Otherwise all form data will stay.
        page.cleanup();
        this.drawPageOnCanvas();
      }
    },
  },
})
class PageCanvasInternal extends Vue {
  mounted() {
    this.canvasLayer = this.$el;
    this.drawPageOnCanvas();
  }

  beforeDestroy() {
    this.cancelRenderingTask();

    /**
     * Zeroing the width and height cause most browsers to release graphics
     * resources immediately, which can greatly reduce memory consumption.
     */
    if (this.canvasLayer) {
      this.canvasLayer.width = 0;
      this.canvasLayer.height = 0;
      this.canvasLayer = null;
    }
  }

  cancelRenderingTask() {
    if (this.renderer) {
      this.renderer.cancel();
      this.renderer = null;
    }
  }

  /**
   * Called when a page is rendered successfully.
   */
  onRenderSuccess() {
    this.renderer = null;

    const { page, scale } = this.$props;

    dispatchEvents(this, 'rendered render:success renderSuccess', makePageCallback(page, scale));
  }

  /**
   * Called when a page fails to render.
   */
  onRenderError(error) {
    if (isCancelException(error)) {
      return;
    }

    errorOnDev(error);

    dispatchEvents(this, 'error render:error renderError', error);
  }

  get renderViewport() {
    const { page, rotate, scale } = this.$props;

    const pixelRatio = getPixelRatio();

    return page.getViewport({ scale: scale * pixelRatio, rotation: rotate });
  }

  get viewport() {
    const { page, rotate, scale } = this.$props;

    return page.getViewport({ scale, rotation: rotate });
  }

  drawPageOnCanvas() {
    if (!this.page) {
      return null;
    }

    const { canvasLayer: canvas } = this;

    if (!canvas) {
      return null;
    }

    const { renderViewport, viewport } = this;
    const { page, renderInteractiveForms } = this.$props;

    canvas.width = renderViewport.width;
    canvas.height = renderViewport.height;

    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    const renderContext = {
      get canvasContext() {
        return canvas.getContext('2d');
      },
      viewport: renderViewport,
      renderInteractiveForms,
    };

    // If another render is in progress, let's cancel it
    this.cancelRenderingTask();

    this.renderer = page.render(renderContext);

    return this.renderer.promise.then(this.onRenderSuccess).catch(this.onRenderError);
  }

  render() {
    return (
      <canvas
        class="vue-pdf__Page__canvas"
        dir="ltr"
        style={{ display: 'block', userSelect: 'none' }}
      />
    );
  }
}

const PageCanvas = ({ props }) => (
  <PageContext.Consumer>
    {(context) => <PageCanvasInternal {...{ props: { ...context, ...props } }} />}
  </PageContext.Consumer>
);

export default PageCanvas;
