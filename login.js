// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // serve static html/css/js

// Use Twilio Verify
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN  = process.env.TWILIO_AUTH_TOKEN;
const VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SID; // create Verify Service in Twilio console

let twilioClient = null;
if(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN){
  const Twilio = require('twilio');
  twilioClient = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

// In-memory user store (for demo). Replace with DB in production.
const users = new Map();

/**
 * POST /api/register
 * Body: { name, email, phone, password, role }
 * Action: save user (temp) and send OTP via Twilio Verify (SMS)
 */
app.post('/api/register', async (req, res) => {
  const { name, email, phone, password, role } = req.body;
  if(!name || !email || !phone || !password) return res.status(400).json({ success:false, message:'Missing fields' });

  // basic uniqueness check
  if([...users.values()].find(u => u.email === email || u.phone === phone)) {
    return res.status(409).json({ success:false, message:'User already exists' });
  }

  // store temporarily — you may store a hashed password. For demo store plain (DO NOT in production).
  users.set(phone, { name, email, phone, password, role, verified:false });

  try{
    if(twilioClient){
      // start verification using Twilio Verify API
      await twilioClient.verify.services(VERIFY_SERVICE_SID)
        .verifications.create({ to: phone, channel: 'sms' });
      return res.json({ success:true, message:'OTP sent' });
    } else {
      // Twilio not configured — development fallback: create deterministic OTP, log to console
      const demoOtp = '123456';
      console.log('DEV OTP for', phone, demoOtp);
      return res.json({ success:true, message:'DEV: OTP (check server logs) sent' });
    }
  }catch(err){
    console.error('send-otp error', err);
    return res.status(500).json({ success:false, message:'Failed to send OTP' });
  }
});

/**
 * POST /api/resend-otp
 */
app.post('/api/resend-otp', async (req, res) => {
  const { phone } = req.body;
  if(!phone) return res.status(400).json({ success:false, message:'Missing phone' });
  try{
    if(twilioClient){
      await twilioClient.verify.services(VERIFY_SERVICE_SID)
        .verifications.create({ to: phone, channel:'sms' });
      return res.json({ success:true });
    } else {
      console.log('DEV OTP resend for', phone, '-> 123456');
      return res.json({ success:true, message:'DEV: OTP resent (see server logs)' });
    }
  }catch(err){
    console.error(err);
    return res.status(500).json({ success:false, message:'Could not resend' });
  }
});

/**
 * POST /api/verify-otp
 * Body: { phone, code }
 * Action: verify using Twilio Verify, then mark user verified
 */
app.post('/api/verify-otp', async (req, res) => {
  const { phone, code } = req.body;
  if(!phone || !code) return res.status(400).json({ success:false, message:'Missing fields' });
  try{
    if(twilioClient){
      const check = await twilioClient.verify.services(VERIFY_SERVICE_SID)
        .verificationChecks.create({ to: phone, code });
      if(check.status === 'approved'){
        const u = users.get(phone);
        if(u){ u.verified = true; users.set(phone, u); }
        return res.json({ success:true });
      } else {
        return res.status(400).json({ success:false, message:'Invalid code' });
      }
    } else {
      // dev fallback
      if(code === '123456'){
        const u = users.get(phone); if(u){ u.verified = true; users.set(phone,u); }
        return res.json({ success:true });
      }
      return res.status(400).json({ success:false, message:'Invalid code' });
    }
  }catch(err){
    console.error('verify error', err);
    return res.status(500).json({ success:false, message:'Verify failed' });
  }
});

/**
 * POST /api/login
 * Body: { id (email or phone), password, role }
 */
app.post('/api/login', (req, res) => {
  const { id, password, role } = req.body;
  if(!id || !password) return res.status(400).json({ success:false, message:'Missing fields' });

  // find user
  const user = [...users.values()].find(u => u.email === id || u.phone === id);
  if(!user) return res.status(401).json({ success:false, message:'User not found' });
  if(user.password !== password) return res.status(401).json({ success:false, message:'Invalid credentials' });
  if(user.role !== role) return res.status(403).json({ success:false, message:'Role mismatch' });
  if(!user.verified) return res.status(403).json({ success:false, message:'Phone not verified' });

  // demo session — in prod issue JWT or session cookie
  return res.json({ success:true, user:{ username: user.name.split(' ')[0], role: user.role } });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log('Server running on', PORT));
