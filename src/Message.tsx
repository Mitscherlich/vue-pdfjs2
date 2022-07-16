import { defineComponent } from 'vue-demi'
import PropTypes from 'vue-types'

export interface MessageProps {
  type: 'error' | 'loading' | 'no-data'
}

const Message = defineComponent<MessageProps>((props, context) => () => {
  const { type } = props
  return <div class={`vue-pdf__message vue-pdf__message--${type}`}>{context.slots.default?.()}</div>
})
Message.name = 'Message'
Message.props = {
  type: PropTypes.oneOf(['error', 'loading', 'no-data']).isRequired,
}

export default Message
