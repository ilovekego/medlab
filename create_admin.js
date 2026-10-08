/**
 * Script to create or update an Admin user directly in Firestore
 * Usage: node create_admin.js [email] [password] [role]
 */
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, setDoc, doc, serverTimestamp } = require('firebase/firestore');
const bcrypt = require('bcryptjs');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyD9Cc5mv6zBrJlQf7Zpt3YS4_CJuEZYXjo',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'medlabinnovate.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'medlabinnovate',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'medlabinnovate.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1018725276787',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:1018725276787:web:51e24253de601b6f7f5e06',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-V324RQKL7S',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function syncAdmin() {
  const email = (process.argv[2] || 'admin@medlabinnovate.co.ke').trim().toLowerCase();
  const password = process.argv[3] || 'Admin@Medlab2026!';
  const role = process.argv[4] || 'Super Admin';
  const name = 'Super Admin';

  console.log(`\nConnecting to Firestore database for project: ${firebaseConfig.projectId}...`);
  console.log(`Target account: ${email}`);

  // Generate bcrypt hash (10 salt rounds)
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snap = await getDocs(q);

    let docId;
    if (!snap.empty) {
      docId = snap.docs[0].id;
      console.log(`Found existing user document ID: ${docId}`);
    } else {
      docId = 'admin-' + Date.now();
      console.log(`Creating new user document ID: ${docId}`);
    }

    await setDoc(doc(db, 'users', docId), {
      name,
      email,
      password: hashedPassword,
      role,
      status: 'Active',
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log('\n======================================================');
    console.log('SUCCESS! Admin account stored in Firestore:');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Role:     ${role}`);
    console.log(`Status:   Active`);
    console.log('======================================================\n');
  } catch (error) {
    console.error('Error writing to Firestore:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

syncAdmin();
