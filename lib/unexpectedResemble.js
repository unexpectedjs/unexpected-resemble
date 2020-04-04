const resemble = require('resemblejs');
const objectAssign = require('object-assign');

module.exports = {
  name: 'unexpected-resemble',
  installInto(expect) {
    expect = expect.child().use(require('magicpen-media'));

    expect.exportAssertion('<string|binaryArray> to resemble <any+>', function (
      expect,
      subject,
      otherImage,
      value
    ) {
      expect.subjectOutput = function () {
        this.image(subject, { width: 10, height: 5, link: true });
      };

      expect.argsOutput[0] = function () {
        this.image(otherImage, { width: 10, height: 5, link: true });
      };

      return expect
        .promise((resolve, reject) => {
          const options = {};

          if (typeof value !== 'number' && typeof value !== 'undefined') {
            ['ignoreColors', 'ignoreAntialiasing'].forEach((optionName) => {
              if (optionName in value) {
                const ignoreValue = optionName.replace(
                  /^ignore(.)/,
                  (match, firstChar) => firstChar.toLowerCase()
                );

                options.ignore = Array.concat(
                  options.ignore || [],
                  ignoreValue
                );

                delete value[optionName];
              }
            });
          }

          resemble.compare(subject, otherImage, options, (err, resemblance) => {
            if (err) {
              reject(err);
            } else {
              resolve(resemblance);
            }
          });
        })
        .then((data) => {
          data.mismatchPercentage = data.misMatchPercentage;
          delete data.misMatchPercentage;
          if (typeof data.mismatchPercentage === 'string') {
            data.mismatchPercentage = parseFloat(data.mismatchPercentage);
          }
          // remove properties returned from newer the resemble/canvas versions
          delete data.rawMisMatchPercentage;
          delete data.diffBounds;

          const getImageDataUrl = data.getImageDataUrl;
          // These are noisy in the 'to satisfy' diff output
          delete data.analysisTime;
          delete data.getBuffer;
          delete data.getImageDataUrl;
          delete data.pngStream;

          let normalizedValue;

          if (typeof value === 'number') {
            normalizedValue = {
              isSameDimensions: true,
              mismatchPercentage: expect.it('to be less than', value),
            };
          } else if (value) {
            normalizedValue = objectAssign({}, value);

            if ('misMatchPercentage' in value) {
              normalizedValue.mismatchPercentage = value.misMatchPercentage;
              delete normalizedValue.misMatchPercentage;
            }
          } else {
            normalizedValue = {
              isSameDimensions: true,
              mismatchPercentage: expect.it('to be less than', 1),
            };
          }

          return expect.withError(
            () => expect(data, 'to satisfy', normalizedValue),
            (err) => {
              expect.fail({
                diff(output, diff, inspect, equal) {
                  output
                    .append(err.getDiff(output.format))
                    .nl(2)
                    .image(getImageDataUrl.call(data), {
                      fallbackToDisc: true,
                    });

                  output.inline = false;
                  return output;
                },
              });
            }
          );
        });
    });
  },
};
