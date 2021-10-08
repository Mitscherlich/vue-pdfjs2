import { provide, inject } from './utils';
export function makeContext(defaultValue) {
  var _key = "_" + Date.now() + Math.random();

  var Provider = {
    name: 'Context.Provider',
    props: {
      value: null,
      tag: {
        type: String,
        "default": 'div'
      }
    },
    watch: {
      '$props.value': {
        immediate: true,
        handler: function handler(val) {
          return provide(_key, val);
        },
        deep: true
      }
    },
    render: function render(h) {
      if (h === void 0) {
        h = this.$createElement;
      }

      return h(this.tag, [this.$slots['default']]);
    }
  };
  var Consumer = {
    name: 'Context.Consumer',
    functional: true,
    render: function render(h, ctx) {
      return ctx.scopedSlots["default"](inject(_key, defaultValue));
    }
  };
  return {
    Provider: Provider,
    Consumer: Consumer
  };
}