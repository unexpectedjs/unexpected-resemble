/*global describe, it, __dirname*/
var unexpected = require('unexpected'),
    pathModule = require('path');

describe('unexpected-resemble', function () {
    var expect = unexpected.clone()
        .installPlugin(require('../lib/unexpectedResemble'))
        .installPlugin(require('unexpected-promise'));

    var peopleJpgPath = pathModule.resolve(__dirname, '..', 'testdata', 'People.jpg'),
        people2JpgPath = pathModule.resolve(__dirname, '..', 'testdata', 'People2.jpg');

    it('should succeed when the comparison is successful', function () {
        return expect(peopleJpgPath, 'to resemble', people2JpgPath, 10);
    });

    it('should fail when the comparison is unsuccessful', function () {
        return expect(
            expect(peopleJpgPath, 'to resemble', people2JpgPath, 4),
            'when rejected',
            'to have message',
            function (message) {
                expect(
                    message
                        .replace(/^(actual|expected): .*\//gm, '$1: /path/to/')
                        .replace(/^diff: .*\.png/m, 'diff: /tmp/diff.png')
                        .replace(/(analysisTime: )\d+/, '$1?'),
                    'to equal',
                    "expected '/home/andreas/work/unexpected-resemble/testdata/People.jpg'\n" +
                    "to resemble '/home/andreas/work/unexpected-resemble/testdata/People2.jpg', 4\n" +
                    "\n" +
                    "actual: /path/to/People.jpg\n" +
                    "expected: /path/to/People2.jpg\n" +
                    "diff: /tmp/diff.png\n" +
                    "\n" +
                    "{\n" +
                    "  isSameDimensions: true,\n" +
                    "  dimensionDifference: { width: 0, height: 0 },\n" +
                    "  misMatchPercentage: '8.66', // expected '8.66' to be less than 4\n" +
                    "  analysisTime: ?\n" +
                    "}"
                );
            }
        );
    });
});
