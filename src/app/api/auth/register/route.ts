import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/apiConfig';

export async function POST(request: Request) {
  try {
    const userData = await request.json();
    const { name, email, password, role } = userData;
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check if user already exists
    const checkResponse = await fetch(`${API_BASE_URL}/users?email=${encodeURIComponent(normalizedEmail)}`, {
      cache: 'no-store'
    });
    
    if (!checkResponse.ok) {
      throw new Error('Backend connection failed');
    }

    const existingUsers = await checkResponse.json();
    
    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json({ error: 'This email is already registered. Please sign in.' }, { status: 409 });
    }

    // 2. Create the new user
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email: normalizedEmail,
        password,
        role,
        status: 'active',
        lastLogin: 'Never'
      })
    });

    if (!response.ok) {
      throw new Error('Registration failed at storage layer');
    }

    const newUser = await response.json();

    return NextResponse.json({ 
      success: true, 
      message: 'Registration successful',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    }, { status: 201 });
    
  } catch (err: any) {
    console.error('API Registration Error:', err);
    return NextResponse.json({ error: 'Registration service unavailable' }, { status: 500 });
  }
}
