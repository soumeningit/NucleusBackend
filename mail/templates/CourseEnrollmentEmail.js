// courseEnrollmentEmailTemplate.js

exports.CourseEnrollmentEmail = (courseName, studentName) => {
    return `<!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: #007bff;
                color: #ffffff;
                padding: 10px 0;
                text-align: center;
                border-radius: 8px 8px 0 0;
            }
            .header h1 {
                margin: 0;
            }
            .content {
                padding: 20px;
            }
            .footer {
                text-align: center;
                padding: 10px 0;
                color: #777;
                font-size: 14px;
            }
            .button {
                display: inline-block;
                padding: 10px 20px;
                font-size: 16px;
                color: #ffffff;
                background: #007bff;
                text-decoration: none;
                border-radius: 4px;
            }
            .button:hover {
                background: #0056b3;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Course Enrollment Successful!</h1>
            </div>
            <div class="content">
                <p>Dear ${studentName},</p>
                <p>Congratulations! You have successfully enrolled in the course: <strong>${courseName}</strong>.</p>
                <p>We are excited to have you with us. Get ready to start your learning journey!</p>
                <p>If you have any questions or need further assistance, please do not hesitate to contact us.</p>
                <p>Best regards,</p>
                <p>The Nucleus Team</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Nucleus. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>`
}

