exports = function(config) {
  var CompilerFactory = require('./dist/compiler/compiler.factory').CompilerFactory;
  return CompilerFactory(config);
}