const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const moment = require("moment");

admin.initializeApp();

// 1. Email Account Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "aumjewellers.noreply@gmail.com", 
    pass: "fqwp xfep hpip djnh" // Secure App Password provided by Admin
  }
});

// 2. Broadcast Custom Push Notifications (Admin Hub)
exports.sendCustomNotification = onDocumentCreated("notifications/{notificationId}", async (event) => {
  const notificationData = event.data.data();
  if (!notificationData) return;

  const title = notificationData.title || "Aum Jewellers";
  const body = notificationData.body || "You have a new message.";
  
  try {
    const usersSnapshot = await admin.firestore().collection("users").get();
    const tokens = [];

    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      if (userData.fcmToken) {
        tokens.push(userData.fcmToken);
      }
    });

    console.log(`Found ${tokens.length} users with FCM tokens`);

    if (tokens.length === 0) {
      console.log("No tokens found. Aborting push notification.");
      return null;
    }

    let successCount = 0;
    let failureCount = 0;

    // Firebase sendEachForMulticast supports a maximum of 500 tokens per call
    const chunkSize = 500;
    for (let i = 0; i < tokens.length; i += chunkSize) {
      const chunk = tokens.slice(i, i + chunkSize);
      const message = {
        notification: { title: title, body: body },
        tokens: chunk,
      };
      const response = await admin.messaging().sendEachForMulticast(message);
      successCount += response.successCount;
      failureCount += response.failureCount;

      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(chunk[idx]);
            console.error(`Error sending to token ${chunk[idx]}:`, resp.error);
          }
        });
      }
    }

    console.log(`Push Notification Results: Success=${successCount}, Failure=${failureCount}`);
    
    await event.data.ref.update({
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      successCount: successCount,
      failureCount: failureCount
    });

    return null;
  } catch (error) {
    console.error("Error sending push notification:", error);
    return null;
  }
});



// 3. Automated Email Receipts for SIP Payments
exports.sendEmailReceipt = onDocumentCreated("clients/{email}/sip_records/{docId}", async (event) => {
  const record = event.data.data();
  const clientEmail = event.params.email;

  if (!record || !clientEmail) return null;

  try {
    const formattedDate = moment(record.date).format("MMMM Do YYYY");
    const amountStr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(record.amount);
    
    let goldText = "";
    if (record.plan === "Premium Flexible Bishi Plan" && record.explicitGoldBooked > 0) {
      goldText = `
                <tr>
                  <td style="padding: 12px 0; color: rgba(255,255,255,0.6); font-size: 15px; border-bottom: 1px solid rgba(255,255,255,0.05);">Gold Booked</td>
                  <td style="padding: 12px 0; color: #c79a6b; font-size: 15px; font-weight: bold; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.05);">${record.explicitGoldBooked} Grams</td>
                </tr>`;
    }

    const mailOptions = {
      from: '"Aum Jewellers" <aumjewellers.noreply@gmail.com>',
      to: clientEmail,
      subject: `Payment Receipt: ${amountStr} - Aum Jewellers`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #161811; border: 1px solid rgba(199, 154, 107, 0.2); border-radius: 12px; overflow: hidden; color: #f4f4f4;">
          <div style="background: linear-gradient(135deg, #161811 0%, #2a2d21 100%); padding: 40px 20px; text-align: center; border-bottom: 2px solid #c79a6b;">
            <h1 style="color: #c79a6b; margin: 0; font-size: 32px; letter-spacing: 2px; text-transform: uppercase;">Aum Jewellers</h1>
            <p style="color: rgba(255,255,255,0.6); margin: 10px 0 0 0; font-size: 14px; letter-spacing: 4px; text-transform: uppercase;">Payment Receipt</p>
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="color: #ffffff; margin-top: 0; font-size: 24px; font-weight: 500;">Payment Successful <span style="color:#c79a6b;">✓</span></h2>
            <p style="color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6;">Dear Customer,</p>
            <p style="color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6;">We have successfully received your payment. Below are your transaction details for your records:</p>
            
            <div style="background-color: rgba(255,255,255,0.03); padding: 25px; border-radius: 8px; border: 1px solid rgba(199, 154, 107, 0.15); margin: 30px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; color: rgba(255,255,255,0.6); font-size: 15px; border-bottom: 1px solid rgba(255,255,255,0.05);">Amount Paid</td>
                  <td style="padding: 12px 0; color: #c79a6b; font-size: 18px; font-weight: bold; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.05);">${amountStr}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: rgba(255,255,255,0.6); font-size: 15px; border-bottom: 1px solid rgba(255,255,255,0.05);">Plan</td>
                  <td style="padding: 12px 0; color: #ffffff; font-size: 15px; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.05);">${record.plan}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: rgba(255,255,255,0.6); font-size: 15px; border-bottom: 1px solid rgba(255,255,255,0.05);">Payment Mode</td>
                  <td style="padding: 12px 0; color: #ffffff; font-size: 15px; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.05); text-transform: uppercase;">${record.source}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: rgba(255,255,255,0.6); font-size: 15px; border-bottom: 1px solid rgba(255,255,255,0.05);">Date</td>
                  <td style="padding: 12px 0; color: #ffffff; font-size: 15px; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.05);">${formattedDate}</td>
                </tr>
                ${goldText}
              </table>
            </div>
            
            <p style="color: rgba(255,255,255,0.5); font-size: 13px; text-align: center; margin-top: 40px; letter-spacing: 1px;">THANK YOU FOR TRUSTING</p>
            <p style="color: #c79a6b; font-size: 16px; text-align: center; margin-top: 5px; letter-spacing: 2px; text-transform: uppercase;">Aum Jewellers</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email receipt sent to ${clientEmail}`);

    // Add Push Notification for Payment
    try {
      const userQuery = await admin.firestore().collection("users").where("email", "==", clientEmail).get();
      if (!userQuery.empty) {
        const userData = userQuery.docs[0].data();
        if (userData.fcmToken) {
          const pushMessage = {
            notification: {
              title: "Payment Successful 💰",
              body: `We've received your payment of ${amountStr} for ${record.plan}.`,
            },
            token: userData.fcmToken,
          };
          await admin.messaging().send(pushMessage);
          console.log(`Push notification sent to ${clientEmail}`);
        }
      }
    } catch (pushErr) {
      console.error("Error sending payment push notification:", pushErr);
    }

    return null;

  } catch (error) {
    console.error("Error sending email receipt:", error);
    return null;
  }
});

// 4. Automated Monthly SIP Reminders (Rolling 27-Day Check)
exports.scheduledSipReminders = onSchedule("every day 09:00", async (event) => {
  try {
    const clientsSnapshot = await admin.firestore().collection("clients").get();
    
    // We want to remind people exactly 27 days after their last payment.
    const targetDate = moment().subtract(27, 'days').startOf('day');

    for (const clientDoc of clientsSnapshot.docs) {
      const email = clientDoc.id;
      
      // Get their most recent SIP record
      const sipRecords = await admin.firestore()
        .collection("clients")
        .doc(email)
        .collection("sip_records")
        .orderBy("date", "desc")
        .limit(1)
        .get();
        
      if (sipRecords.empty) continue;
      
      const lastRecord = sipRecords.docs[0].data();
      const lastPaymentDate = moment(lastRecord.date).startOf('day');
      
      // If their last payment was exactly 27 days ago
      if (lastPaymentDate.isSame(targetDate)) {
        // Find their FCM token from the users collection
        const userQuery = await admin.firestore().collection("users").where("email", "==", email).get();
        if (!userQuery.empty) {
          const userData = userQuery.docs[0].data();
          if (userData.fcmToken) {
            
            const message = {
              notification: {
                title: "Aum Jewellers SIP Reminder 🌟",
                body: "Hi! Your next SIP payment is due soon. Open the app to view your dashboard.",
              },
              token: userData.fcmToken,
            };

            await admin.messaging().send(message);
            console.log(`Reminder push sent to ${email}`);
          }
        }
      }
    }
    return null;

  } catch (error) {
    console.error("Error running scheduled SIP reminders:", error);
    return null;
  }
});

// 5. Physical Card Upload Notification
exports.sendCardUploadNotification = onDocumentUpdated("users/{userId}", async (event) => {
  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();

  const beforeCards = beforeData.physicalCards || [];
  const afterCards = afterData.physicalCards || [];

  if (afterCards.length > beforeCards.length) {
    // Determine the newly added card (assuming it was arrayUnion'd to the end)
    const newCard = afterCards[afterCards.length - 1];
    const clientEmail = afterData.email;
    if (!clientEmail) return null;

    try {
      // 1. Send Email
      const mailOptions = {
        from: '"Aum Jewellers" <aumjewellers.noreply@gmail.com>',
        to: clientEmail,
        subject: `Your Bishi Card is Updated - Aum Jewellers`,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #161811; border: 1px solid rgba(199, 154, 107, 0.2); border-radius: 12px; overflow: hidden; color: #f4f4f4;">
            <div style="background: linear-gradient(135deg, #161811 0%, #2a2d21 100%); padding: 40px 20px; text-align: center; border-bottom: 2px solid #c79a6b;">
              <h1 style="color: #c79a6b; margin: 0; font-size: 32px; letter-spacing: 2px; text-transform: uppercase;">Aum Jewellers</h1>
              <p style="color: rgba(255,255,255,0.6); margin: 10px 0 0 0; font-size: 14px; letter-spacing: 4px; text-transform: uppercase;">Bishi Card Update</p>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #ffffff; margin-top: 0; font-size: 24px; font-weight: 500;">Card Uploaded <span style="color:#c79a6b;">💳</span></h2>
              <p style="color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6;">Dear Customer,</p>
              <p style="color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6;">Your physical Bishi card for <strong>${newCard.month}</strong> (${newCard.plan}) has been uploaded and is now available to view.</p>
              <div style="text-align: center; margin-top: 40px; margin-bottom: 20px;">
                <a href="${newCard.url}" style="background-color: #c79a6b; color: #111; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; letter-spacing: 1px; text-transform: uppercase;">View Your Card</a>
              </div>
              <p style="color: rgba(255,255,255,0.5); font-size: 13px; text-align: center; margin-top: 40px; letter-spacing: 1px;">THANK YOU FOR TRUSTING</p>
              <p style="color: #c79a6b; font-size: 16px; text-align: center; margin-top: 5px; letter-spacing: 2px; text-transform: uppercase;">Aum Jewellers</p>
            </div>
          </div>
        `
      };
      await transporter.sendMail(mailOptions);
      console.log(`Card upload email sent to ${clientEmail}`);

      // 2. Send Push Notification
      if (afterData.fcmToken) {
        const pushMessage = {
          notification: {
            title: "Bishi Card Updated 💳",
            body: `Your physical card for ${newCard.month} is now available in your profile.`,
          },
          token: afterData.fcmToken,
        };
        await admin.messaging().send(pushMessage);
        console.log(`Card upload push sent to ${clientEmail}`);
      }
    } catch (error) {
      console.error("Error sending card upload notifications:", error);
    }
  }
  return null;
});
