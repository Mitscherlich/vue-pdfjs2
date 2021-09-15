export function dispatchEvents(vm, events) {
  for (var _len = arguments.length, payload = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    payload[_key - 2] = arguments[_key];
  }

  events.split(' ').forEach(function (event) {
    vm.$emit.apply(vm, [event].concat(payload));
  });
}