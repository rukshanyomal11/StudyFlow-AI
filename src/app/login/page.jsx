'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { loginSchema } from '@/lib/validations/auth';
import Navbar from '@/components/layout/Navbar';
import FormInput from '@/components/ui/FormInput';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';

const focusPoints = [
  {
    title: 'Pick up where you left off',
    description: 'Open your planner, upcoming sessions, and current goals in one place.',
  },
  {
    title: 'See what needs attention',
    description: 'Jump back into overdue tasks, streaks, and recommended study actions.',
  },
  {
    title: 'Stay connected',
    description: 'Review notes, quizzes, and study groups without digging through menus.',
  },
];

const inputClassName = 'rounded-xl border-slate-200 bg-white py-3.5 text-[15px] shadow-sm shadow-slate-200/60 placeholder:text-slate-400';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password. Please try again.');
      } else {
        window.location.href = '/student/dashboard';
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl: '/student/dashboard' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50">
      <Navbar currentPage="login" />

      <main className="mx-auto flex w-full max-w-6xl flex-1 items-start px-4 pb-10 pt-5 sm:px-6 lg:px-8 lg:pb-16 lg:pt-8">
        <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:gap-12">
          <section className="relative hidden overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-10 shadow-[0_35px_90px_rgba(15,23,42,0.10)] backdrop-blur lg:flex lg:flex-col">
            <div className="absolute -right-20 top-0 h-56 w-56 rounded-full bg-blue-200/60 blur-3xl" />
            <div className="absolute -bottom-16 left-0 h-48 w-48 rounded-full bg-amber-200/60 blur-3xl" />

            <div className="relative z-10">
              <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                Built for focused study sessions
              </span>

              <h1 className="mt-8 max-w-lg text-5xl font-bold leading-tight text-slate-900">
                Sign in and get back to the plan.
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                StudyFlow keeps your planner, sessions, progress, and next steps in one calm workspace so you can spend less time organizing and more time studying.
              </p>
            </div>

            <div className="relative z-10 mt-10 grid gap-4">
              {focusPoints.map((point) => (
                <div
                  key={point.title}
                  className="rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-sm shadow-slate-200/70"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{point.title}</h2>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{point.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative z-10 mt-auto rounded-[1.75rem] bg-slate-900 px-6 py-5 text-white shadow-xl shadow-slate-300/40">
              <p className="text-sm leading-6 text-slate-300">
                Your study flow should feel clear, not crowded. Start from one login and continue the work that matters today.
              </p>

              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-semibold">10k+</p>
                  <p className="text-sm text-slate-400">students organizing their week with StudyFlow</p>
                </div>

                <Link href="/register" className="text-sm font-semibold text-blue-200 transition-colors hover:text-white">
                  New here? Create an account
                </Link>
              </div>
            </div>
          </section>

          <section className="flex items-start justify-center lg:pt-4">
            <div className="w-full max-w-xl rounded-[2rem] border border-white/80 bg-white/88 p-6 shadow-[0_35px_90px_rgba(15,23,42,0.12)] backdrop-blur sm:p-8">
              <div className="mb-6 lg:hidden">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
                  Welcome back
                </p>
                <h1 className="mt-3 text-3xl font-bold text-slate-900">
                  Continue your study plan.
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Access your planner, progress, groups, and recommendations from one place.
                </p>
              </div>

              <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-blue-700">StudyFlow AI</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-900">Welcome back</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Sign in to continue your learning journey with a cleaner, focused workspace.
                  </p>
                </div>

                <Link
                  href="/register"
                  className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900 sm:inline-flex"
                >
                  Create account
                </Link>
              </div>

              {error && (
                <Alert type="error" className="mb-6 rounded-2xl">
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

                <FormInput
                  {...register('password')}
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  error={errors.password?.message}
                  disabled={isLoading}
                  className={inputClassName}
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                />

                <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                  <label className="inline-flex items-center text-sm text-slate-600">
                    <input
                      {...register('rememberMe')}
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <span className="ml-2">Remember me</span>
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-blue-700 transition-colors hover:text-blue-800"
                  >
                    Forgot password?
                  </Link>
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
                      Signing in...
                    </div>
                  ) : (
                    'Sign in'
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
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </Button>

              <p className="mt-6 text-center text-sm text-slate-600">
                Don&apos;t have an account?{' '}
                <Link
                  href="/register"
                  className="font-semibold text-blue-700 transition-colors hover:text-blue-800"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
