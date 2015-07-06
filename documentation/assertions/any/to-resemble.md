Asserts that two images resemble each other.

```javascript#async:true
return expect('testdata/People.jpg', 'to resemble', 'testdata/People2.jpg');
```

```output
expected 'testdata/People.jpg' to resemble 'testdata/People2.jpg'

{
  isSameDimensions: true,
  dimensionDifference: { width: 0, height: 0 },
  mismatchPercentage: 8.66 // expected 8.66 to be less than 1
}

actual:   testdata/People.jpg (image/jpeg)
expected: testdata/People2.jpg (image/jpeg)
diff:     /tmp/image.png (image/png)
```
