/*global unexpected:true*/
unexpected = require('unexpected').clone()
    .installPlugin(require('proxyquire')('../lib/unexpectedResemble', {
        gettemporaryfilepath: function (options) {
            return '/tmp/image' + ((options && options.suffix) || '');
        }
    }));
