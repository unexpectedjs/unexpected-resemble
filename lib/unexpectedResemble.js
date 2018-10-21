var _ = require('underscore'),
    resemble = require('resemblejs');

module.exports = {
    name: 'unexpected-resemble',
    installInto: function (expect) {
        expect.installPlugin(require('magicpen-media'));

        expect.addAssertion('<string|binaryArray> to resemble <any+>', function (expect, subject, otherImage, value) {
            this.subjectOutput = function () {
                this.image(subject, { width: 10, height: 5, link: true });
            };

            this.argsOutput[0] = function () {
                this.image(otherImage, { width: 10, height: 5, link: true });
            };

            return expect.promise(function (resolve, reject) {
                var options = {
                };

                if (typeof value !== 'number' && typeof value !== 'undefined') {
                    ['ignoreColors', 'ignoreAntialiasing'].forEach(function (optionName) {
                        if (optionName in value) {
                            var ignoreValue = optionName.replace(/^ignore(.)/, function (match, firstChar) { return firstChar.toLowerCase(); });

                            options.ignore = Array.concat((options.ignore || []), ignoreValue);

                            delete value[optionName];
                        }
                    });
                }

                resemble.compare(subject, otherImage, options, function (err, resemblance) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(resemblance);
                    }
                });
            }).then(function (data) {
                data.mismatchPercentage = data.misMatchPercentage;
                delete data.misMatchPercentage;
                if (typeof data.mismatchPercentage === 'string') {
                    data.mismatchPercentage = parseFloat(data.mismatchPercentage);
                }
                // remove properties returned from newer the resemble/canvas versions
                delete data.rawMisMatchPercentage;
                delete data.diffBounds;

                var getImageDataUrl = data.getImageDataUrl;
                // These are noisy in the 'to satisfy' diff output
                delete data.analysisTime;
                delete data.getBuffer;
                delete data.getImageDataUrl;
                delete data.pngStream;

                var normalizedValue;

                if (typeof value === 'number') {
                    normalizedValue = {
                        isSameDimensions: true,
                        mismatchPercentage: expect.it('to be less than', value)
                    };
                } else if (value) {
                    normalizedValue = _.extend({}, value);

                    if ('misMatchPercentage' in value) {
                        normalizedValue.mismatchPercentage = value.misMatchPercentage;
                        delete normalizedValue.misMatchPercentage;
                    }
                } else {
                    normalizedValue = {
                        isSameDimensions: true,
                        mismatchPercentage: expect.it('to be less than', 1)
                    };
                }

                return expect.withError(function () {
                    return expect(data, 'to satisfy', normalizedValue);
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
