var imageType = require('image-type'),
    getTemporaryFilePath = require('gettemporaryfilepath'),
    _ = require('underscore'),
    fs = require('fs'),
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
        expect.addAssertion('to resemble', function (expect, subject, otherImage, value) {
            subject = convertToBufferIfNecessary(subject);
            otherImage = convertToBufferIfNecessary(otherImage);
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
                resemblance.onComplete(resolve);
            }).then(function (data) {
                if (typeof data.misMatchPercentage === 'string') {
                    data.misMatchPercentage = parseFloat(data.misMatchPercentage);
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
                            var imageByName = {
                                actual: subject,
                                expected: otherImage,
                                diff: getImageDataUrl.call(data)
                            };

                            var longestLabelLength = Object.keys(imageByName).reduce(function (longestSeenLabelLength, label) {
                                return Math.max(longestSeenLabelLength, label.length);
                            }, 0);

                            var originalDiff = (err.getDiff && err.getDiff()) || err.createDiff(output.clone(), diff, inspect, equal);
                            output.append(originalDiff.diff).nl(2);

                            Object.keys(imageByName).forEach(function (imageName, i) {
                                if (i > 0) {
                                    output.nl()
                                }
                                output.text(imageName, 'cyan').text(':').sp(longestLabelLength - imageName.length).sp();

                                output.block(function () {
                                    this.raw({
                                        html: function () {
                                            var image = imageByName[imageName];
                                            if (typeof image === 'string') {
                                                return '<img src="' + image.replace(/"/g, '&quot;') + '">';
                                            } else {
                                                return inspect(image);
                                            }
                                        },
                                        fallback: function () {
                                            var image = imageByName[imageName];
                                            if (typeof image === 'string' && /^data:/.test(image)) {
                                                image = new Buffer(image.replace(/^data:image\/png;base64/, ''), 'base64');
                                            }
                                            if (Buffer.isBuffer(image)) {
                                                var imageInfo = imageType(image);
                                                if (fs.writeFileSync) {
                                                    var fileName = getTemporaryFilePath({ prefix: imageName + '-', suffix: '.' + imageInfo.ext });
                                                    fs.writeFileSync(fileName, image);
                                                    this.text(fileName);
                                                } else {
                                                    this.append(inspect(image));
                                                }
                                            } else {
                                                // File name or url
                                                this.text(image);
                                            }
                                        }
                                    });
                                });
                            });

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
