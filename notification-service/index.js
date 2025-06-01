import express from 'express';
import dotenv from 'dotenv';
import { sendMail } from './mailer.js';
import cors from 'cors'; 

dotenv.config();
const app = express();
app.use(cors());   //we can keep the ex : {origin:xxx.com} this only only that specific one
app.use(express.json());

app.get("/",(req,res)=>{
  res.send("notification-service is alive");
});

app.post('/api/send-email', async (req, res) => {
  const { to, subject, message } = req.body;

  if (!to || !subject || !message) {
    return res.status(400).json({ error: 'Missing to, subject, or message' });
  }

  try {
    await sendMail({ to, subject, message });
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
});

app.listen(7000, () => {
  console.log('📬 Notification service listening on port 7000');
});
