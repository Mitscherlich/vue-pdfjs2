const { isPackageExists } = require('local-pkg');
const { exec } = require('child_process');
const { promisify } = require('util');

const execa = promisify(exec);

(async () => {
  if (!isPackageExists('vue-pdfjs2')) {
    await execa('yarn link', { cwd: process.cwd() });
    await execa('yarn link "vue-pdfjs2"', { cwd: process.cwd() });
  }
})();
