/*global messy:true*/
var argv = require('minimist')(process.argv.slice(2));

require('proxyquire')('gettemporaryfilepath', function () {
    return 'hey';
});
var unexpected = require('unexpected').clone()
    .installPlugin(require('proxyquire')('./lib/unexpectedResemble', {
        gettemporaryfilepath: function (options) {
            return '/tmp/image' + ((options && options.suffix) || '');
        }
    }));
var generator = require('unexpected-documentation-site-generator');
argv.unexpected = unexpected;
generator(argv);
