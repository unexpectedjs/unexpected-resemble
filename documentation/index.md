---
template: default.ejs
theme: dark
title: unexpected-resemble
repository: https://github.com/unexpectedjs/unexpected-resemble
---

unexpected-resemble
===================

[Resemble.js](http://huddle.github.io/Resemble.js/) plugin for the [Unexpected](https://unexpectedjs.github.io/) assertion library (version 7+ required).

[![NPM version](https://badge.fury.io/js/unexpected-resemble.svg)](http://badge.fury.io/js/unexpected-resemble)
[![Build Status](https://travis-ci.org/unexpectedjs/unexpected-resemble.svg?branch=master)](https://travis-ci.org/unexpectedjs/unexpected-resemble)
[![Coverage Status](https://coveralls.io/repos/unexpectedjs/unexpected-resemble/badge.svg)](https://coveralls.io/r/unexpectedjs/unexpected-resemble)
[![Dependency Status](https://david-dm.org/unexpectedjs/unexpected-resemble.svg)](https://david-dm.org/unexpectedjs/unexpected-resemble)

Images can be specified either as strings (file name or data: urls) or as Buffer or Uint8Array instances.

To compare using the default options (images must have the same dimensions and be less than 1% different):

```javascript#async:true
return expect('testdata/People_small.jpg', 'to resemble', 'testdata/People2_small.jpg');
```

```output
expected testdata/People_small.jpg (image/jpeg)
to resemble testdata/People2_small.jpg (image/jpeg)

{
  isSameDimensions: true,
  dimensionDifference: { width: 0, height: 0 },
  mismatchPercentage: 10.08 // should be less than 1
}

/tmp/image.png (image/png)
```

For more fine-grained control, specify an object with comparison options,
which will matched against the result object from resemble.js with [to
satisfy](https://unexpectedjs.github.io/assertions/any/to-satisfy/) semantics:


```javascript#async:true
return expect('testdata/People_small.jpg', 'to resemble', 'testdata/People2_small.jpg', {
    mismatchPercentage: expect.it('to be less than', 15),
    isSameDimensions: true
});
```

See an [overview of all the supported comparison options](https://github.com/Huddle/Resemble.js).

License
-------

Unexpected-resemble is licensed under a standard 3-clause BSD license -- see
the `LICENSE` file for details.
