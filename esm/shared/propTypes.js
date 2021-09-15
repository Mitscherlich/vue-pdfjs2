import PropTypes from './vue-types';
import { isDefined } from './utils';
import LinkService from '../LinkService';
var fileTypes = [PropTypes.string, PropTypes.instanceOf(ArrayBuffer), PropTypes.shape({
  data: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  httpHeaders: PropTypes.object,
  range: PropTypes.object,
  url: PropTypes.string,
  withCredentials: PropTypes.bool
})];

if (typeof File !== 'undefined') {
  fileTypes.push(PropTypes.instanceOf(File));
}

if (typeof Blob !== 'undefined') {
  fileTypes.push(PropTypes.instanceOf(Blob));
}

export var isFile = PropTypes.oneOfType(fileTypes);
export var isLinkService = PropTypes.instanceOf(LinkService);
export var isLinkTarget = PropTypes.oneOf(['_self', '_blank', '_parent', '_top']);
export var isPageIndex = function isPageIndex(props, propName, componentName) {
  var pageIndex = props[propName],
      pageNumber = props.pageNumber,
      pdf = props.pdf;

  if (!isDefined(pdf)) {
    return null;
  }

  if (isDefined(pageIndex)) {
    if (typeof pageIndex !== 'number') {
      return new Error("`" + propName + "` of type `" + typeof pageIndex + "` supplied to `" + componentName + "`, expected `number`.");
    }

    if (pageIndex < 0) {
      return new Error("Expected `" + propName + "` to be greater or equal to 0.");
    }

    var numPages = pdf.numPages;

    if (pageIndex + 1 > numPages) {
      return new Error("Expected `" + propName + "` to be less or equal to " + (numPages - 1) + ".");
    }
  } else if (!isDefined(pageNumber)) {
    return new Error("`" + propName + "` not supplied. Either pageIndex or pageNumber must be supplied to `" + componentName + "`.");
  } // Everything is fine


  return null;
};
export var isPageNumber = function isPageNumber(props, propName, componentName) {
  var pageNumber = props[propName],
      pageIndex = props.pageIndex,
      pdf = props.pdf;

  if (!isDefined(pdf)) {
    return null;
  }

  if (isDefined(pageNumber)) {
    if (typeof pageNumber !== 'number') {
      return new Error("`" + propName + "` of type `" + typeof pageNumber + "` supplied to `" + componentName + "`, expected `number`.");
    }

    if (pageNumber < 1) {
      return new Error("Expected `" + propName + "` to be greater or equal to 1.");
    }

    var numPages = pdf.numPages;

    if (pageNumber > numPages) {
      return new Error("Expected `" + propName + "` to be less or equal to " + numPages + ".");
    }
  } else if (!isDefined(pageIndex)) {
    return new Error("`" + propName + "` not supplied. Either pageIndex or pageNumber must be supplied to `" + componentName + "`.");
  } // Everything is fine


  return null;
};
export var isRenderMode = PropTypes.oneOf(['canvas', 'none', 'svg']);
export var isRotate = PropTypes.oneOf([0, 90, 180, 270]);