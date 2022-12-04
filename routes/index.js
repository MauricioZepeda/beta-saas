require('dotenv').config();
const { Router } = require("express");
const router = Router(); 

const webpush = require("../webpush");
let pushSubscripton;

router.get('/publickey', function (req, res) { 
  res.json(process.env.PUBLIC_VAPID_KEY);
});

router.post("/subscription", async (req, res) => { 
    pushSubscripton = req.body;
    res.status(201).json();
});

router.post("/new-message", async (req, res) => {
  const { message } = req.body;
  // Payload Notification
  const payload = JSON.stringify({
    title: "My Custom Notification",
    message 
  });
  res.status(200).json();
  try {
    await webpush.sendNotification(pushSubscripton, payload);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;