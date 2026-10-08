import { NextResponse } from 'next/server';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import bcrypt from 'bcryptjs';

const ALLOWED_ADMIN_ROLES = [
  'Super Admin',
  'Admin'
];

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = (body.email || '').trim().toLowerCase();
    const password = (body.password || '').trim();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // 1. Verify against real Firestore database
    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const userDoc = snap.docs[0];
        const userData = userDoc.data();

        // Check account status
        if (userData.status === 'Inactive') {
          return NextResponse.json(
            { success: false, message: 'Your account has been deactivated. Please contact support.' },
            { status: 403 }
          );
        }

        // Check role authorization
        if (!ALLOWED_ADMIN_ROLES.includes(userData.role)) {
          return NextResponse.json(
            { success: false, message: 'Access denied. Account lacks administrative privileges.' },
            { status: 403 }
          );
        }

        // Verify bcrypt password hash
        let isMatch = false;
        if (userData.password) {
          if (userData.password.startsWith('$2')) {
            isMatch = await bcrypt.compare(password, userData.password);
          } else {
            isMatch = password === userData.password;
          }
        }

        if (isMatch) {
          // Update lastLogin in Firestore
          try {
            await updateDoc(doc(db, 'users', userDoc.id), {
              lastLogin: new Date().toISOString()
            });
          } catch {
            // Ignore non-critical timestamp update failure
          }

          const token = 'medlab-auth-' + Buffer.from(email + ':' + Date.now()).toString('base64');
          return NextResponse.json({
            success: true,
            token,
            user: {
              id: userDoc.id,
              name: userData.name || 'Admin',
              email: userData.email,
              role: userData.role,
              phone: userData.phone,
              status: userData.status || 'Active',
              permissions: Array.isArray(userData.permissions)
                ? userData.permissions
                : (userData.role === 'Super Admin'
                    ? [
                        'products', 'categories', 'media', 'enquiries', 'quotations',
                        'support', 'ai', 'logs', 'database', 'settings', 'users'
                      ]
                    : [])
            }
          });
        }
      }
    } catch (dbError: any) {
      console.error('[Admin Login Route DB Error]:', dbError?.message);
    }

    // 2. Recovery fallback from .env.local
    const masterEmail = (process.env.ADMIN_EMAIL || 'admin@medlabinnovate.co.ke').toLowerCase();
    const masterPassword = process.env.ADMIN_PASSWORD || 'Medlab@Admin#2026';
    const isMasterEmailMatch = 
      email === masterEmail || 
      email === masterEmail.replace('.co.ke', '.com') || 
      email === masterEmail.replace('.com', '.co.ke');

    if (isMasterEmailMatch && password === masterPassword) {
      const token = 'medlab-auth-' + Buffer.from(email + ':' + Date.now()).toString('base64');
      return NextResponse.json({
        success: true,
        token,
        user: {
          id: 'super-admin-root',
          name: 'Super Admin (System Root)',
          email: masterEmail,
          role: 'Super Admin',
          status: 'Active',
          permissions: [
            'products', 'categories', 'media', 'enquiries', 'quotations',
            'support', 'ai', 'logs', 'database', 'settings', 'users'
          ]
        }
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid credentials. Access is restricted to authorized personnel.' },
      { status: 401 }
    );
  } catch (err: any) {
    console.error('[Admin Login Route Fatal Error]:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server authentication error.' },
      { status: 500 }
    );
  }
}
