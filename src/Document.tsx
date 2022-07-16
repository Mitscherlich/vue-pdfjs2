import * as pdfjs from 'pdfjs-dist/legacy/build/pdf'
import type {
  DocumentInitParameters,
  OnProgressParameters,
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
} from 'pdfjs-dist/types/src/display/api'

// import { createBEM } from '@m9ch/utils'
import { useEffect, useRef, useState } from '@m9ch/vhooks'
import type { Ref, VNode } from 'vue-demi'
import { defineComponent, toRefs } from 'vue-demi'
import PropTypes from 'vue-types'
import type { CancellablePromise } from 'make-cancellable-promise'
import makeCancellable from 'make-cancellable-promise'
import invariant from 'tiny-invariant'
import warning from 'tiny-warning'

import DocumentContext from './DocumentContext'

import Message from './Message'

import LinkService from './LinkService'
import PasswordResponses from './PasswordResponses'

import {
  cancelRunningTask,
  dataURItoByteString,
  displayCORSWarning,
  isArrayBuffer,
  isBlob,
  isDataURI,
  isFile,
  loadFromFile,
} from './shared/utils'

import {
  isFile as isFileProp, isFunctionOrNode,
} from './shared/propTypes'

const { PDFDataRangeTransport } = pdfjs

export interface DocumentProps {
  error?: Function | VNode
  externalLinkRel?: string
  externalLinkTarget?: string
  imageResourcesPath?: string
  file?: string | ArrayBuffer | File | Blob | DocumentInitParameters
  loading?: Function | VNode
  noData?: Function | VNode
  onPassword?: (callback: (password?: string) => void, reason: PasswordResponses) => void
  rotate?: number
}

export interface DocumentEvents {
  onSourceSuccess?: () => void
  onSourceError?: (error: Error) => void
  onLoadProgress?: (progressData: OnProgressParameters) => void
}

const Document = defineComponent<DocumentProps & DocumentEvents>((props, context) => {
  const { file } = toRefs(props)

  let runningTask: CancellablePromise
  let loadingTask: PDFDocumentLoadingTask

  const viewer = {
    scrollPageIntoView,
  }

  const linkService = new LinkService()

  useEffect(() => {
    loadDocument()
  }, [file])

  useEffect(() => {
    loadDocument()
    setupLinkService()

    return () => {
      // If rendering is in progress, let's cancel it
      cancelRunningTask(runningTask)

      // If loading is in progress, let's destroy it
      if (loadingTask)
        loadingTask.destroy()
    }
  }, [])

  const [state, setState] = useState<{
    pdf: PDFDocumentProxy | null | false
  }>({ pdf: null })
  const pages = useRef<any[]>([])
  const inputRef = useRef<HTMLDivElement>()

  return () => (
    <div
      class={['vue-pdf__Document']}
      ref={inputRef}
    >
      {renderContent()}
    </div>
  )

  function loadDocument() {
    // If another rendering is in progress, let's cancel it
    cancelRunningTask(runningTask)

    // If another loading is in progress, let's destroy it
    if (loadingTask)
      loadingTask.destroy()

    const cancellable = runningTask = makeCancellable<DocumentInitParameters | null>(findDocumentSource())

    cancellable.promise
      .then((source) => {
        onSourceSuccess()

        if (!source)
          return

        setState((prevState) => {
          return prevState.pdf ? { pdf: null } : prevState
        })

        const { onPassword } = props

        loadingTask = pdfjs.getDocument({ ...source })
        loadingTask.onPassword = onPassword!
        loadingTask.onProgress = context.emit.bind(context, 'loadProgress')
        const cancellable = runningTask = makeCancellable(loadingTask.promise)

        cancellable.promise
          .then((pdf) => {
            setState((prevState) => {
              return prevState.pdf && prevState.pdf.fingerprints === pdf.fingerprints ? prevState : { pdf }
            })
            onLoadSuccess()
          })
          .catch((error) => {
            onLoadError(error)
          })
      })
      .catch((error) => {
        onSourceError(error)
      })
  }

  function setupLinkService() {
    const { externalLinkRel, externalLinkTarget } = props

    linkService.setViewer(viewer)
    linkService.setExternalLinkRel(externalLinkRel)
    linkService.setExternalLinkTarget(externalLinkTarget)
  }

  /**
   * Called when a document source is resolved correctly
   */
  function onSourceSuccess() {
    context.emit('sourceSuccess')
  }

  /**
   * Called when a document source failed to be resolved correctly
   */
  function onSourceError(error: any) {
    warning(process.env.NODE_ENV !== 'production', error)

    context.emit('sourceError', error)
  }

  /**
   * Called when a document is read successfully
   */
  function onLoadSuccess() {
    const { pdf } = state.value

    context.emit('loadSuccess', pdf)

    pages.value = new Array((pdf as PDFDocumentProxy).numPages)
    linkService.setDocument(pdf)
  }

  /**
   * Called when a document failed to read successfully
   */
  function onLoadError(error: any) {
    setState({ pdf: false })
    warning(process.env.NODE_ENV !== 'production', error)
    context.emit('loadError', error)
  }

  function scrollPageIntoView() {
    // TODO
  }

  /**
   * Finds a document source based on props.
   */
  function findDocumentSource() {
    return new Promise<DocumentInitParameters | null>((resolve) => {
      const { file } = props
      if (!file)
        return resolve(null)

      // File is a string
      if (typeof file === 'string') {
        if (isDataURI(file)) {
          const fileByteString = dataURItoByteString(file)
          return resolve({ data: fileByteString })
        }

        displayCORSWarning()
        return resolve({ url: file })
      }

      // File is PDFDataRangeTransport
      if (file instanceof PDFDataRangeTransport)
        return resolve({ range: file })

      // File is an ArrayBuffer
      if (isArrayBuffer(file))
        return resolve({ data: file as Uint8Array })

      /**
       * The cases below are browser-only.
       * If you're running on a non-browser environment, these cases will be of no use.
       */
      if (isBlob(file) || isFile(file)) {
        loadFromFile(file).then((data: Uint8Array) => {
          resolve({ data })
        })
        return
      }

      // At this point, file must be an object
      invariant(typeof file === 'object',
        'Invalid parameter in file, need either Uint8Array, string or a parameter object',
      )

      invariant(file.url || file.data || file.range,
        'Invalid parameter object: need either .data, .range or .url',
      )

      // File .url is a string
      if (typeof file.url === 'string') {
        if (isDataURI(file.url)) {
          const { url, ...otherParams } = file
          const fileByteString = dataURItoByteString(url)
          return resolve({ data: fileByteString, ...otherParams })
        }

        displayCORSWarning()
      }

      resolve(file)
    })
  }

  function registerPage(pageIndex: number, ref: Ref<any>) {
    pages.value[pageIndex] = ref
  }

  function unregisterPage(pageIndex: number) {
    delete pages.value[pageIndex]
  }

  function renderContent() {
    const { file } = props
    const { pdf } = state.value

    if (!file) {
      const { noData } = props
      return <Message type="no-data">{typeof noData === 'function' ? noData() : noData}</Message>
    }

    if (pdf === null) {
      const { loading } = props
      return (
        <Message type="loading">{typeof loading === 'function' ? loading() : loading}</Message>
      )
    }

    if (pdf === false) {
      const { error } = props
      return (
        <Message type="error">{typeof error === 'function' ? error() : error}</Message>
      )
    }

    const {
      imageResourcesPath,
      rotate,
    } = props
    const childContext = {
      imageResourcesPath,
      linkService,
      pdf,
      registerPage,
      // renderMode,
      rotate,
      unregisterPage,
    }

    return (
      <DocumentContext.Provider value={childContext}>
        {context.slots.default?.()}
      </DocumentContext.Provider>
    )
  }
})
Document.name = 'Document'
Document.props = {
  error: isFunctionOrNode.def('Failed to load PDF file.'),
  externalLinkRel: PropTypes.string,
  externalLinkTarget: PropTypes.string,
  file: isFileProp,
  imageResourcesPath: PropTypes.string,
  loading: isFunctionOrNode.def('Loading PDF…'),
  noData: isFunctionOrNode.def('No PDF file specified.'),
  onPassword: PropTypes.func.def(defaultHandlePassword),
  rotate: PropTypes.number,
}

function defaultHandlePassword(callback: (password?: string) => void, reason: PasswordResponses) {
  switch (reason) {
    case PasswordResponses.NEED_PASSWORD: {
      const password = prompt('Enter the password to open this PDF file.')
      callback(password!)
      break
    }
    case PasswordResponses.INCORRECT_PASSWORD: {
      const password = prompt('Invalid password. Please try again.')
      callback(password!)
      break
    }
    default:
  }
}

export default Document
