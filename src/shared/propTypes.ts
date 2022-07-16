import type { VueTypeDef, VueTypeValidableDef } from 'vue-types'
import PropTypes from 'vue-types'

const fileTypes: Array<VueTypeDef<any> | VueTypeValidableDef<any>> = [
  PropTypes.string,
  PropTypes.instanceOf(ArrayBuffer),
  PropTypes.shape({
    data: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    httpHeaders: PropTypes.object,
    range: PropTypes.object,
    url: PropTypes.string,
    withCredentials: PropTypes.bool,
  }),
]
if (typeof File !== 'undefined')
  fileTypes.push(PropTypes.instanceOf(File))

if (typeof Blob !== 'undefined')
  fileTypes.push(PropTypes.instanceOf(Blob))

export const isFile = PropTypes.oneOfType(fileTypes)

export const isFunctionOrNode = PropTypes.oneOfType([PropTypes.func, PropTypes.any])
