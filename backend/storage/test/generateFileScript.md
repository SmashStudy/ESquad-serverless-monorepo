# In terminal

## Request Presigned URL

### Request
```bash
curl -X POST "https://zlq2juurl2.execute-api.us-east-1.amazonaws.com/dev/files/presigned-url" \
-H "Content-Type: application/json" \
-d '{
"action": "putObject",
"fileKey": "test.txt",
"contentType":"text/plain"
}'
```
### Response

```bash
{"presignedUrl":"https://s3-esquad.s3.amazonaws.com/test.txt?AWSAccessKeyId=ASIAWIJIU4H76R6TVX45&Content-Type=text%2Fplain&Expires=1730961872&Signature=OSl2yVIPyUXCHfTwW6Q6J3rN9QY%3D&X-Amzn-Trace-Id=Root%3D1-672c60a4-12e1b7997461ff516292cef5%3BParent%3D1101a0a3f9dbc8a1%3BSampled%3D0%3BLineage%3D1%3A871bca9e%3A0&x-amz-security-token=IQoJb3JpZ2luX2VjELf%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJIMEYCIQCcvxdkag0d3ycRKuHFIgNu908hD%2BAOxyypIRhGI8zMRwIhAL7qWYG4pDWeuy2dN0B8soCWa1gL0unlTWPPaJ12wYeHKqUDCEAQABoMNDMwMTE4ODU1MTY3IgxSR2tmyoaKoV9CqKUqggPod2L4KqmB0URlkUS%2BxMZtDlBwCaov28%2FoGpfP0cj3FdkgenY7D9GEtDuHPT8RgJKQGPtkIudrYVDuVOoo0naaRfedj8TUdoXAVr7T5WGWTA6F4bRGY6UIC2OP66bxnB03s3xHoPfu8q%2B1TpSk0TciCMQuh7gHdwP9VNZnKMdg1XnR5m60XJ4lTFRCLIZj7LB16NuZV59zBiWFVkzCPgQit84OG94QtArTB%2Fnk9QhmsH%2Btf19%2FerFaYkTp714imd%2FwYlWkVn2B8QEs7BxwkTXF8buPUtWxDdh2oyt8t2Q1wywI%2BgPiA36G2vCRw4wta0TT6K%2FZLprCjpqSw1bmnOveP%2B3GiUtnjlpylGj1dnox9fhj3wcyacD1vzLZt%2Fwx2lMq8UoJKmAdZnQVvaOaT%2FAZtCxI1JBm5TFyoRFD3v1etQWCYx1y5Pat8cS3artNpv9RuB8raCmyXn%2Ba3DbrGIY92kD8HlbOTG%2Fb%2FOnceqkv22g9psYMy4EFfSpKzDfdvIYnczDcwLG5BjqcAcgoAoKyfC1dRNV8ly47rGP4GzyIrTNDAYFkyTED5UG4XaRIB0Bw3F3uHuxO%2B5hAsCnO2f%2BsQAW5Uv1M5gJ5AQl1DOMEmjCvWgNl4q4q5uqkzctvn16pN2HqKIjg%2B7SlMw851EJ1pmzpG6I%2BkvJncfc0BGjsfFJFOzXH8JhlX%2FNlO%2FGDNibMPmLHEXd7%2B%2BE3QSMWRqh15d2fejIR%2Fw%3D%3D"}%
```

## Upload

### Request
```bash
curl -X PUT "https://s3-esquad.s3.amazonaws.com/test.txt?AWSAccessKeyId=ASIAWIJIU4H76R6TVX45&Content-Type=text%2Fplain&Expires=1730961872&Signature=OSl2yVIPyUXCHfTwW6Q6J3rN9QY%3D&X-Amzn-Trace-Id=Root%3D1-672c60a4-12e1b7997461ff516292cef5%3BParent%3D1101a0a3f9dbc8a1%3BSampled%3D0%3BLineage%3D1%3A871bca9e%3A0&x-amz-security-token=IQoJb3JpZ2luX2VjELf%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJIMEYCIQCcvxdkag0d3ycRKuHFIgNu908hD%2BAOxyypIRhGI8zMRwIhAL7qWYG4pDWeuy2dN0B8soCWa1gL0unlTWPPaJ12wYeHKqUDCEAQABoMNDMwMTE4ODU1MTY3IgxSR2tmyoaKoV9CqKUqggPod2L4KqmB0URlkUS%2BxMZtDlBwCaov28%2FoGpfP0cj3FdkgenY7D9GEtDuHPT8RgJKQGPtkIudrYVDuVOoo0naaRfedj8TUdoXAVr7T5WGWTA6F4bRGY6UIC2OP66bxnB03s3xHoPfu8q%2B1TpSk0TciCMQuh7gHdwP9VNZnKMdg1XnR5m60XJ4lTFRCLIZj7LB16NuZV59zBiWFVkzCPgQit84OG94QtArTB%2Fnk9QhmsH%2Btf19%2FerFaYkTp714imd%2FwYlWkVn2B8QEs7BxwkTXF8buPUtWxDdh2oyt8t2Q1wywI%2BgPiA36G2vCRw4wta0TT6K%2FZLprCjpqSw1bmnOveP%2B3GiUtnjlpylGj1dnox9fhj3wcyacD1vzLZt%2Fwx2lMq8UoJKmAdZnQVvaOaT%2FAZtCxI1JBm5TFyoRFD3v1etQWCYx1y5Pat8cS3artNpv9RuB8raCmyXn%2Ba3DbrGIY92kD8HlbOTG%2Fb%2FOnceqkv22g9psYMy4EFfSpKzDfdvIYnczDcwLG5BjqcAcgoAoKyfC1dRNV8ly47rGP4GzyIrTNDAYFkyTED5UG4XaRIB0Bw3F3uHuxO%2B5hAsCnO2f%2BsQAW5Uv1M5gJ5AQl1DOMEmjCvWgNl4q4q5uqkzctvn16pN2HqKIjg%2B7SlMw851EJ1pmzpG6I%2BkvJncfc0BGjsfFJFOzXH8JhlX%2FNlO%2FGDNibMPmLHEXd7%2B%2BE3QSMWRqh15d2fejIR%2Fw%3D%3D" \
  -T /Users/kimmin1kk/Desktop/test.txt \
  -H "Content-Type: text/plain"

```

### Response
```base
X
```
