Asserts that two images resemble each other.

```javascript#async:true
return expect('testdata/People.jpg', 'to resemble', 'testdata/People2.jpg');
```

```output
expected testdata/People.jpg (image/jpeg) to resemble testdata/People2.jpg (image/jpeg)

{
  isSameDimensions: true,
  dimensionDifference: { width: 0, height: 0 },
  mismatchPercentage: 8.66 // expected 8.66 to be less than 1
}

/tmp/image.png (image/png)
```
