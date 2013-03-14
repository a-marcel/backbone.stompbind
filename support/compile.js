var path = require('path'),
    fs = require('fs'),
    color = require('colors'),
    folio = require('folio');

var version = require('../package.json').version;

var Glossary = folio.Glossary;

var stompbind = new Glossary([
  path.join(__dirname, '..', 'lib', 'model.js'),
  path.join(__dirname, '..', 'lib', 'collection.js')
], {
  prefix: fs.readFileSync(path.join(__dirname, '..', 'lib', 'prefix.js'), 'utf8'),
  suffix: fs.readFileSync(path.join(__dirname, '..', 'lib', 'suffix.js'), 'utf8')
});

stompbind.compile(function (err, source) {
  source = source.replace(/@VERSION/g, version);
  fs.writeFileSync(path.join(__dirname, '..', 'dist', 'backbone.stompbind.js'), source);
  console.log('Build successful: '.green + '\tdist/backbone.stompbind.js'.blue);
  console.log("copying backbone.stompbind.js to example");
  fs.createReadStream( path.join(__dirname, '..', 'dist', 'backbone.stompbind.js') ).pipe( fs.createWriteStream( path.join(__dirname, '..', 'example', 'public', 'js', 'backbone.stompbind.js') ) );
});

var stompbindmin = new Glossary([
  path.join(__dirname, '..', 'lib', 'model.js'),
  path.join(__dirname, '..', 'lib', 'collection.js')
], {
  minify: true,
  prefix: fs.readFileSync(path.join(__dirname, '..', 'lib', 'prefix.js'), 'utf8'),
  suffix: fs.readFileSync(path.join(__dirname, '..', 'lib', 'suffix.js'), 'utf8')
});

stompbindmin.compile(function (err, source) {
  source = source.replace(/@VERSION/g, version);
  var copyright = fs.readFileSync(path.join(__dirname, '..', 'lib', 'copyright.js'));
  fs.writeFileSync(path.join(__dirname, '..', 'dist', 'backbone.stompbind.min.js'), copyright + '\n' + source);
  console.log('Build successful: '.green + '\tdist/backbone.stompbind.min.js'.blue);
});

var stompsync = new Glossary([
  path.join(__dirname, '..', 'lib', 'sync.js')
], {
  prefix: fs.readFileSync(path.join(__dirname, '..', 'lib', 'prefix.js'), 'utf8'),
  suffix: fs.readFileSync(path.join(__dirname, '..', 'lib', 'suffix.js'), 'utf8')
});

stompsync.compile(function (err, source) {
  fs.writeFileSync(path.join(__dirname, '..', 'dist', 'backbone.stompsync.js'), source);
  console.log('Build successful: '.green + '\tdist/backbone.stompsync.js'.blue);
  console.log("copying backbone.stompsync.js to example");
  fs.createReadStream( path.join(__dirname, '..', 'dist', 'backbone.stompsync.js') ).pipe( fs.createWriteStream( path.join(__dirname, '..', 'example', 'public', 'js', 'backbone.stompsync.js') ) );
});

var stompsyncmin = new Glossary([
  path.join(__dirname, '..', 'lib', 'sync.js')
], {
  minify: true,
  prefix: fs.readFileSync(path.join(__dirname, '..', 'lib', 'prefix.js'), 'utf8'),
  suffix: fs.readFileSync(path.join(__dirname, '..', 'lib', 'suffix.js'), 'utf8')
});

stompsyncmin.compile(function (err, source) {
  var copyright = fs.readFileSync(path.join(__dirname, '..', 'lib', 'copyright.js'));
  fs.writeFileSync(path.join(__dirname, '..', 'dist', 'backbone.stompsync.min.js'), copyright + '\n' + source);
  console.log('Build successful: '.green + '\tdist/backbone.stompsync.min.js'.blue);
});
