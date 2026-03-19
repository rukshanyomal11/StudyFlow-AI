import React from 'react';
import Link from 'next/link';
import Logo from '@/components/common/Logo';
import Button from '@/components/ui/Button';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/pricing', label: 'Pricing' },
];

export default function AuthNavbar({ currentPage }) {
  const isLoginPage = currentPage === 'login';

  return (
    <nav className="border-b border-white/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Logo size="md" href="/" />

        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant={isLoginPage ? 'primary' : 'ghost'} size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button variant={isLoginPage ? 'outline' : 'primary'} size="sm">
              Register
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
