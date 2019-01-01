/*global unexpected:true*/
var proxyquire = require('proxyquire');
unexpected = require('unexpected')
  .clone()
  .installPlugin(
    proxyquire('./lib/unexpectedResemble', {
      'magicpen-media': proxyquire('magicpen-media', {
        gettemporaryfilepath: function(options) {
          return '/tmp/image' + ((options && options.suffix) || '');
        }
      })
    })
  );
unexpected.output.preferredWidth = 80;
