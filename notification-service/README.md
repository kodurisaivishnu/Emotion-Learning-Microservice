# 📬 Notification Service

This is a simple microservice built with **Node.js**, **Express**, and **Nodemailer** to send email notifications.  
It receives email data from a frontend and sends it using configured Gmail credentials.

---

## 🌐 Deployed Link

**Base URL**:  
[https://notification-service-qaxu.onrender.com](https://notification-service-qaxu.onrender.com)

---

## 📩 API Endpoint

### `POST /api/send-email`

Sends an email notification using the payload provided.

#### ✅ Request Body (JSON)

```json
{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "message": "Body content of the email"
}
```

---

## 🔄 Example Request

```http
POST https://notification-service-qaxu.onrender.com/api/send-email
Content-Type: application/json

{
  "to": "teacher1@example.com",
  "subject": "Student Warning",
  "message": "Student Rahul Verma did not attend the class properly."
}
```

---

## 🟢 Successful Response

```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

## 🔴 Error Response

```json
{
  "success": false,
  "error": "Failed to send email"
}
```

---

## 🔐 Environment Variables (`.env`)

```env
EMAIL=your_email@gmail.com
EMAIL_PASS=your_app_password
```

- `EMAIL`: The Gmail address used to send emails  
- `EMAIL_PASS`: The [App Password](https://myaccount.google.com/apppasswords) generated from your Gmail account

> ⚠️ **Do not use your regular Gmail password.** Use an App Password generated from your Google account with 2-Step Verification enabled.

---

## 📦 Tech Stack

- Node.js  
- Express.js  
- Nodemailer  
- dotenv  
- CORS

---

## 🧪 How to Test

You can test this API using **Postman**, **Thunder Client**, or any frontend code like this:

```js
fetch('https://notification-service-qaxu.onrender.com/api/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'teacher1@example.com',
    subject: 'Test Email',
    message: 'This is a test email sent from the notification service.'
  })
});
```

---

## 🚀 Future Improvements

- Support for file attachments  
- HTML email templates  
- Telegram notifications  
- Scheduled or batch emails  
- Retry mechanism for failed deliveries
```
