var fs = require('fs'),
  _ = require('underscore'),
  ejs = require('ejs'),
  path= require('path');

function VersionFile(options) {
  var self = this;

  var defaultOptions = {
    outputFile: './version.txt',
    template: 'version.ejs',
    templateString: '',
    packageFile: './package.json',
    extras: {}
  };

  //set default config data
  var optionsObject = options || {};
  self.options = _.defaults(optionsObject, defaultOptions);
  self.options['package'] = require(self.options.packageFile);
}

VersionFile.prototype.apply = function(compiler){
  var self = this;


  self.options.currentTime = new Date();

  /*
   * If we are given a template string in the config, then use it directly.
   * But if we get a file path, fetch the content then use it.
   */
  compiler.plugin('emit', function(compilation, callback) {
    if (self.options.templateString){
      self.writeFile(self.options.templateString, compilation, callback);
    } else {
      fs.readFile(self.options.template, {encoding: 'utf8'}, function(error, content){

        if(error){
          throw error;
          return;
        }

        self.writeFile(content, compilation, callback);
      });
    }
  })
};

/**
 * Renders the template and writes the version file to the file system.
 * @param templateContent
 */
VersionFile.prototype.writeFile = function(templateContent, compilation, callback){
  var self = this;
  fileContent = ejs.render(templateContent, self.options);
  var relativeOutputPath = path.relative(
    compilation.options.output.path,
    self.options.outputFile
  );
  compilation.assets[relativeOutputPath] = {
    source: function() {
      return fileContent;
    },
    size: function() {
      return fileContent.length;
    }
  }
  callback()
}

module.exports = VersionFile;
