Asserts that two images resemble each other.

```javascript#async:true
return expect('testdata/People.jpg', 'to resemble', 'testdata/People2.jpg');
```

```output
expected 'testdata/People.jpg' to resemble 'testdata/People2.jpg'

{
  isSameDimensions: true,
  dimensionDifference: { width: 0, height: 0 },
  misMatchPercentage: 8.66 // expected 8.66 to be less than 1
}

actual:   testdata/People.jpg
expected: testdata/People2.jpg
diff:     /tmp/image.png
```
