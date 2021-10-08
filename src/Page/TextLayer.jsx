import Vue from 'vue';
import PropTypes from 'vue-types';
import Component from 'vue-class-component';
import makeCancellable from 'make-cancellable-promise';

import PageContext from '../PageContext';

import TextLayerItem from './TextLayerItem';

import { cancelRunningTask, errorOnDev, dispatchEvents } from '../shared/utils';

import { isRotate } from '../shared/propTypes';

export const TextLayerProps = {
  onGetTextError: PropTypes.func,
  onGetTextSuccess: PropTypes.func,
  page: PropTypes.any.isRequired,
  rotate: isRotate,
  scale: PropTypes.number,
};

@Component({
  name: 'TextLayer',
  props: TextLayerProps,
  watch: {
    $props: function (props, prevProps) {
      const { page } = props;

      if (prevProps.page && page !== prevProps.page) {
        this.loadTextItems();
      }
    },
  },
})
class TextLayerInternal extends Vue {
  textItems = null;

  mounted() {
    const { page } = this.$props;

    if (!page) {
      throw new Error('Attempted to load page text content, but no page was specified.');
    }

    this.loadTextItems();
  }

  beforeDestroy() {
    cancelRunningTask(this.runningTask);
  }

  async loadTextItems() {
    const { page } = this.$props;

    const cancellable = makeCancellable(page.getTextContent());
    this.runningTask = cancellable;

    try {
      const { items: textItems } = await cancellable.promise;
      this.textItems = textItems;
      this.onLoadSuccess();
    } catch (error) {
      this.onLoadError(error);
    }
  }

  onLoadSuccess() {
    const { textItems } = this;

    dispatchEvents(this, 'loaded text:loaded getTextSuccess', textItems);
  }

  onLoadError(error) {
    this.textItems = false;

    errorOnDev(error);

    dispatchEvents(this, 'error text:error getTextError', error);
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

  renderTextItems() {
    const { textItems } = this;

    if (!textItems) {
      return null;
    }

    return textItems.map((textItem, itemIndex) => (
      <TextLayerItem key={itemIndex} {...{ props: { ...textItem, itemIndex } }} />
    ));
  }

  render() {
    if (!this.page) {
      return null;
    }

    const { unRotatedViewport: viewport } = this;
    const rotate = this.getRotate();

    return (
      <div
        class="vue-pdf__Page__textContent"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: `${viewport.width}px`,
          height: `${viewport.height}px`,
          color: 'transparent',
          transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
          WebkitTransform: `translate(-50%, -50%) rotate(${rotate}deg)`,
          pointerEvents: 'none',
        }}
      >
        {this.renderTextItems()}
      </div>
    );
  }
}

const TextLayer = ({ props }) => (
  <PageContext.Consumer
    customRender={(context) => <TextLayerInternal {...{ props: { ...context, ...props } }} />}
  />
);

export default TextLayer;
