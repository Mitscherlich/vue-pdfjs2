import Vue from 'vue';
import PropTypes from 'vue-types';
import Component from 'vue-class-component';

import PageContext from '../PageContext';

import { isRotate } from '../shared/propTypes';

export const TextLayerItemProps = {
  customTextRenderer: PropTypes.func,
  fontName: PropTypes.string.isRequired,
  itemIndex: PropTypes.number.isRequired,
  page: PropTypes.any.isRequired,
  rotate: isRotate,
  scale: PropTypes.number,
  str: PropTypes.string.isRequired,
  transform: PropTypes.arrayOf(PropTypes.number).isRequired,
  width: PropTypes.number.isRequired,
};

@Component({
  name: 'TextLayerItem',
  props: TextLayerItemProps,
})
class TextLayerItemInternal extends Vue {
  mounted() {
    this.alignTextItem();
  }

  updated() {
    this.alignTextItem();
  }

  get unRotatedViewport() {
    const { page, scale } = this.$props;

    return page.getViewport({ scale });
  }

  /**
   * It might happen that the page is rotated by default. In such cases, we shouldn't rotate
   * text content.
   */
  getRotate() {
    const { page, rotate } = this.$props;
    return rotate - page.rotate;
  }

  get sideways() {
    return this.getRotate() % 180 !== 0;
  }

  get defaultSideways() {
    const { rotation } = this.unRotatedViewport;
    return rotation % 180 !== 0;
  }

  get fontSize() {
    const { transform, defaultSideways } = this;
    const [fontHeightPx, fontWidthPx] = transform;
    return defaultSideways ? fontWidthPx : fontHeightPx;
  }

  get top() {
    const { transform, unRotatedViewport: viewport, defaultSideways } = this;
    const [, , /* fontHeightPx */ /* fontWidthPx */ offsetX, offsetY, x, y] = transform;
    const [, /* xMin */ yMin /* xMax */, , yMax] = viewport.viewBox;
    return defaultSideways ? x + offsetX + yMin : yMax - (y + offsetY);
  }

  get left() {
    const { transform, unRotatedViewport: viewport, defaultSideways } = this;
    const [, , , , /* fontHeightPx */ /* fontWidthPx */ /* offsetX */ /* offsetY */ x, y] =
      transform;
    const [xMin] = viewport.viewBox;
    return defaultSideways ? y - xMin : x - xMin;
  }

  getFontData(fontName) {
    const { page } = this.$props;

    return new Promise((resolve) => {
      page.commonObjs.get(fontName, resolve);
    });
  }

  alignTextItem() {
    const element = this.$el;

    if (!element || !element.style) {
      return;
    }

    element.style.transform = '';

    const { fontName, scale, width } = this.$props;

    element.style.fontFamily = `${fontName}, sans-serif`;

    this.getFontData(fontName).then((fontData) => {
      const fallbackFontName = fontData ? fontData.fallbackName : 'sans-serif';
      element.style.fontFamily = `${fontName}, ${fallbackFontName}`;

      const targetWidth = width * scale;
      const actualWidth = this.getElementWidth(element);

      let transform = `scaleX(${targetWidth / actualWidth})`;

      const ascent = fontData ? fontData.ascent : 0;
      if (ascent) {
        transform += ` translateY(${(1 - ascent) * 100}%)`;
      }

      element.style.transform = transform;
      element.style.WebkitTransform = transform;
    });
  }

  getElementWidth(element) {
    const { sideways } = this;
    return element.getBoundingClientRect()[sideways ? 'height' : 'width'];
  }

  render() {
    const { fontSize, top, left, customTextRenderer, scale, str: text } = this;

    return (
      <span
        style={{
          height: '1em',
          fontFamily: 'sans-serif',
          fontSize: `${fontSize * scale}px`,
          position: 'absolute',
          top: `${top * scale}px`,
          left: `${left * scale}px`,
          transformOrigin: 'left bottom',
          whiteSpace: 'pre',
          pointerEvents: 'all',
        }}
      >
        {customTextRenderer ? customTextRenderer(this.$props) : text}
      </span>
    );
  }
}

const TextLayerItem = ({ props }) => (
  <PageContext.Consumer
    customRender={(context) => <TextLayerItemInternal {...{ props: { ...context, ...props } }} />}
  />
);

export default TextLayerItem;
