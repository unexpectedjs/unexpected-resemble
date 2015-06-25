/*global describe, it, __dirname*/
var unexpected = require('unexpected'),
    pathModule = require('path');

describe('unexpected-resemble', function () {
    var expect = unexpected.clone()
        .installPlugin(require('../lib/unexpectedResemble'));

    var peopleJpgPath = pathModule.resolve(__dirname, '..', 'testdata', 'People.jpg'),
        people2JpgPath = pathModule.resolve(__dirname, '..', 'testdata', 'People2.jpg');

    it('should succeed when the comparison is successful', function () {
        return expect(peopleJpgPath, 'to resemble', people2JpgPath, 10);
    });

    it('should fail when the comparison is unsuccessful', function () {
        return expect(
            expect(peopleJpgPath, 'to resemble', people2JpgPath, 4),
            'to be rejected with',
            function (err) {
                expect(
                    err.getErrorMessage().toString('text')
                        .replace(/^(actual|expected): .*\//gm, '$1: /path/to/')
                        .replace(/^diff: .*\.png/m, 'diff: /tmp/diff.png'),
                    'to equal',
                    "expected '" + peopleJpgPath + "'\n" +
                    "to resemble '" + people2JpgPath + "', 4\n" +
                    "\n" +
                    "{\n" +
                    "  isSameDimensions: true,\n" +
                    "  dimensionDifference: { width: 0, height: 0 },\n" +
                    "  misMatchPercentage: 8.66 // expected 8.66 to be less than 4\n" +
                    "}\n" +
                    "\n" +
                    "actual: /path/to/People.jpg\n" +
                    "expected: /path/to/People2.jpg\n" +
                    "diff: /tmp/diff.png\n"
                );
            }
        );
    });
});
