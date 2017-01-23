const tsc = require('typescript');
const templateLoader = require('angular2-template-loader');
const tsConfig = require('../../tsconfig.json');
const jsesc = require('jsesc');

module.exports = {
  process(src, path) {
    if (path.endsWith('.ts') || path.endsWith('.tsx')) {
      const sourceWithTemplate = templateLoader(src);

      return tsc.transpile(
        sourceWithTemplate,
        tsConfig.compilerOptions,
        path,
        []
      );
    }
    else if (path.endsWith('.html')) {
      return `module.exports = '${jsesc(src)}\'; `;
    }

    return src;
  }
};
