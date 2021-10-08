import { provide, inject } from './utils';

export function makeContext(defaultValue) {
  const _key = `_${Date.now()}${Math.random()}`;

  const Provider = {
    name: 'Context.Provider',
    props: {
      value: null,
      tag: { type: String, default: 'div' },
    },
    watch: {
      '$props.value': {
        immediate: true,
        handler: (val) => provide(_key, val),
        deep: true,
      },
    },
    render(h = this.$createElement) {
      return h(this.tag, [this.$slots['default']]);
    },
  };

  const Consumer = {
    name: 'Context.Consumer',
    functional: true,
    render: (h, ctx) => ctx.scopedSlots.default(inject(_key, defaultValue)),
  };

  return { Provider, Consumer };
}
