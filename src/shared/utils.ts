import type { CancellablePromise } from 'make-cancellable-promise'
import invariant from 'tiny-invariant'
import warning from 'tiny-warning'

/**
 * Checks if we're running in a browser environment.
 */
export const isBrowser = typeof window !== 'undefined'

/**
 * Checks whether we're running from a local file system.
 */
export const isLocalFileSystem = isBrowser && window.location.protocol === 'file:'

/**
 * Checks whether a value provided is an ArrayBuffer.
 *
 * @param {*} value Variable to check
 */
export function isArrayBuffer(value: any): value is ArrayBuffer {
  return value instanceof ArrayBuffer
}

/**
 * Checks whether a value provided is a Blob.
 *
 * @param {*} value Variable to check
 */
export function isBlob(value: any): value is Blob {
  invariant(isBrowser, 'isBlob can only be used in a browser environment')

  return value instanceof Blob
}

/**
 * Checks whether a value provided is a File.
 *
 * @param {*} value Variable to check
 */
export function isFile(value: any): value is File {
  invariant(isBrowser, 'isFile can only be used in a browser environment')

  return value instanceof File
}

/**
 * Checks whether a string provided is a data URI.
 *
 * @param {string} str String to check
 */
export function isDataURI(str: string) {
  return /^data:/.test(str)
}

export function dataURItoByteString(dataURI: string) {
  invariant(isDataURI(dataURI), 'Invalid data URI.')

  const [headersString, dataString] = dataURI.split(',')
  const headers = headersString.split(';')

  if (headers.includes('base64'))
    return atob(dataString)

  return unescape(dataString)
}

export function getPixelRatio() {
  return (isBrowser && window.devicePixelRatio) || 1
}

const allowFileAccessFromFilesTip
  = 'On Chromium based browsers, you can use --allow-file-access-from-files flag for debugging purposes.'

export function displayCORSWarning() {
  warning(!isLocalFileSystem,
    `Loading PDF as base64 strings/URLs may not work on protocols other than HTTP/HTTPS. ${allowFileAccessFromFilesTip}`,
  )
}

export function displayWorkerWarning() {
  warning(!isLocalFileSystem,
    `Loading PDF.js worker may not work on protocols other than HTTP/HTTPS. ${allowFileAccessFromFilesTip}`,
  )
}

export function cancelRunningTask(runningTask: CancellablePromise) {
  if (runningTask && runningTask.cancel)
    runningTask.cancel()
}

export function loadFromFile(file: File | Blob) {
  return new Promise<Uint8Array>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer))
    reader.onerror = (event) => {
      switch (event.target!.error!.code) {
        case event.target!.error!.NOT_FOUND_ERR:
          return reject(new Error('Error while reading a file: File not found.'))
        // case event.target!.error!.NOT_READABLE_ERR:
        //   return reject(new Error('Error while reading a file: File not readable.'))
        case event.target!.error!.SECURITY_ERR:
          return reject(new Error('Error while reading a file: Security error.'))
        case event.target!.error!.ABORT_ERR:
          return reject(new Error('Error while reading a file: Aborted.'))
        default:
          return reject(new Error('Error while reading a file.'))
      }
    }
    reader.readAsArrayBuffer(file)

    return null
  })
}
