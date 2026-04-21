import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/apiConfig';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Find the user in our database with email
    const response = await fetch(`${API_BASE_URL}/users?email=${encodeURIComponent(normalizedEmail)}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Backend connection failed');
    }

    const users = await response.json();
    
    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'User not found. Please register first.' }, { status: 404 });
    }

    const dbUser = users[0];

    // 2. Check password
    if (dbUser.password !== password) {
      return NextResponse.json({ error: 'Invalid password. Please try again.' }, { status: 401 });
    }

    // 3. Format timestamp: 2024-03-20 10:30
    const now = new Date();
    const datePart = now.toISOString().split('T')[0];
    const timePart = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const timestamp = `${datePart} ${timePart}`;
    
    // 4. Persist the last login time to the database
    await fetch(`${API_BASE_URL}/users/${dbUser.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lastLogin: timestamp })
    });
    
    // 5. Return sanitized user data
    const loggedInUser = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role
    };

    return NextResponse.json(loggedInUser);
    
  } catch (err: any) {
    console.error('API Login Error:', err);
    return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 500 });
  }
}
