var argv = require('minimist')(process.argv.slice(2));
var proxyquire = require('proxyquire');

var unexpected = require('unexpected').clone()
    .installPlugin(proxyquire('./lib/unexpectedResemble', {
        'magicpen-media': proxyquire('magicpen-media', {
            gettemporaryfilepath: function (options) {
                return '/tmp/image' + ((options && options.suffix) || '');
            }
        })
    }));
unexpected.output.preferredWidth = 80;
var generator = require('unexpected-documentation-site-generator');
argv.unexpected = unexpected;
generator(argv);
