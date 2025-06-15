// passwordResetTemplate.js

exports.passwordReset = (url) => {
    return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="UTF-8">
        <title>Password Reset</title>
        <style>
            body {
                background-color: #f4f4f4;
                font-family: Arial, sans-serif;
                font-size: 16px;
                line-height: 1.4;
                color: #333333;
                margin: 0;
                padding: 0;
            }
    
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                text-align: center;
            }
    
            .logo {
                max-width: 200px;
                margin-bottom: 20px;
            }
    
            .message {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
            }
    
            .body {
                font-size: 16px;
                margin-bottom: 20px;
            }
    
            .button {
                display: inline-block;
                font-size: 16px;
                color: #ffffff;
                background-color: #007bff;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 4px;
                margin: 10px 0;
            }
    
            .support {
                font-size: 14px;
                color: #999999;
                margin-top: 20px;
            }
        </style>
    
    </head>
    
    <body>
        <div class="container">
            <a href="http://localhost:3000"><img class="logo" src="" alt="Logo"></a>
            <div class="message">Password Reset Request</div>
            <div class="body">
                <p>Hello,</p>
                <p>You have requested to reset your password. Please click the button below to create a new password:</p>
                <a href="${url}" class="button">Reset Password</a>
                <p>If you did not request this change, please ignore this email.</p>
            </div>
            <div class="support">
                If you have any questions or need further assistance, please feel free to reach out to us at <a href="mailto:support@yourdomain.com">support@yourdomain.com</a>.
            </div>
        </div>
    </body>
    
    </html>`;
};
