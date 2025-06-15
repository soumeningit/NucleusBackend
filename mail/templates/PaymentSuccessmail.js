exports.PaymentSuccessmail = (name, amount, paymentId, orderId) => {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Course Purchase Successful</title>
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
            background-color: #ffffff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .header {
            background-color: #28a745;
            color: white;
            text-align: center;
            padding: 10px 0;
            border-radius: 10px 10px 0 0;
        }
        .content {
            padding: 20px;
        }
        .content p {
            font-size: 16px;
            line-height: 1.6;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            font-size: 16px;
            color: #ffffff;
            background-color: #28a745;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 20px;
        }
        .button:hover {
            background-color: #218838;
        }
        .footer {
            text-align: center;
            padding: 10px;
            font-size: 14px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Course Purchase Successful</h1>
        </div>
        <div class="content">
            <p>Dear ${name},</p>
            <p>Congratulations! You have successfully purchased the course: <strong>${""}</strong>.</p>
            <p><strong>Order Details:</strong></p>
            <p>Amount: ${amount}</p>
            <p>Payment ID: ${paymentId}</p>
            <p>Order ID: ${orderId}</p>
            <p>Click the button below to start learning:</p>
            <a href="${""}" class="button">Go to Course</a>
            <p>If you have any questions or need support, please feel free to contact us.</p>
        </div>
        <div class="footer">
            <p>Best regards,</p>
            <p>The Nucleus Team</p>
        </div>
    </div>
</body>
</html>`
}