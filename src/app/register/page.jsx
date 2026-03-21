'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { registerSchema } from '@/lib/validations/auth';
import Navbar from '@/components/layout/Navbar';
import FormInput from '@/components/ui/FormInput';
import Alert from '@/components/ui/Alert';
import { Button } from '@/components/ui/button';
import PasswordStrength from '@/components/ui/PasswordStrength';

const setupHighlights = [
  {
    title: 'Build a personalized study routine',
    description: 'Start with a planner that adapts to your pace, workload, and academic goals.',
  },
  {
    title: 'Choose how you learn',
    description: 'Join as a student or mentor and unlock the tools that fit your role best.',
  },
  {
    title: 'Track progress from day one',
    description: 'Keep tasks, quizzes, notes, and recommendations organized in one workspace.',
  },
];

const roleOptions = [
  {
    value: 'student',
    label: 'Student',
    description: 'Plan studies, track progress, and join groups.',
    activeClasses: 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm shadow-blue-100',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    value: 'mentor',
    label: 'Mentor',
    description: 'Guide learners, share resources, and support growth.',
    activeClasses: 'border-violet-500 bg-violet-50 text-violet-700 shadow-sm shadow-violet-100',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

const inputClassName = 'rounded-xl border-slate-200 bg-white py-3.5 text-[15px] shadow-sm shadow-slate-200/60 placeholder:text-slate-400';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'student',
      terms: false,
    },
  });

  const password = watch('password');
  const role = watch('role');

  React.useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [router, status]);

  React.useEffect(() => {
    const requestedRole = searchParams.get('role');

    if (requestedRole === 'mentor' || requestedRole === 'student') {
      setValue('role', requestedRole, { shouldValidate: true });
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      setSuccess('Account created successfully! Signing you in...');

      // Automatically sign in the user
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError('Account created but sign in failed. Please login manually.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        router.replace('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-violet-50">
      <Navbar currentPage="register" />

      <main className="mx-auto flex w-full max-w-6xl flex-1 items-start px-4 pb-10 pt-5 sm:px-6 lg:px-8 lg:pb-16 lg:pt-8">
        <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] xl:gap-12">
          <section className="relative hidden overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-10 shadow-[0_35px_90px_rgba(15,23,42,0.10)] backdrop-blur lg:flex lg:flex-col">
            <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-violet-200/60 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-blue-200/60 blur-3xl" />

            <div className="relative z-10">
              <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-sm font-semibold text-violet-700">
                Create your study workspace
              </span>

              <h1 className="mt-8 max-w-lg text-5xl font-bold leading-tight text-slate-900">
                Start strong with a clearer study setup.
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                Create your account, choose your role, and get a focused space for planning, progress, and smarter daily study decisions.
              </p>
            </div>

            <div className="relative z-10 mt-10 grid gap-4">
              {setupHighlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-sm shadow-slate-200/70"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative z-10 mt-auto rounded-[1.75rem] bg-slate-900 px-6 py-5 text-white shadow-xl shadow-slate-300/40">
              <p className="text-sm leading-6 text-slate-300">
                Join a calmer workflow for studying, mentoring, and making progress without juggling disconnected tools.
              </p>

              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-semibold">10k+</p>
                  <p className="text-sm text-slate-400">learners building better routines with StudyFlow</p>
                </div>

                <Link href="/login" className="text-sm font-semibold text-violet-200 transition-colors hover:text-white">
                  Already registered? Sign in
                </Link>
              </div>
            </div>
          </section>

          <section className="flex items-start justify-center lg:pt-4">
            <div className="w-full max-w-xl rounded-[2rem] border border-white/80 bg-white/88 p-6 shadow-[0_35px_90px_rgba(15,23,42,0.12)] backdrop-blur sm:p-8">
              <div className="mb-6 lg:hidden">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-700">
                  Create your account
                </p>
                <h1 className="mt-3 text-3xl font-bold text-slate-900">
                  Set up your study space.
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Choose your role and start using a cleaner workspace for planning and progress.
                </p>
              </div>

              <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-violet-700">StudyFlow AI</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-900">Create account</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Start your journey with a simpler, clearer setup for smarter studying.
                  </p>
                </div>

                <Link
                  href="/login"
                  className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900 sm:inline-flex"
                >
                  Sign in
                </Link>
              </div>

              {error && (
                <Alert type="error" className="mb-6 rounded-2xl">
                  {error}
                </Alert>
              )}
              {success && (
                <Alert type="success" className="mb-6 rounded-2xl">
                  {success}
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <FormInput
                  {...register('name')}
                  label="Full name"
                  type="text"
                  placeholder="John Doe"
                  autoComplete="name"
                  error={errors.name?.message}
                  disabled={isLoading}
                  className={inputClassName}
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                />

                <FormInput
                  {...register('email')}
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  error={errors.email?.message}
                  disabled={isLoading}
                  className={inputClassName}
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  }
                />

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700">
                    I am a <span className="text-red-500">*</span>
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {roleOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`
                          flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all
                          ${role === option.value
                            ? option.activeClasses
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }
                          ${isLoading ? 'cursor-not-allowed opacity-50' : ''}
                        `}
                      >
                        <input
                          {...register('role')}
                          type="radio"
                          value={option.value}
                          className="sr-only"
                          disabled={isLoading}
                        />
                        <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-100">
                          {option.icon}
                        </div>
                        <div>
                          <p className="font-semibold">{option.label}</p>
                          <p className="mt-1 text-sm leading-5 text-slate-500">{option.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {errors.role && (
                    <p className="flex items-center text-sm text-red-600">
                      <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.role.message}
                    </p>
                  )}
                </div>

                <FormInput
                  {...register('password')}
                  label="Password"
                  type="password"
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  error={errors.password?.message}
                  disabled={isLoading}
                  className={inputClassName}
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                />

                {password && <PasswordStrength password={password} />}

                <FormInput
                  {...register('confirmPassword')}
                  label="Confirm password"
                  type="password"
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  error={errors.confirmPassword?.message}
                  disabled={isLoading}
                  className={inputClassName}
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />

                <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <label className="flex items-start">
                    <input
                      {...register('terms')}
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <span className="ml-3 text-sm leading-6 text-slate-600">
                      I agree to the{' '}
                      <Link href="/terms" className="font-semibold text-blue-700 transition-colors hover:text-blue-800">
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link href="/privacy" className="font-semibold text-blue-700 transition-colors hover:text-blue-800">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>

                  {errors.terms && (
                    <p className="ml-7 flex items-center text-sm text-red-600">
                      <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.terms.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="mr-3 h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating account...
                    </div>
                  ) : (
                    'Create account'
                  )}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 font-medium text-slate-500">or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full rounded-xl border-slate-200 py-3.5 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                onClick={handleGoogleSignup}
                disabled={isLoading}
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign up with Google
              </Button>

              <p className="mt-6 text-center text-sm text-slate-600">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-blue-700 transition-colors hover:text-blue-800"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
