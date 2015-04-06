unexpected-resemble
===================

[Resemble.js](http://huddle.github.io/Resemble.js/) plugin for the [Unexpected](https://unexpectedjs.github.io/) assertion library (version 7+ required).

[![NPM version](https://badge.fury.io/js/unexpected-resemble.png)](http://badge.fury.io/js/unexpected-resemble)
[![Build Status](https://travis-ci.org/unexpectedjs/unexpected-resemble.png)](https://travis-ci.org/unexpectedjs/unexpected-resemble)
[![Coverage Status](https://coveralls.io/repos/unexpectedjs/unexpected-resemble/badge.png)](https://coveralls.io/r/unexpectedjs/unexpected-resemble)
[![Dependency Status](https://david-dm.org/unexpectedjs/unexpected-resemble.png)](https://david-dm.org/unexpectedjs/unexpected-resemble)

Images can be specified either as strings (file name) or as Buffer instances.

To compare using the default options (images must have the same dimensions and be less than 1% different):

```js
it('should resemble some other image', function () {
    return expect('foo.jpg', 'to be an image resembling', 'bar.jpg');
});
```

For more fine-grained control, specify an object with comparison options,
which will matched against the result object from resemble.js with [to
satisfy](https://unexpectedjs.github.io/assertions/any/to-satisfy/) semantics:

```js
it('should resemble some other image', function () {
    return expect('foo.jpg', 'to be an image resembling', 'bar.jpg', {
        misMatchPercentage: expect.it('to be less than', 10),
        isSameDimensions: false
    });
});
```

See an [overview of all the supported comparison options](https://github.com/Huddle/Resemble.js).

License
-------

Unexpected-resemble is licensed under a standard 3-clause BSD license -- see
the `LICENSE` file for details.
