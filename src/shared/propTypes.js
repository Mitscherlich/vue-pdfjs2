import PropTypes from 'vue-types';

import { isDefined } from './utils';

import LinkService from '../LinkService';

const fileTypes = [
  PropTypes.string,
  PropTypes.instanceOf(ArrayBuffer),
  PropTypes.shape({
    data: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    httpHeaders: PropTypes.object,
    range: PropTypes.object,
    url: PropTypes.string,
    withCredentials: PropTypes.bool,
  }),
];
if (typeof File !== 'undefined') {
  fileTypes.push(PropTypes.instanceOf(File));
}
if (typeof Blob !== 'undefined') {
  fileTypes.push(PropTypes.instanceOf(Blob));
}

export const isFile = PropTypes.oneOfType(fileTypes);

export const isLinkService = PropTypes.instanceOf(LinkService);

export const isLinkTarget = PropTypes.oneOf(['_self', '_blank', '_parent', '_top']);

export const isPageIndex = (props, propName, componentName) => {
  const { [propName]: pageIndex, pageNumber, pdf } = props;

  if (!isDefined(pdf)) {
    return null;
  }

  if (isDefined(pageIndex)) {
    if (typeof pageIndex !== 'number') {
      return new Error(
        `\`${propName}\` of type \`${typeof pageIndex}\` supplied to \`${componentName}\`, expected \`number\`.`
      );
    }

    if (pageIndex < 0) {
      return new Error(`Expected \`${propName}\` to be greater or equal to 0.`);
    }

    const { numPages } = pdf;

    if (pageIndex + 1 > numPages) {
      return new Error(`Expected \`${propName}\` to be less or equal to ${numPages - 1}.`);
    }
  } else if (!isDefined(pageNumber)) {
    return new Error(
      `\`${propName}\` not supplied. Either pageIndex or pageNumber must be supplied to \`${componentName}\`.`
    );
  }

  // Everything is fine
  return null;
};

export const isPageNumber = (props, propName, componentName) => {
  const { [propName]: pageNumber, pageIndex, pdf } = props;

  if (!isDefined(pdf)) {
    return null;
  }

  if (isDefined(pageNumber)) {
    if (typeof pageNumber !== 'number') {
      return new Error(
        `\`${propName}\` of type \`${typeof pageNumber}\` supplied to \`${componentName}\`, expected \`number\`.`
      );
    }

    if (pageNumber < 1) {
      return new Error(`Expected \`${propName}\` to be greater or equal to 1.`);
    }

    const { numPages } = pdf;

    if (pageNumber > numPages) {
      return new Error(`Expected \`${propName}\` to be less or equal to ${numPages}.`);
    }
  } else if (!isDefined(pageIndex)) {
    return new Error(
      `\`${propName}\` not supplied. Either pageIndex or pageNumber must be supplied to \`${componentName}\`.`
    );
  }

  // Everything is fine
  return null;
};

export const isRenderMode = PropTypes.oneOf(['canvas', 'none', 'svg']);

export const isRotate = PropTypes.oneOf([0, 90, 180, 270]);
