import Vue from 'vue';
import PropTypes from 'vue-types';
import Component from 'vue-class-component';
import makeCancellable from 'make-cancellable-promise';

import DocumentContext from './DocumentContext';
import OutlineContext from './OutlineContext';

import OutlineItem from './OutlineItem';

import { cancelRunningTask, errorOnDev, dispatchEvents } from './shared/utils';

const OutlinePropTypes = {
  pdf: PropTypes.any,
};

@Component({
  name: 'Outline',
  props: OutlinePropTypes,
  watch: {
    $props: function (props, prevProps) {
      const { pdf } = props;

      if (prevProps.pdf && pdf !== prevProps.pdf) {
        this.loadOutline();
      }
    },
  },
})
class OutlineInternal extends Vue {
  outline = null;

  mounted() {
    const { pdf } = this.$props;

    if (!pdf) {
      throw new Error('Attempted to load an outline, but no document was specified.');
    }

    this.loadOutline();
  }

  beforeDestroy() {
    cancelRunningTask(this.runningTask);
  }

  loadOutline() {
    const { pdf } = this.$props;

    if (this.outline) {
      this.outline = null;
    }

    const cancellable = makeCancellable(pdf.getOutline());
    this.runningTask = cancellable;

    cancellable.promise
      .then((outline) => {
        this.setState({ outline }, this.onLoadSuccess);
      })
      .catch((error) => {
        this.onLoadError(error);
      });
  }

  /**
   * Called when an outline is read successfully
   */
  onLoadSuccess() {
    const { outline } = this;

    dispatchEvents(this, 'loaded load:success LoadSuccess', outline);
  }

  /**
   * Called when an outline failed to read successfully
   */
  onLoadError(error) {
    this.outline = false;

    errorOnDev(error);

    dispatchEvents(this, 'error load:error LoadError', error);
  }

  onItemClick({ pageIndex, pageNumber }) {
    this.$emit('click', {
      pageIndex,
      pageNumber,
    });
  }

  renderOutline() {
    const { outline } = this;

    return (
      <ul>
        {outline.map((item, itemIndex) => (
          <OutlineItem
            key={typeof item.destination === 'string' ? item.destination : itemIndex}
            item={item}
          />
        ))}
      </ul>
    );
  }

  render() {
    const { outline, pdf } = this;

    if (!pdf || !outline) {
      return null;
    }

    return (
      <div class="vue-pdf__Outline">
        <OutlineContext.Provider value={this.childContext}>
          {this.renderOutline()}
        </OutlineContext.Provider>
      </div>
    );
  }
}

function Outline(props) {
  return (
    <DocumentContext.Consumer>
      {(context) => <OutlineInternal {...{ props: { ...context, ...props } }} />}
    </DocumentContext.Consumer>
  );
}

export default Outline;
