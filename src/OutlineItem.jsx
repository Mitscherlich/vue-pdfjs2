import Vue from 'vue';
import Component from 'vue-class-component';
import PropTypes from 'vue-types';

import DocumentContext from './DocumentContext';
import OutlineContext from './OutlineContext';

import Ref from './Ref';

import { isDefined } from './shared/utils';

const isDestination = PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.any)]);

const OutlineItemPropTypes = {
  item: PropTypes.shape({
    dest: isDestination,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        dest: isDestination,
        title: PropTypes.string,
      })
    ),
    title: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func,
  pdf: PropTypes.any.isRequired,
};

@Component({
  name: 'OutlineItem',
  props: OutlineItemPropTypes,
})
class OutlineItemInternal extends Vue {
  getDestination() {
    return new Promise((resolve, reject) => {
      const { item, pdf } = this.$props;

      if (!isDefined(this.destination)) {
        if (typeof item.dest === 'string') {
          pdf.getDestination(item.dest).then(resolve).catch(reject);
        } else {
          resolve(item.dest);
        }
      }

      return this.destination;
    }).then((destination) => {
      this.destination = destination;
      return destination;
    });
  }

  getPageIndex() {
    return new Promise((resolve, reject) => {
      const { pdf } = this.$props;
      if (isDefined(this.pageIndex)) {
        resolve(this.pageIndex);
      }

      this.getDestination().then((destination) => {
        if (!destination) {
          return;
        }

        const [ref] = destination;
        pdf.getPageIndex(new Ref(ref)).then(resolve).catch(reject);
      });
    }).then((pageIndex) => {
      this.pageIndex = pageIndex;
      return this.pageIndex;
    });
  }

  getPageNumber() {
    return new Promise((resolve, reject) => {
      if (isDefined(this.pageNumber)) {
        resolve(this.pageNumber);
      }

      this.getPageIndex()
        .then((pageIndex) => {
          resolve(pageIndex + 1);
        })
        .catch(reject);
    }).then((pageNumber) => {
      this.pageNumber = pageNumber;
      return pageNumber;
    });
  }

  onClick(event) {
    event.preventDefault();

    return Promise.all([this.getPageIndex(), this.getPageNumber()]).then(
      ([pageIndex, pageNumber]) => {
        this.$emit('click', {
          pageIndex,
          pageNumber,
        });
      }
    );
  }

  renderSubitems() {
    const { item, ...otherProps } = this.$props;

    if (!item.items || !item.items.length) {
      return null;
    }

    const { items: subitems } = item;

    return (
      <ul>
        {subitems.map((subitem, subitemIndex) => (
          <OutlineItemInternal
            key={typeof subitem.destination === 'string' ? subitem.destination : subitemIndex}
            item={subitem}
            {...otherProps}
          />
        ))}
      </ul>
    );
  }

  render() {
    const { item } = this.$props;

    return (
      <li>
        <a href="#" onClick={this.onClick}>
          {item.title}
        </a>
        {this.renderSubitems()}
      </li>
    );
  }
}

const OutlineItem = ({ props }) => (
  <DocumentContext.Consumer>
    {(documentContext) => (
      <OutlineContext.Consumer>
        {(outlineContext) => (
          <OutlineItemInternal
            {...{ props: { ...documentContext, ...outlineContext, ...props } }}
          />
        )}
      </OutlineContext.Consumer>
    )}
  </DocumentContext.Consumer>
);

export default OutlineItem;
