export function dispatchEvents(vm, events, ...payload) {
  events.split(' ').forEach((event) => {
    vm.$emit(event, ...payload);
  });
}
