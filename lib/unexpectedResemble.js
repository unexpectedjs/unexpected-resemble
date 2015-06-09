var resemble = require('resemble'),
    imageType = require('image-type'),
    getTemporaryFilePath = require('gettemporaryfilepath'),
    _ = require('underscore'),
    fs = require('fs');

module.exports = {
    name: 'unexpected-resemble',
    installInto: function (expect) {
        expect.addAssertion('to resemble', function (expect, subject, otherImage, value) {
            return expect.promise(function (resolve, reject) {
                if (typeof value === 'number') {
                    value = {
                        isSameDimensions: true,
                        misMatchPercentage: expect.it('to be less than', value)
                    };
                }
                var resemblance = resemble.resemble(subject).compareTo(otherImage);
                value = value ? _.extend({}, value) : {
                    isSameDimensions: true,
                    misMatchPercentage: expect.it('to be less than', 1)
                };
                ['ignoreColors', 'ignoreAntialiasing'].forEach(function (optionName) {
                    if (value[optionName]) {
                        resemblance[optionName]();
                        delete value[optionName];
                    }
                });
                resemblance.onComplete(function (data) {
                    resolve(data);
                });
            }).then(function (data) {
                var getImageDataUrl = data.getImageDataUrl;
                // These are noisy in the 'to satisfy' diff output
                delete data.getImageDataUrl;
                delete data.pngStream;
                return expect.withError(function () {
                    return expect(data, 'to satisfy', value);
                }, function (err) {
                    var imageByName = {
                        actual: subject,
                        expected: otherImage,
                        diff: new Buffer(getImageDataUrl.call(data).replace(/^data:image\/png;base64/, ''), 'base64')
                    };
                    expect.fail({
                        diff: function (output, diff, inspect, equal) {
                            Object.keys(imageByName).forEach(function (imageName) {
                                var image = imageByName[imageName],
                                fileName;

                                if (Buffer.isBuffer(image)) {
                                    var imageInfo = imageType(image);
                                    fileName = getTemporaryFilePath({ prefix: imageName + '-', suffix: '.' + imageInfo.ext });
                                    fs.writeFileSync(fileName, image);
                                } else {
                                    fileName = image; // Assume string
                                }

                                output.text(imageName, 'cyan').text(':').sp().text(fileName, 'cyan').nl(); // Certainly not the way to do it :/
                            });

                            var originalDiff = (err.getDiff && err.getDiff()) || err.createDiff(output.clone(), diff, inspect, equal);
                            output.nl().append(originalDiff.diff);

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
