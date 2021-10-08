import PropTypes from 'vue-types';
export var MessageProps = {
  type: PropTypes.oneOf(['error', 'loading', 'no-data']).isRequired
};
var Message = {
  functional: true,
  render: function render(h, _ref) {
    var props = _ref.props,
        children = _ref.children;
    var type = props.type;
    return h("div", {
      "class": "vue-pdf__message vue-pdf__message--" + type
    }, [children]);
  }
};
export default Message;