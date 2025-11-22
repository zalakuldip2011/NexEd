# Video Security Implementation Guide

## Overview
NexEd implements comprehensive video security measures to protect paid course content from unauthorized access and URL theft. This multi-layered security system ensures that video URLs are not exposed through browser inspection and that only authorized users can access premium content.

## Security Features

### 1. Multi-Layer Authentication
- **JWT Token Authentication**: All video requests require valid JWT tokens
- **User Identity Verification**: Cross-checks user identity at multiple levels
- **Enrollment Validation**: Verifies active course enrollment before video access
- **Time-Based Token Expiry**: Tokens automatically expire to prevent replay attacks

### 2. URL Obfuscation & Encryption
- **AES-256 Encryption**: Video tokens are encrypted using AES-256-CBC
- **Base64 Encoding**: Multiple layers of encoding to obscure video identifiers
- **Hash Verification**: SHA-256 hashes prevent token tampering
- **Session-Based Identifiers**: Unique session IDs for each video playback

### 3. Secure Video Loading
- **Backend Proxy Streaming**: Videos load through secure backend endpoints
- **YouTube API Integration**: Uses YouTube IFrame API without exposing direct URLs
- **Dynamic HTML Generation**: Server-side HTML generation prevents URL inspection
- **Client-Side Decryption**: Video IDs are decrypted on the client after validation

### 4. Browser Security Protection
- **Developer Tools Detection**: Automatically pauses video when dev tools are opened
- **Context Menu Blocking**: Prevents right-click access to video elements
- **Keyboard Shortcut Blocking**: Blocks F12, Ctrl+Shift+I, and other inspection shortcuts
- **Copy Protection**: Prevents video element copying and manipulation

### 5. Watermarking & Tracking
- **User Watermarks**: Displays user ID watermarks on video content
- **Access Logging**: Comprehensive logging of all video access attempts
- **IP Tracking**: Monitors and logs IP addresses for security analysis
- **Timestamp Recording**: Records exact access times for audit trails

### 6. Rate Limiting & Abuse Prevention
- **Request Rate Limiting**: Limits video access requests per IP address
- **Failed Attempt Monitoring**: Tracks and blocks suspicious access patterns
- **Token Rotation**: Automatic token rotation prevents long-term exposure
- **Concurrent Session Limits**: Prevents multiple simultaneous video sessions

## Implementation Architecture

### Frontend Security Layer
```javascript
// VideoSecurityService.js
class VideoSecurityService {
  // AES-256 encryption for video tokens
  static generateVideoToken(videoId, userId, courseId)
  
  // Developer tools detection
  static detectDevTools(callback)
  
  // Watermark application
  static addVideoWatermark(container, userId, title)
  
  // Access validation
  static validateVideoAccess(videoId, userId, courseId)
}
```

### Backend Security Layer
```javascript
// videoSecurity.js routes
router.post('/secure-player')  // Generates secure HTML player
router.post('/validate-access')  // Validates user access rights
router.get('/stream')  // Secure video streaming proxy
```

### Database Security
- **Enrollment Verification**: Cross-references user enrollments with course access
- **Payment Validation**: Ensures payment completion before video access
- **User Status Checking**: Validates active user account status

## Security Workflow

### For Paid Content:
1. **User Authentication**: Verify JWT token and user session
2. **Enrollment Check**: Validate active course enrollment
3. **Token Generation**: Create encrypted video access token
4. **Secure Loading**: Load video through backend proxy with obfuscated URLs
5. **Runtime Protection**: Enable developer tools detection and watermarking
6. **Access Monitoring**: Log access attempts and monitor for abuse

### For Free Content:
1. **Basic Validation**: Standard YouTube embed with basic protections
2. **Suggestion Blocking**: Disable related videos and branding
3. **Standard Monitoring**: Basic access logging without heavy security

## Security Headers

### HTTP Security Headers
```http
X-Frame-Options: SAMEORIGIN
Content-Security-Policy: frame-ancestors 'self'
Referrer-Policy: no-referrer
X-Content-Type-Options: nosniff
```

### CORS Configuration
- **Origin Validation**: Only allow requests from authorized domains
- **Method Restrictions**: Limit to required HTTP methods only
- **Header Filtering**: Control allowed request headers

## Environment Variables

### Required Configuration
```env
# Video encryption keys
VIDEO_SECRET_KEY=nexed-video-security-key-2024
VIDEO_ENCRYPTION_KEY=your-256-bit-encryption-key

# JWT configuration
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=24h

# Rate limiting
VIDEO_RATE_LIMIT=100
VIDEO_RATE_WINDOW=900000
```

## Security Testing

### Manual Testing Checklist
- [ ] Developer tools detection works correctly
- [ ] Video URLs are not visible in browser inspection
- [ ] Unauthorized users cannot access paid content
- [ ] Token expiry prevents old tokens from working
- [ ] Rate limiting blocks excessive requests
- [ ] Watermarks appear correctly on videos
- [ ] Context menu and keyboard shortcuts are blocked

### Automated Security Tests
```javascript
// Test token encryption/decryption
test('Video token security', () => {
  const token = VideoSecurityService.generateVideoToken(videoId, userId, courseId);
  expect(token).toBeDefined();
  expect(token).not.toContain(videoId);
});

// Test access validation
test('Access validation', async () => {
  const hasAccess = await VideoSecurityService.validateVideoAccess(videoId, userId, courseId);
  expect(hasAccess).toBeTruthy();
});
```

## Security Monitoring

### Log Analysis
- Monitor for repeated failed access attempts
- Track unusual access patterns or locations
- Analyze token usage and expiry patterns
- Review developer tools detection events

### Alert Configuration
- Set up alerts for multiple failed authentication attempts
- Monitor for unusual video access patterns
- Track token manipulation attempts
- Alert on rate limit violations

## Best Practices

### Development Guidelines
1. **Never Log Sensitive Data**: Avoid logging video IDs or tokens in plain text
2. **Regular Key Rotation**: Rotate encryption keys periodically
3. **Secure Token Storage**: Use secure, httpOnly cookies when possible
4. **Input Validation**: Always validate and sanitize user inputs
5. **Error Handling**: Provide generic error messages to avoid information leakage

### Deployment Considerations
1. **HTTPS Only**: Always serve video content over HTTPS
2. **CDN Configuration**: Configure CDN for secure video delivery
3. **Database Security**: Encrypt sensitive data at rest
4. **Backup Security**: Ensure backups are encrypted and access-controlled

## Troubleshooting

### Common Issues
1. **Videos Not Loading**: Check token generation and validation
2. **Developer Tools False Positives**: Adjust detection sensitivity
3. **Rate Limiting Issues**: Review and adjust rate limit configurations
4. **Cross-Origin Errors**: Verify CORS configuration

### Debug Mode
Enable debug logging in development:
```javascript
if (process.env.NODE_ENV === 'development') {
  console.log('Video security debug info:', { videoId, token, userId });
}
```

## Security Updates

### Version History
- **v1.0**: Basic YouTube embedding with disabled suggestions
- **v2.0**: Added comprehensive security layer with encryption
- **v2.1**: Enhanced URL obfuscation and developer tools detection
- **v2.2**: Implemented secure backend HTML generation

### Future Enhancements
- [ ] Implement DRM protection for highest-value content
- [ ] Add machine learning-based abuse detection
- [ ] Implement blockchain-based access verification
- [ ] Add biometric verification for premium content

## Compliance & Legal

### Data Protection
- Video access logs are retained for 30 days maximum
- User data is encrypted in transit and at rest
- GDPR compliance for EU users
- CCPA compliance for California residents

### Copyright Protection
- Implements industry-standard video protection measures
- Provides reasonable protection against casual piracy
- Maintains audit trails for copyright enforcement
- Supports DMCA takedown procedures

---

**Note**: This security implementation provides strong protection against casual unauthorized access and URL theft. However, no client-side security is 100% foolproof. For extremely sensitive content, consider additional measures such as DRM or server-side video processing.