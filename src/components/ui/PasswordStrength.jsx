'use client';

import React from 'react';

const PasswordStrength = ({ password }) => {
  const getStrength = () => {
    if (!password) return { level: 0, text: '', color: '' };

    let strength = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    strength = Object.values(checks).filter(Boolean).length;

    const levels = [
      { level: 0, text: '', color: '', width: '0%' },
      { level: 1, text: 'Very Weak', color: 'bg-red-500', width: '20%' },
      { level: 2, text: 'Weak', color: 'bg-orange-500', width: '40%' },
      { level: 3, text: 'Fair', color: 'bg-yellow-500', width: '60%' },
      { level: 4, text: 'Good', color: 'bg-green-500', width: '80%' },
      { level: 5, text: 'Strong', color: 'bg-green-600', width: '100%' },
    ];

    return { ...levels[strength], checks };
  };

  const { text, color, width, checks } = getStrength();

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">Password strength:</span>
        <span className={`text-xs font-medium ${
          text === 'Strong' ? 'text-green-600' :
          text === 'Good' ? 'text-green-500' :
          text === 'Fair' ? 'text-yellow-500' :
          text === 'Weak' ? 'text-orange-500' :
          'text-red-500'
        }`}>
          {text}
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 transition-all duration-300 ${color}`}
          style={{ width }}
        />
      </div>

      {checks && (
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div className={`flex items-center ${checks.length ? 'text-green-600' : 'text-gray-400'}`}>
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              {checks.length ? (
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              )}
            </svg>
            8+ characters
          </div>
          <div className={`flex items-center ${checks.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              {checks.uppercase ? (
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              )}
            </svg>
            Uppercase
          </div>
          <div className={`flex items-center ${checks.number ? 'text-green-600' : 'text-gray-400'}`}>
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              {checks.number ? (
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              )}
            </svg>
            Number
          </div>
          <div className={`flex items-center ${checks.special ? 'text-green-600' : 'text-gray-400'}`}>
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              {checks.special ? (
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              )}
            </svg>
            Special char
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordStrength;
