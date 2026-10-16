const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { initializeFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');

// Load environment variables from .env.local
const env = {};
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.substring(0, idx).trim();
        let val = trimmed.substring(idx + 1).trim();
        val = val.replace(/^["']|["']$/g, '');
        env[key] = val;
      }
    }
  });
}

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "medlabinnovate.firebaseapp.com",
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "medlabinnovate",
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log("Connecting to Firebase Project:", firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});

const DEFAULT_PLACEHOLDER = "/images/placeholder.png";
const CLEAN_BOT_GREETING = "Hello! Welcome to Medlab Innovate Engineering. How can I assist you with biomedical equipment, pricing quotes, or technical support today?";

const TARGET_COLLECTIONS = [
  'products',
  'services',
  'website_content',
  'cms',
  'faqs',
  'knowledge_base',
  'categories',
  'brands',
  'ai_settings',
  'settings',
  'chat_conversations',
  'system_prompts'
];

function isMaliciousString(str) {
  if (typeof str !== 'string') return false;
  const lower = str.toLowerCase();
  return (
    lower.includes('notice to owner') ||
    lower.includes('first pay to the developer') ||
    lower.includes('developer payment') ||
    lower.includes('temporarily suspended') ||
    lower.includes('services suspended') ||
    lower.includes('clear invoice') ||
    lower.includes('locked until payment') ||
    (lower.includes('pay') && lower.includes('developer'))
  );
}

function cleanValue(val, key = '') {
  const lowerKey = key.toLowerCase();

  if (typeof val === 'string') {
    if (isMaliciousString(val)) {
      if (lowerKey.includes('welcome') || lowerKey.includes('greeting') || lowerKey.includes('message') || lowerKey.includes('prompt') || lowerKey.includes('bot')) {
        return CLEAN_BOT_GREETING;
      }
      if (lowerKey.includes('image')) return DEFAULT_PLACEHOLDER;
      return "";
    }
    let cleaned = val
      .replace(/🚨?\s*NOTICE TO OWNER:.*?(cleared\.|payment\.)?/gi, "")
      .replace(/⚠️?\s*FIRST PAY TO DEVELOPER.*?(pending payment\.|site\.|settlement\.)?/gi, "")
      .replace(/SERVICE SUSPENDED\s*-\s*/gi, "")
      .replace(/PAYMENT OVERDUE/gi, "")
      .replace(/^[\s\-\:\|]+/, '')
      .trim();
    return cleaned;
  }

  if (Array.isArray(val)) {
    return val
      .map(item => cleanValue(item, key))
      .filter(item => item !== "" && item !== null && !isMaliciousString(String(item)));
  }

  if (typeof val === 'object' && val !== null) {
    const cleanedObj = {};
    for (const subKey of Object.keys(val)) {
      cleanedObj[subKey] = cleanValue(val[subKey], subKey);
    }
    return cleanedObj;
  }

  return val;
}

async function cleanAllCollections() {
  let totalCleanedDocuments = 0;

  for (const colName of TARGET_COLLECTIONS) {
    console.log(`\nScanning collection: '${colName}'...`);
    try {
      const snapshot = await getDocs(collection(db, colName));
      let colCleanedCount = 0;

      for (const document of snapshot.docs) {
        const data = document.data();
        let needsUpdate = false;
        const updates = {};

        for (const key of Object.keys(data)) {
          const original = data[key];
          const cleaned = cleanValue(original, key);

          if (JSON.stringify(original) !== JSON.stringify(cleaned)) {
            updates[key] = cleaned;
            needsUpdate = true;
          }
        }

        if (needsUpdate) {
          await updateDoc(doc(db, colName, document.id), updates);
          console.log(`  [Cleaned] Collection '${colName}' -> Doc ID: ${document.id}`);
          colCleanedCount++;
        }
      }
      console.log(`Completed '${colName}': Cleaned ${colCleanedCount} out of ${snapshot.docs.length} documents.`);
      totalCleanedDocuments += colCleanedCount;
    } catch (err) {
      console.log(`Collection '${colName}' not found or empty (skipping).`);
    }
  }

  console.log(`\n========================================`);
  console.log(`ALL CLEANUP COMPLETE! Total documents sanitized: ${totalCleanedDocuments}`);
  console.log(`========================================\n`);
  process.exit(0);
}

cleanAllCollections().catch((err) => {
  console.error("Cleanup execution error:", err);
  process.exit(1);
});