import Vue from 'vue';
import PropTypes from '../shared/vue-types';
import Component from 'vue-class-component';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf';

import PageContext from '../PageContext';

import { errorOnDev, isCancelException, makePageCallback, dispatchEvents } from '../shared/utils';

import { isRotate } from '../shared/propTypes';

export const PageSVGProps = {
  page: PropTypes.any.isRequired,
  rotate: isRotate,
  scale: PropTypes.number.isRequired,
};

@Component({
  name: 'PageSVG',
  props: PageSVGProps,
})
class PageSVGInternal extends Vue {
  svg = null;

  mounted() {
    this.drawPageOnContainer();
    this.renderSVG();
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

  get viewport() {
    const { page, rotate, scale } = this.$props;

    return page.getViewport({ scale, rotation: rotate });
  }

  async renderSVG() {
    const { page } = this.$props;

    this.renderer = page.getOperatorList();

    try {
      await this.renderer();

      const svgGfx = new pdfjs.SVGGraphics(page.commonObjs, page.objs);

      this.svg = await svgGfx.getSVG(operatorList, this.viewport);
      this.onRenderSuccess();
    } catch (error) {
      this.onRenderError(error);
    }
  }

  drawPageOnContainer(element = this.$el) {
    const { svg } = this;

    if (!element || !svg) {
      return;
    }

    // Append SVG element to the main container, if this hasn't been done already
    if (!element.firstElementChild) {
      element.appendChild(svg);
    }

    const { width, height } = this.viewport;
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
  }

  render() {
    const { width, height } = this.viewport;

    return (
      <div
        class="vue-pdf__Page__svg"
        style={{
          display: 'block',
          backgroundColor: 'white',
          overflow: 'hidden',
          width,
          height,
          userSelect: 'none',
        }}
      />
    );
  }
}

const PageSVG = ({ props }) => (
  <PageContext.Consumer
    customRender={(context) => <PageSVGInternal {...{ props: { ...context, ...props } }} />}
  />
);

export default PageSVG;
