const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
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
        name: 'NexEd Platform',
        address: process.env.EMAIL_FROM || process.env.EMAIL_USER
      },
      to: email,
      subject: 'Verify Your Email - NexEd Account',
      html: this.getOTPEmailTemplate(username, otp)
    };

    try {
      console.log(`Attempting to send OTP email to: ${email}`);
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ OTP email sent successfully:', info.messageId);
      console.log('Recipient:', email);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending OTP email to:', email);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.code === 'EENVELOPE') {
        throw new Error('Invalid email address format');
      } else if (error.code === 'EAUTH') {
        throw new Error('Email authentication failed. Check EMAIL_USER and EMAIL_PASS');
      } else if (error.responseCode === 550) {
        throw new Error('Email address rejected by recipient server');
      } else {
        throw new Error(`Failed to send verification email: ${error.message}`);
      }
    }
  }

  // Send welcome email after verification
  async sendWelcomeEmail(email, username) {
    const mailOptions = {
      from: {
        name: 'NexEd Platform',
        address: process.env.EMAIL_FROM || process.env.EMAIL_USER
      },
      to: email,
      subject: 'Welcome to NexEd! 🎉',
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
        name: 'NexEd Platform',
        address: process.env.EMAIL_FROM || process.env.EMAIL_USER
      },
      to: email,
      subject: 'Reset Your Password - NexEd Account',
      html: this.getPasswordResetEmailTemplate(username, otp)
    };

    try {
      console.log(`Attempting to send password reset email to: ${email}`);
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent successfully:', info.messageId);
      console.log('Recipient:', email);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending password reset email to:', email);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      
      // Provide more specific error message
      if (error.code === 'EENVELOPE') {
        throw new Error('Invalid email address format');
      } else if (error.code === 'EAUTH') {
        throw new Error('Email authentication failed. Check EMAIL_USER and EMAIL_PASS');
      } else if (error.responseCode === 550) {
        throw new Error('Email address rejected by recipient server');
      } else {
        throw new Error(`Failed to send password reset email: ${error.message}`);
      }
    }
  }

  // Send password change OTP email
  async sendPasswordChangeOTPEmail(email, username, otp) {
    const mailOptions = {
      from: {
        name: 'NexEd Platform',
        address: process.env.EMAIL_FROM || process.env.EMAIL_USER
      },
      to: email,
      subject: 'Verify Password Change - NexEd Account',
      html: this.getPasswordChangeOTPEmailTemplate(username, otp)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Password change OTP email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending password change OTP email:', error);
      throw new Error('Failed to send verification code');
    }
  }

  // Send account deletion confirmation email
  async sendAccountDeletionEmail(email, username, deletionDate, hasPublishedCourses) {
    const mailOptions = {
      from: {
        name: 'NexEd Platform',
        address: process.env.EMAIL_FROM || process.env.EMAIL_USER
      },
      to: email,
      subject: 'Account Deletion Request - NexEd',
      html: this.getAccountDeletionEmailTemplate(username, deletionDate, hasPublishedCourses)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Account deletion email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending account deletion email:', error);
      throw new Error('Failed to send account deletion confirmation email');
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
            <div class="logo">📚 NexEd</div>
            <div class="header-text">Your Learning Journey Starts Here</div>
          </div>
          
          <div class="content">
            <div class="greeting">Hello ${username}! 👋</div>
            
            <div class="message">
              Thank you for signing up with NexEd! To complete your registration and secure your account, 
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
              If you didn't create an account with NexEd, please ignore this email.
            </div>
            <div class="footer-text">
              Need help? Contact us at support@nexed.com
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
        <title>Welcome to NexEd</title>
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
            <div class="logo">🎉 Welcome to NexEd!</div>
            <div class="header-text">Your learning adventure begins now</div>
          </div>
          
          <div class="content">
            <div class="greeting">Hello ${username}!</div>
            
            <div class="message">
              Congratulations! Your email has been verified and your NexEd account is now active. 
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
              Questions? We're here to help! Contact us at support@nexed.com
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
            <div class="logo">🔒 NexEd</div>
            <div class="header-text">Password Reset Request</div>
          </div>
          
          <div class="content">
            <div class="greeting">Hello ${username}! 👋</div>
            
            <div class="message">
              We received a request to reset your password for your NexEd account. 
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
              Need help? Contact us at support@nexed.com
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Password change OTP email template
  getPasswordChangeOTPEmailTemplate(username, otp) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Password Change</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #e2e8f0; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 40px 30px; text-align: center; }
          .logo { font-size: 32px; font-weight: bold; color: white; margin-bottom: 10px; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 24px; font-weight: 600; margin-bottom: 20px; color: #f8fafc; }
          .message { font-size: 16px; margin-bottom: 30px; color: #cbd5e1; }
          .otp-container { background: rgba(245, 158, 11, 0.1); border: 2px solid #f59e0b; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
          .otp-code { font-size: 36px; font-weight: bold; color: #f59e0b; letter-spacing: 8px; font-family: 'Courier New', monospace; }
          .footer { background: #1e293b; padding: 30px; text-align: center; border-top: 1px solid #334155; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🔐 NexEd</div>
          </div>
          <div class="content">
            <div class="greeting">Hello ${username}!</div>
            <div class="message">You requested to change your password. Use this code to verify and continue:</div>
            <div class="otp-container">
              <div class="otp-code">${otp}</div>
            </div>
            <div class="message">This code expires in 10 minutes. If you didn't request this, please ignore this email.</div>
          </div>
          <div class="footer">
            <div style="color: #64748b; font-size: 14px;">© ${new Date().getFullYear()} NexEd. All rights reserved.</div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Account deletion email template
  getAccountDeletionEmailTemplate(username, deletionDate, hasPublishedCourses) {
    const formattedDate = new Date(deletionDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Deletion Request</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #e2e8f0; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
          .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 30px; text-align: center; }
          .logo { font-size: 32px; font-weight: bold; color: white; margin-bottom: 10px; }
          .content { padding: 40px 30px; }
          .warning-box { background: rgba(239, 68, 68, 0.1); border: 2px solid #ef4444; border-radius: 12px; padding: 25px; margin: 25px 0; }
          .warning-title { color: #fca5a5; font-size: 18px; font-weight: bold; margin-bottom: 15px; }
          .warning-text { color: #fca5a5; font-size: 14px; margin-bottom: 10px; }
          .info-box { background: rgba(59, 130, 246, 0.1); border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
          .date-highlight { color: #3b82f6; font-weight: bold; font-size: 18px; }
          .cta-button { display: inline-block; background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">⚠️ Account Deletion Request</div>
          </div>
          <div class="content">
            <h2 style="color: #f8fafc; margin-bottom: 20px;">Hello ${username},</h2>
            
            <p style="color: #cbd5e1; font-size: 16px; margin-bottom: 25px;">
              We've received your request to permanently delete your NexEd account. We're sorry to see you go!
            </p>
            
            <div class="warning-box">
              <div class="warning-title">⚠️ Important Information</div>
              <div class="warning-text">
                • Your account deletion is scheduled for: <strong>${formattedDate}</strong><br>
                • You will be unsubscribed from all enrolled courses<br>
                • All your progress and data will be permanently removed<br>
                • This action cannot be undone after the grace period<br>
                • You cannot create a new account with the same email
              </div>
            </div>
            
            ${hasPublishedCourses ? `
            <div class="warning-box">
              <div class="warning-title">📚 Instructor Information</div>
              <div class="warning-text">
                You are an instructor with published courses. Please note:<br>
                • Courses with enrollments cannot be deleted (lifetime guarantee)<br>
                • Your courses will be transferred to a generic NexEd instructor account<br>
                • No new enrollments will be accepted after account closure<br>
                • Enrolled learners will continue to have access to your courses
              </div>
            </div>
            ` : ''}
            
            <div class="info-box">
              <h3 style="color: #93c5fd; margin-bottom: 10px;">🕐 14-Day Grace Period</h3>
              <p style="color: #cbd5e1;">
                You have <strong>14 days</strong> to change your mind. To cancel this deletion request, 
                please contact us at <strong>privacy@nexed.com</strong> before the scheduled deletion date.
              </p>
            </div>
            
            <p style="color: #cbd5e1; margin-top: 25px;">
              If you didn't request this deletion or changed your mind, please contact our support team immediately.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="mailto:privacy@nexed.com" class="cta-button">
                Cancel Deletion Request
              </a>
            </div>
          </div>
          <div style="background: #1e293b; padding: 30px; text-align: center; border-top: 1px solid #334155;">
            <div style="color: #64748b; font-size: 14px;">
              For questions or concerns, contact us at privacy@nexed.com
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send final account deleted confirmation email
  async sendAccountDeletedEmail(email, username) {
    const mailOptions = {
      from: {
        name: 'NexEd Platform',
        address: process.env.EMAIL_FROM || process.env.EMAIL_USER
      },
      to: email,
      subject: 'Account Permanently Deleted - NexEd',
      html: this.getAccountDeletedEmailTemplate(username)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Account deleted confirmation email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending account deleted email:', error);
      // Don't throw error as the account is already deleted
      return { success: false, error: error.message };
    }
  }

  // Account deleted confirmation email template
  getAccountDeletedEmailTemplate(username) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Deleted</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #e2e8f0; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; }
          .checkmark { font-size: 48px; color: white; margin-bottom: 15px; }
          .logo { font-size: 28px; font-weight: bold; color: white; }
          .content { padding: 40px 30px; }
          .info-box { background: rgba(16, 185, 129, 0.1); border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
          .info-title { color: #6ee7b7; font-size: 18px; font-weight: bold; margin-bottom: 15px; }
          .info-text { color: #cbd5e1; font-size: 14px; line-height: 1.8; }
          .message { font-size: 16px; margin-bottom: 25px; color: #cbd5e1; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="checkmark">✓</div>
            <div class="logo">Account Successfully Deleted</div>
          </div>
          <div class="content">
            <p class="message">Hello <strong>${username}</strong>,</p>
            
            <p class="message">
              This email confirms that your NexEd account has been permanently deleted as requested.
            </p>
            
            <div class="info-box">
              <div class="info-title">What's Been Removed:</div>
              <div class="info-text">
                ✓ Your profile information and personal data<br>
                ✓ Course enrollments and learning progress<br>
                ✓ Reviews, ratings, and comments<br>
                ✓ Saved preferences and settings<br>
                ✓ All associated account data
              </div>
            </div>
            
            <p class="message">
              <strong>Important:</strong> This action is permanent and cannot be undone. If you wish to use NexEd 
              again in the future, you'll need to create a new account with a different email address.
            </p>
            
            <p class="message">
              We're sorry to see you go. If there's anything we could have done better, we'd love to hear your 
              feedback at <strong>feedback@nexed.com</strong>.
            </p>
            
            <p class="message">
              Thank you for being part of the NexEd learning community!
            </p>
          </div>
          <div style="background: #1e293b; padding: 30px; text-align: center; border-top: 1px solid #334155;">
            <div style="color: #64748b; font-size: 14px;">
              © ${new Date().getFullYear()} NexEd. All rights reserved.
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