module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: process.env.BABEL_ENV === 'esm' ? false : undefined,
        loose: true,
      },
    ],
    ['@vue/babel-preset-jsx'],
  ],
  plugins: [
    [
      '@babel/transform-runtime',
      {
        useESModule: process.env.BABEL_ENV === 'esm' ? true : undefined,
      },
    ],
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    // ['@babel/plugin-proposal-class-properties', { loose: true }],
  ],
};
