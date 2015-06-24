var imageType = require('image-type'),
    getTemporaryFilePath = require('gettemporaryfilepath'),
    _ = require('underscore'),
    fs = require('fs'),
    resemble;

try {
    resemble = require('resemble');
} catch (e) {
    resemble = require('resemblejs');
}

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
                    expect.fail({
                        diff: function (output, diff, inspect, equal) {
                            var imageByName = {
                                actual: subject,
                                expected: otherImage,
                                diff: getImageDataUrl.call(data)
                            };

                            var originalDiff = (err.getDiff && err.getDiff()) || err.createDiff(output.clone(), diff, inspect, equal);
                            output.append(originalDiff.diff).nl(2);

                            Object.keys(imageByName).forEach(function (imageName) {
                                output.text(imageName, 'cyan').text(':').sp();

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
                                }).nl(); // FIXME when .raw supports chaining
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
