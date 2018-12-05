module.exports = function(handlebars, data) {
  handlebars.registerHelper('bundles', function(bundles, options) {
    var isProd = !!data.config.isProd;
    if (!isProd) return createBundleTags(bundles); 
    return createMinifiedBundleTags(bundles);
  });
  handlebars.registerHelper('import-bundles', function(fileName, options) {
    let file = data.files.find(f => f.name == fileName);
    if (!file) throw new Error(`Import Bundles: file not found - ${fileName}`);
    let model = !file.data ? {} : file.data;
    let bundles = !model.shaman ? [] : (!model.shaman.bundles ? [] : model.shaman.bundles);
    var isProd = !!data.config.isProd;
    if (!isProd) return createBundleTags(bundles); 
    return createMinifiedBundleTags(bundles);
  });
}

function createBundleTags(bundles) {
  return bundles
    .map((bundle) => {
      if (bundle.type == 'css') {
        return bundle.files.map(file => createStyle(file));
      } else {
        return bundle.files.map(file => createScript(file));
      }
    })
    .reduce((a, b) => {
      return a.concat(b);
    }, [])
    .reduce((a, b) => {
      return `${a}${a == '' ? '' : '\r\n'}${b}`
    }, '');
}

function createMinifiedBundleTags(bundles) {
  return bundles
    .map((bundle) => {
      if (bundle.type == 'css') {
        return `${createStyle(`${bundle.name}.min.css`)}\r\n`;
      } else {
        return `${createScript(`${bundle.name}.min.js`)}\r\n`;
      }
    })
    .reduce((a, b) => {
      return `${a}${a == '' ? '' : '\r\n'}${b}`
    }, '');
}

function createStyle(path) {
  return `<link rel="stylesheet" type="text/css" href="/${path}">`
}

function createScript(path) {
  return `<script type="text/javascript" src="/${path}"></script>`
}