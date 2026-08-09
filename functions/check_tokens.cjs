const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json'); // assuming it exists, or I need to find it

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function checkTokens() {
  const users = await db.collection('users').get();
  users.forEach(doc => {
    const data = doc.data();
    if (data.fcmToken) {
      console.log(`User: ${data.email}`);
      console.log(`Token: ${data.fcmToken.substring(0, 30)}...`);
    }
  });
}

checkTokens();
