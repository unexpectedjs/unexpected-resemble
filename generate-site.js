/*global messy:true*/
var argv = require('minimist')(process.argv.slice(2));

var unexpected = require('unexpected').clone().installPlugin(require('./lib/unexpectedResemble'));
var generator = require('unexpected-documentation-site-generator');
argv.unexpected = unexpected;
generator(argv);
