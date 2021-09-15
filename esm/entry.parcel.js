import * as pdfjs from 'pdfjs-dist/legacy/build/pdf';
import Document from './Document'; // import Outline from './Outline';

import Page from './Page';
import { isLocalFileSystem, warnOnDev } from './shared/utils';

if (isLocalFileSystem) {
  warnOnDev("You are running VuePDF from your local file system.\nPDF.js Worker may fail to load due to browser's security policies.\nIf you're on Google Chrome, you can use --allow-file-access-from-files flag for debugging purposes.");
}

if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjs.GlobalWorkerOptions.workerPort = new Worker('./pdf.worker.entry.js');
}

export { pdfjs, Document,
/* Outline, */
Page };