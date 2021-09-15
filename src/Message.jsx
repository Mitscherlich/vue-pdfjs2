import PropTypes from './shared/vue-types';

export const MessageProps = {
  type: PropTypes.oneOf(['error', 'loading', 'no-data']).isRequired,
};

const Message = ({ props, children }) => {
  const { type } = props;

  return <div class={`vue-pdf__message vue-pdf__message--${type}`}>{children}</div>;
};

export default Message;
