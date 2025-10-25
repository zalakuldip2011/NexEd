const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  // Send OTP verification email
  async sendOTPEmail(email, username, otp) {
    const mailOptions = {
      from: {
        name: 'Edemy Platform',
        address: process.env.EMAIL_FROM || process.env.EMAIL_USER
      },
      to: email,
      subject: 'Verify Your Email - Edemy Account',
      html: this.getOTPEmailTemplate(username, otp)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('OTP email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  // Send welcome email after verification
  async sendWelcomeEmail(email, username) {
    const mailOptions = {
      from: {
        name: 'Edemy Platform',
        address: process.env.EMAIL_FROM || process.env.EMAIL_USER
      },
      to: email,
      subject: 'Welcome to Edemy! 🎉',
      html: this.getWelcomeEmailTemplate(username)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't throw error for welcome email as it's not critical
      return { success: false, error: error.message };
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email, username, otp) {
    const mailOptions = {
      from: {
        name: 'Edemy Platform',
        address: process.env.EMAIL_FROM || process.env.EMAIL_USER
      },
      to: email,
      subject: 'Reset Your Password - Edemy Account',
      html: this.getPasswordResetEmailTemplate(username, otp)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  // OTP email template
  getOTPEmailTemplate(username, otp) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #0f172a;
            color: #e2e8f0;
            line-height: 1.6;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }
          .header {
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            padding: 40px 30px;
            text-align: center;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: white;
            margin-bottom: 10px;
          }
          .header-text {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 20px;
            color: #f8fafc;
          }
          .message {
            font-size: 16px;
            margin-bottom: 30px;
            color: #cbd5e1;
          }
          .otp-container {
            background: rgba(59, 130, 246, 0.1);
            border: 2px solid #3b82f6;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
          }
          .otp-label {
            font-size: 14px;
            color: #94a3b8;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .otp-code {
            font-size: 36px;
            font-weight: bold;
            color: #3b82f6;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
          }
          .expiry-info {
            background: rgba(239, 68, 68, 0.1);
            border-left: 4px solid #ef4444;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
          }
          .expiry-text {
            color: #fca5a5;
            font-size: 14px;
          }
          .footer {
            background: #1e293b;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #334155;
          }
          .footer-text {
            color: #64748b;
            font-size: 14px;
            margin-bottom: 10px;
          }
          .security-note {
            background: rgba(34, 197, 94, 0.1);
            border-left: 4px solid #22c55e;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
          }
          .security-text {
            color: #86efac;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">📚 Edemy</div>
            <div class="header-text">Your Learning Journey Starts Here</div>
          </div>
          
          <div class="content">
            <div class="greeting">Hello ${username}! 👋</div>
            
            <div class="message">
              Thank you for signing up with Edemy! To complete your registration and secure your account, 
              please verify your email address using the OTP code below.
            </div>
            
            <div class="otp-container">
              <div class="otp-label">Your Verification Code</div>
              <div class="otp-code">${otp}</div>
            </div>
            
            <div class="expiry-info">
              <div class="expiry-text">
                ⏰ This code will expire in 10 minutes for security reasons.
              </div>
            </div>
            
            <div class="security-note">
              <div class="security-text">
                🔒 For your security, never share this code with anyone. Our team will never ask for your verification code.
              </div>
            </div>
            
            <div class="message">
              Once verified, you'll have full access to our platform with thousands of courses, 
              expert instructors, and a vibrant learning community.
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-text">
              If you didn't create an account with Edemy, please ignore this email.
            </div>
            <div class="footer-text">
              Need help? Contact us at support@edemy.com
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Welcome email template
  getWelcomeEmailTemplate(username) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Edemy</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #0f172a;
            color: #e2e8f0;
            line-height: 1.6;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }
          .header {
            background: linear-gradient(135deg, #22c55e 0%, #3b82f6 100%);
            padding: 40px 30px;
            text-align: center;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: white;
            margin-bottom: 10px;
          }
          .header-text {
            color: rgba(255, 255, 255, 0.9);
            font-size: 18px;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 20px;
            color: #f8fafc;
            text-align: center;
          }
          .message {
            font-size: 16px;
            margin-bottom: 25px;
            color: #cbd5e1;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
          }
          .features {
            background: rgba(59, 130, 246, 0.1);
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
          }
          .feature-item {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            color: #e2e8f0;
          }
          .feature-icon {
            margin-right: 12px;
            font-size: 18px;
          }
          .footer {
            background: #1e293b;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #334155;
          }
          .footer-text {
            color: #64748b;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎉 Welcome to Edemy!</div>
            <div class="header-text">Your learning adventure begins now</div>
          </div>
          
          <div class="content">
            <div class="greeting">Hello ${username}!</div>
            
            <div class="message">
              Congratulations! Your email has been verified and your Edemy account is now active. 
              We're excited to have you join our community of learners and educators.
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL}/dashboard" class="cta-button">
                🚀 Start Learning Now
              </a>
            </div>
            
            <div class="features">
              <div class="feature-item">
                <span class="feature-icon">📚</span>
                <span>Access to thousands of courses across various subjects</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🎓</span>
                <span>Learn from industry experts and certified instructors</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">📱</span>
                <span>Study anywhere, anytime with our mobile-friendly platform</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🏆</span>
                <span>Earn certificates and badges for completed courses</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">👥</span>
                <span>Connect with a global community of learners</span>
              </div>
            </div>
            
            <div class="message">
              Ready to start your learning journey? Explore our course catalog and find the perfect 
              course to advance your skills and career.
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-text">
              Questions? We're here to help! Contact us at support@edemy.com
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Password reset email template
  getPasswordResetEmailTemplate(username, otp) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #0f172a;
            color: #e2e8f0;
            line-height: 1.6;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }
          .header {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            padding: 40px 30px;
            text-align: center;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: white;
            margin-bottom: 10px;
          }
          .header-text {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 20px;
            color: #f8fafc;
          }
          .message {
            font-size: 16px;
            margin-bottom: 30px;
            color: #cbd5e1;
          }
          .otp-container {
            background: rgba(239, 68, 68, 0.1);
            border: 2px solid #ef4444;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
          }
          .otp-label {
            font-size: 14px;
            color: #94a3b8;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .otp-code {
            font-size: 36px;
            font-weight: bold;
            color: #ef4444;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
          }
          .expiry-info {
            background: rgba(239, 68, 68, 0.1);
            border-left: 4px solid #ef4444;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
          }
          .expiry-text {
            color: #fca5a5;
            font-size: 14px;
          }
          .footer {
            background: #1e293b;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #334155;
          }
          .footer-text {
            color: #64748b;
            font-size: 14px;
            margin-bottom: 10px;
          }
          .security-note {
            background: rgba(239, 68, 68, 0.1);
            border-left: 4px solid #ef4444;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
          }
          .security-text {
            color: #fca5a5;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🔒 Edemy</div>
            <div class="header-text">Password Reset Request</div>
          </div>
          
          <div class="content">
            <div class="greeting">Hello ${username}! 👋</div>
            
            <div class="message">
              We received a request to reset your password for your Edemy account. 
              Use the verification code below to set a new password.
            </div>
            
            <div class="otp-container">
              <div class="otp-label">Your Reset Code</div>
              <div class="otp-code">${otp}</div>
            </div>
            
            <div class="expiry-info">
              <div class="expiry-text">
                ⏰ This code will expire in 10 minutes for security reasons.
              </div>
            </div>
            
            <div class="security-note">
              <div class="security-text">
                🔒 If you didn't request this password reset, please ignore this email and your password will remain unchanged.
              </div>
            </div>
            
            <div class="message">
              For your security, never share this reset code with anyone. Our team will never ask for your reset code.
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-text">
              If you didn't request a password reset, please ignore this email.
            </div>
            <div class="footer-text">
              Need help? Contact us at support@edemy.com
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Test email connection
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service connected successfully');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();