var _ = require('underscore'),
    isBrowserResembleJs = false,
    resemble;

try {
    resemble = require('resemble');
} catch (e) {
    isBrowserResembleJs = true;
    resemble = require('resemblejs');
}

// The node.js fork of the libary, require('resemble'), does not support data: urls:
function convertToBufferIfNecessary(obj) {
    if (!isBrowserResembleJs && typeof obj === 'string') {
        var matchDataUrl = obj.match(/^data:[^;]*;base64,(.*)$/);
        if (matchDataUrl) {
            return new Buffer(matchDataUrl[1], 'base64');
        }
    }
    return obj;
}

module.exports = {
    name: 'unexpected-resemble',
    installInto: function (expect) {
        expect.installPlugin(require('magicpen-media'));

        expect.addAssertion('<string|binaryArray> to resemble <any+>', function (expect, subject, otherImage, value) {
            subject = convertToBufferIfNecessary(subject);
            otherImage = convertToBufferIfNecessary(otherImage);

            this.subjectOutput = function () {
                this.image(subject, { width: 10, height: 5, link: true });
            };

            this.argsOutput[0] = function () {
                this.image(otherImage, { width: 10, height: 5, link: true });
            };

            return expect.promise(function (resolve, reject) {
                if (typeof value === 'number') {
                    value = {
                        isSameDimensions: true,
                        mismatchPercentage: expect.it('to be less than', value)
                    };
                }
                var resemblance = resemble.resemble(subject).compareTo(otherImage);
                if (value) {
                    value = _.extend({}, value);
                    if (typeof value.misMatchPercentage !== 'undefined' && typeof value.mismatchPercentage === 'undefined') {
                        value.mismatchPercentage = value.misMatchPercentage;
                        delete value.misMatchPercentage;
                    }
                } else {
                    value = {
                        isSameDimensions: true,
                        mismatchPercentage: expect.it('to be less than', 1)
                    };
                }
                ['ignoreColors', 'ignoreAntialiasing'].forEach(function (optionName) {
                    if (value[optionName]) {
                        resemblance[optionName]();
                        delete value[optionName];
                    }
                });
                resemblance.onComplete(resolve);
            }).then(function (data) {
                data.mismatchPercentage = data.misMatchPercentage;
                delete data.misMatchPercentage;
                if (typeof data.mismatchPercentage === 'string') {
                    data.mismatchPercentage = parseFloat(data.mismatchPercentage);
                }

                var getImageDataUrl = data.getImageDataUrl;
                // These are noisy in the 'to satisfy' diff output
                delete data.analysisTime;
                delete data.getImageDataUrl;
                delete data.pngStream;
                return expect.withError(function () {
                    return expect(data, 'to satisfy', value);
                }, function (err) {
                    expect.fail({
                        diff: function (output, diff, inspect, equal) {
                            output
                                .append(err.getDiff(output.format).diff)
                                .nl(2)
                                .image(getImageDataUrl.call(data), { fallbackToDisc: true });

                            return {
                                inline: false,
                                diff: output
                            };
                        }
                    });
                });
            });
        });
    }
};
