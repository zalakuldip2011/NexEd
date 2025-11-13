const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

/**
 * @desc    Download certificate
 * @route   GET /api/enrollments/:id/certificate
 * @access  Private (Student)
 */
exports.downloadCertificate = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('student', 'username email profile')
      .populate('course', 'title instructor')
      .populate('instructor', 'username profile');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check authorization
    if (enrollment.student._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to download this certificate'
      });
    }

    // Check if certificate is issued
    if (!enrollment.certificate.issued) {
      return res.status(400).json({
        success: false,
        message: 'Certificate has not been issued yet. Complete the course to receive your certificate.'
      });
    }

    // Generate certificate HTML
    const certificateHTML = generateCertificateHTML(enrollment);

    // Set response headers for HTML preview
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `inline; filename="certificate-${enrollment.certificate.certificateId}.html"`);
    
    res.send(certificateHTML);

  } catch (error) {
    console.error('Download certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download certificate',
      error: error.message
    });
  }
};

/**
 * @desc    Verify certificate
 * @route   GET /api/certificates/verify/:certificateId
 * @access  Public
 */
exports.verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const enrollment = await Enrollment.findOne({ 
      'certificate.certificateId': certificateId 
    })
      .populate('student', 'username profile')
      .populate('course', 'title')
      .populate('instructor', 'username profile');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
        valid: false
      });
    }

    if (!enrollment.certificate.issued) {
      return res.status(404).json({
        success: false,
        message: 'Certificate is not valid',
        valid: false
      });
    }

    res.json({
      success: true,
      valid: true,
      certificate: {
        certificateId: enrollment.certificate.certificateId,
        issuedAt: enrollment.certificate.issuedAt,
        student: {
          name: `${enrollment.student.profile?.firstName || ''} ${enrollment.student.profile?.lastName || ''}`.trim() || enrollment.student.username,
          email: enrollment.student.email
        },
        course: {
          title: enrollment.course.title
        },
        instructor: {
          name: `${enrollment.instructor.profile?.firstName || ''} ${enrollment.instructor.profile?.lastName || ''}`.trim() || enrollment.instructor.username
        },
        completedAt: enrollment.certificate.issuedAt,
        progress: enrollment.progress.percentage
      }
    });

  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify certificate',
      error: error.message
    });
  }
};

/**
 * Generate certificate HTML
 */
function generateCertificateHTML(enrollment) {
  const studentName = `${enrollment.student.profile?.firstName || ''} ${enrollment.student.profile?.lastName || ''}`.trim() || enrollment.student.username;
  const instructorName = `${enrollment.instructor.profile?.firstName || ''} ${enrollment.instructor.profile?.lastName || ''}`.trim() || enrollment.instructor.username;
  const courseTitle = enrollment.course.title;
  const certificateId = enrollment.certificate.certificateId;
  const issuedDate = new Date(enrollment.certificate.issuedAt).toLocaleDateString('en-US', {
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
    <title>Certificate of Completion - ${courseTitle}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Georgia', serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .certificate-container {
            background: white;
            width: 100%;
            max-width: 900px;
            padding: 60px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            position: relative;
            overflow: hidden;
        }
        
        .certificate-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 10px;
            background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #667eea);
            background-size: 200% 100%;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #667eea;
            padding-bottom: 30px;
        }
        
        .logo {
            font-size: 48px;
            font-weight: bold;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 10px;
        }
        
        .certificate-title {
            font-size: 32px;
            color: #333;
            margin-top: 20px;
            font-weight: 600;
        }
        
        .content {
            text-align: center;
            margin: 50px 0;
        }
        
        .awarded-to {
            font-size: 18px;
            color: #666;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        
        .student-name {
            font-size: 48px;
            color: #333;
            margin: 20px 0;
            font-weight: bold;
            font-family: 'Brush Script MT', cursive;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .completion-text {
            font-size: 20px;
            color: #555;
            margin: 30px 0;
            line-height: 1.8;
        }
        
        .course-name {
            font-size: 28px;
            color: #667eea;
            font-weight: bold;
            margin: 20px 0;
        }
        
        .footer {
            margin-top: 60px;
            padding-top: 40px;
            border-top: 2px solid #e0e0e0;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
        
        .signature-section {
            text-align: center;
            flex: 1;
        }
        
        .signature-line {
            width: 200px;
            height: 2px;
            background: #333;
            margin: 30px auto 10px;
        }
        
        .signature-title {
            font-size: 14px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .instructor-name {
            font-size: 18px;
            color: #333;
            font-weight: 600;
            margin-top: 5px;
        }
        
        .date-section {
            text-align: center;
            flex: 1;
        }
        
        .date-label {
            font-size: 14px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }
        
        .date-value {
            font-size: 16px;
            color: #333;
            font-weight: 600;
        }
        
        .certificate-id {
            position: absolute;
            bottom: 20px;
            right: 30px;
            font-size: 12px;
            color: #999;
            font-family: 'Courier New', monospace;
        }
        
        .seal {
            position: absolute;
            bottom: 120px;
            left: 60px;
            width: 120px;
            height: 120px;
            border: 5px solid #667eea;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            transform: rotate(-15deg);
        }
        
        .seal-text {
            text-align: center;
            color: #667eea;
            font-weight: bold;
            font-size: 14px;
        }
        
        .achievement-badge {
            display: inline-block;
            background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
            color: #333;
            padding: 8px 20px;
            border-radius: 30px;
            font-weight: bold;
            margin: 20px 0;
            box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
        }
        
        @media print {
            body {
                background: white;
            }
            
            .certificate-container {
                box-shadow: none;
                padding: 40px;
            }
        }
        
        @media (max-width: 768px) {
            .certificate-container {
                padding: 30px 20px;
            }
            
            .certificate-title {
                font-size: 24px;
            }
            
            .student-name {
                font-size: 36px;
            }
            
            .course-name {
                font-size: 20px;
            }
            
            .footer {
                flex-direction: column;
                gap: 30px;
            }
            
            .seal {
                width: 80px;
                height: 80px;
                bottom: 80px;
                left: 30px;
            }
        }
    </style>
</head>
<body>
    <div class="certificate-container">
        <div class="seal">
            <div class="seal-text">
                VERIFIED<br>COMPLETION
            </div>
        </div>
        
        <div class="header">
            <div class="logo">🎓 NexEd</div>
            <div class="certificate-title">Certificate of Completion</div>
        </div>
        
        <div class="content">
            <div class="awarded-to">This is to certify that</div>
            <div class="student-name">${studentName}</div>
            
            <div class="achievement-badge">✨ 100% Complete ✨</div>
            
            <div class="completion-text">
                has successfully completed the course
            </div>
            
            <div class="course-name">${courseTitle}</div>
            
            <div class="completion-text">
                demonstrating dedication, skill, and commitment to continuous learning
            </div>
        </div>
        
        <div class="footer">
            <div class="signature-section">
                <div class="signature-line"></div>
                <div class="signature-title">Instructor</div>
                <div class="instructor-name">${instructorName}</div>
            </div>
            
            <div class="date-section">
                <div class="date-label">Date of Completion</div>
                <div class="date-value">${issuedDate}</div>
            </div>
        </div>
        
        <div class="certificate-id">
            Certificate ID: ${certificateId}<br>
            Verify at: nexed.com/verify/${certificateId}
        </div>
    </div>
    
    <script>
        // Enable printing
        window.print = function() {
            window.print();
        };
    </script>
</body>
</html>
  `.trim();
}
