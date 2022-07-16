declare module 'make-cancellable-promise' {
  export interface CancellablePromise<T = unknown> {
    cancel(): void
    promise: Promise<T>
  }

  function makeCancellable<T>(promise: Promise<T>): CancellablePromise<T>

  export = makeCancellable
}
