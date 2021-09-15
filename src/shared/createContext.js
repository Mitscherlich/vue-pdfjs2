import PropTypes from './vue-types';

export const createContext = (defaultValue) => {
  let _contextValue = () => (defaultValue instanceof Object ? { ...defaultValue } : defaultValue);

  return {
    Provider: {
      name: 'Context.Provider',
      props: {
        value: PropTypes.any,
        tag: PropTypes.string.def('div'),
      },
      watch: {
        value: {
          immediate: true,
          handler: (newVal) => {
            _contextValue = () => newVal;
          },
          deep: true,
        },
      },
      render(h) {
        return h(this.tag, this.$slots['default']);
      },
    },
    Consumer: {
      name: 'Context.Consumer',
      functional: true,
      props: {
        customRender: PropTypes.func.isRequired,
      },
      render: (_h, { props }) => props.customRender(_contextValue()),
    },
  };
};
