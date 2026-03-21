import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import { isValidEmail } from '@/lib/utils';

export async function POST(request) {
  try {
    const { name, email, password, role } = await request.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'student',
    });

    // Return user without password
    const responseUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: responseUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    const details = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to create account',
        ...(process.env.NODE_ENV === 'development' ? { details } : {}),
      },
      { status: 500 }
    );
  }
}
