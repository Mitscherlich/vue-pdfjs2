var provides = {};
export function provide(key, value) {
  provides[key] = value;
}
export function inject(key, defaultValue) {
  if (key in provides) {
    return provides[key];
  }

  if (arguments.length > 1) {
    return defaultValue;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.warn("injection \"" + String(key) + "\" not found.");
  }
}