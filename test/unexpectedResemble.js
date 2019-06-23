/*global unexpected*/
const pathModule = require('path');

function quoteRegExpMetaChars(str) {
  return str.replace(/[.+*{}[]()?^$]/g, '\\$&');
}

describe('unexpected-resemble', () => {
  const expect = unexpected.clone();

  expect.output.preferredWidth = 120;

  const peopleJpgPath = pathModule.resolve(
    __dirname,
    '..',
    'testdata',
    'People.jpg'
  );

  const people2JpgPath = pathModule.resolve(
    __dirname,
    '..',
    'testdata',
    'People2.jpg'
  );

  it('should succeed when the comparison is successful', () =>
    expect(peopleJpgPath, 'to resemble', people2JpgPath, 10));

  it('should fail when the comparison is unsuccessful', () =>
    expect(
      () => {
        expect(peopleJpgPath, 'to resemble', people2JpgPath, 4);
      },
      'to be rejected with',
      expect.it(err => {
        expect(
          err
            .getErrorMessage('text')
            .toString()
            .replace(
              new RegExp(
                quoteRegExpMetaChars(pathModule.resolve(__dirname, '..')),
                'g'
              ),
              '/path/to'
            )
            .replace(/^.*\.png (\(image\/png\))$/m, '/tmp/diff.png $1'),
          'to equal',
          'expected /path/to/testdata/People.jpg (image/jpeg)\n' +
            'to resemble /path/to/testdata/People2.jpg (image/jpeg), 4\n' +
            '\n' +
            '{\n' +
            '  isSameDimensions: true,\n' +
            '  dimensionDifference: { width: 0, height: 0 },\n' +
            '  mismatchPercentage: 8.66 // should be less than 4\n' +
            '}\n' +
            '\n' +
            '/tmp/diff.png (image/png)'
        );
      })
    ));

  describe('with mismatchPercentage in odd camel case', () => {
    it('should succeed when the comparison is successful', () =>
      expect(peopleJpgPath, 'to resemble', people2JpgPath, {
        misMatchPercentage: expect.it('to be less than', 10)
      }));

    it('should fail when the comparison is unsuccessful', () =>
      expect(
        () => {
          expect(peopleJpgPath, 'to resemble', people2JpgPath, {
            misMatchPercentage: expect.it('to be less than', 2)
          });
        },
        'to be rejected with',
        expect.it(err => {
          expect(
            err
              .getErrorMessage('text')
              .toString()
              .replace(
                new RegExp(
                  quoteRegExpMetaChars(pathModule.resolve(__dirname, '..')),
                  'g'
                ),
                '/path/to'
              )
              .replace(/^.*\.png (\(image\/png\))$/m, '/tmp/diff.png $1'),
            'to equal',
            'expected /path/to/testdata/People.jpg (image/jpeg)\n' +
              "to resemble /path/to/testdata/People2.jpg (image/jpeg), { misMatchPercentage: expect.it('to be less than', 2) }\n" +
              '\n' +
              '{\n' +
              '  isSameDimensions: true,\n' +
              '  dimensionDifference: { width: 0, height: 0 },\n' +
              '  mismatchPercentage: 8.66 // should be less than 2\n' +
              '}\n' +
              '\n' +
              '/tmp/diff.png (image/png)'
          );
        })
      ));
  });

  it('should compare images provided as data: urls', () =>
    expect(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAIAAAAC64paAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEgAACxIB0t1+/AAAA81JREFUOMttlF1Mm2UUx8/z8faTbqXty9pKKYU4YINF0S7EjZlF6Qg4gplEozNL2HRmJur02kTnx/WM0ahbdmP0xksdFuYNc6CDjc1OcHxtiLSFttC1peV92+fDi27oEs7VOcn/9z85yTmHSilhqxBCCCEQAMIYY7ylhv6/kEIgjAFASokfMFJKKSVCqNwGIbQFLKVEGG8qotHohfPnk8nU6ffeDQQCQohNr03+P5gxlkwmVVVVFGVycrL3cM9yPF7U9VuRyMBg2Gw2x+Nxzli1z/dQ57LrmQ8+/PzsZ2c++fitd94eHR1VDIbnenr8tbXhgYFIJGKvrOw/dkxw0X/8+GsnXy8jtDxeOn1vQ9NOvnkqmUrldd79fB+SknFGCHnl6MuNe1rDAz891X7A7fH8E4ttTk6FEISQmbk7t27eCHWGwj8PLizF6up9TfufHRm6SAg8feQoMSp7g3sLyaV8YaO36xAHYFwohFCNSSShyutteaYnzXmwq8/lclyaXj09rH3a3MqQciScudBpkgbHdXOzgSc2RMCXL5kI4oLTIpeMFSeujV2ueHJGMx+y56bHf/06EYiu5r63O3Quomv57/5ILKfXB+M2h9m+Fp5v3A4H612FIqeSKhO/jXg9nj0Gz/iVxY7Q7unU4mwiU1tpmkysI4AdFcrEUqbdXnBZHCUBT2zT2fz1jL8TcU5zBc3rr5emivGJeWoiIwtrKd3W3UgvR/W8MAkJKhIBhV3R3Qrl2Q2u+mpkKZJIJFwuF91g3Ol0fnE1FlnRbWblh9u5/hb74V1VU7O/r9yewYR6PWpv1/6xhdTNb89a1tLeA+07T53gmlYscQoSCloJYRR0MJsJreu8QTUbrdam1WvRoXPbnapF3VF3otdNtT9jUzWUanduEItVMME4p1zIbJH1tahtbIZZnCKfw3ZLLKtniwLbHGZPXXp1ZTmTL+mATNZt7uq8putM6CWGsULdFQYJMq2L5ay2r9E9PBZ/zAx11cYJo7Qa6KN+79W7f7V5LVPJ2VQsGgwGhy7+aC6sVldVguDUYTEgBOslzVG/u6nGPXev2W7EVQhsFIwKbajx/JLN+C1oNpfo7Ox49aUX8mtJbWXJ5VWFwBQQSAC/3VT7eEBK6G7xYYQWs/qX0Nb6YtAffGTubvVHw3+/Hwod7OjACH117hsAkAAIY1q+LgkghMQYCQGAwG1Vht7Y57QaHEY01bCzkgoAKYUAjLkQGOP7u10+LgSAMAIAghEAGAje5TSWbZvs9zWUEAAghGz9SR56Q1IiQAihB8kWmn8BP7bYfD0WnAsAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTUtMDYtMjVUMjI6NDk6MzcrMDI6MDAuljaFAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE1LTA0LTA2VDIzOjM2OjA2KzAyOjAw+9U3IQAAABF0RVh0anBlZzpjb2xvcnNwYWNlADIsdVWfAAAAIHRFWHRqcGVnOnNhbXBsaW5nLWZhY3RvcgAxeDEsMXgxLDF4MemV/HAAAAAASUVORK5CYII=',
      'to resemble',
      'data:image/png;base64,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',
      {
        mismatchPercentage: expect.it('to be less than', 10)
      }
    ));
});
