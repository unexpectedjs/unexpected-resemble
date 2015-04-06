/*global describe, it*/
var unexpected = require('unexpected'),
    pathModule = require('path');

describe('unexpected-resemble', function () {
    var expect = unexpected.clone()
        .installPlugin(require('../lib/unexpectedResemble'))
        .installPlugin(require('unexpected-promise'))
        .addAssertion('Error', 'to have message', function (expect, subject, value) {
            this.errorMode = 'nested';
            return expect(subject._isUnexpected ? subject.output.toString() : subject.message, 'to satisfy', value);
        });

    var peopleJpgPath = pathModule.resolve(__dirname, '..', 'testdata', 'People.jpg'),
        people2JpgPath = pathModule.resolve(__dirname, '..', 'testdata', 'People2.jpg');

    it('should succeed when the comparison is successful', function () {
        return expect(peopleJpgPath, 'to be an image resembling', people2JpgPath, 10);
    });

    it('should fail when the comparison is unsuccessful', function () {
        return expect(
            expect(peopleJpgPath, 'to be an image resembling', people2JpgPath, 4),
            'when rejected',
            'to have message',
            function (message) {
                expect(message.replace(/(analysisTime: )\d+/, '$1???'), 'to equal',
                    "expected '/home/andreas/work/unexpected-resemble/testdata/People.jpg'\n" +
                    "to be an image resembling '/home/andreas/work/unexpected-resemble/testdata/People2.jpg', 4\n" +
                    "\n" +
                    "{\n" +
                    "  isSameDimensions: true,\n" +
                    "  dimensionDifference: { width: 0, height: 0 },\n" +
                    "  misMatchPercentage: '8.66', // expected '8.66' to be less than 4\n" +
                    "  analysisTime: ???\n" +
                    "}"
                );
            }
        );
    });
});
