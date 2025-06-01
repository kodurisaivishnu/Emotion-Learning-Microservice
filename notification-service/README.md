📬 Notification Service
This is a simple microservice built with Node.js, Express, and Nodemailer to send email notifications.
It receives an email payload from the frontend and sends an email using Gmail credentials.

🌐 Deployed Link
Base URL:
https://notification-service-qaxu.onrender.com

📩 API Endpoint
POST /api/send-email
Sends an email notification.

✅ Request Body (JSON)

{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "message": "Body content of the email"
}
🔄 Example


POST https://notification-service-qaxu.onrender.com/api/send-email
Content-Type: application/json

{
  "to": "teacher1@example.com",
  "subject": "Student Warning",
  "message": "Student Rahul Verma did not attend the class properly."
}
🟢 Successful Response

{
  "success": true,
  "message": "Email sent successfully"
}
🔴 Error Response

{
  "success": false,
  "error": "Failed to send email"
}
🔐 Environment Variables (.env)

EMAIL=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL – The Gmail address used to send emails

EMAIL_PASS – The App Password generated for your Gmail account

🔐 Do not use your actual Gmail password. Use an App Password (2FA required).

📦 Tech Stack
Node.js

Express.js

Nodemailer

dotenv

CORS

🧪 How to Test
You can use Postman, Thunder Client, or any frontend app to test this:


fetch('https://notification-service-qaxu.onrender.com/api/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'teacher1@example.com',
    subject: 'Test Email',
    message: 'This is a test email sent from the notification service.'
  })
});