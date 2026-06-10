import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Shield, Mail, Phone, Lock, Loader2 } from 'lucide-react';
import { useLogin } from '@/hooks/useAuth';
import type { LoginRequest } from '@prime/shared-types';

type LoginMode = 'email' | 'phone';

export const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<LoginMode>('email');
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest & { rememberMe: boolean }>({
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onSubmit = (data: LoginRequest & { rememberMe: boolean }) => {
    const { rememberMe, ...loginData } = data;
    loginMutation.mutate(loginData);
  };

  return (
    <div className="min-h-screen flex" id="login-page">
      {/* Left — Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#122040] to-[#1a365d]" />

        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full border-2 border-amber-400/30" />
          <div className="absolute top-40 left-40 w-56 h-56 rounded-full border border-amber-400/20" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full border-2 border-amber-400/20" />
          <div className="absolute bottom-40 right-40 w-64 h-64 rounded-full border border-amber-400/10" />
          {/* Grid pattern */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(251,191,36,0.05)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16">
          {/* Logo / Shield */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/25">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-white tracking-tight">
                The Prime Classes
              </h1>
              <p className="text-amber-400/80 text-sm font-medium tracking-wider uppercase">
                Military School Preparation
              </p>
            </div>
          </div>

          <div className="space-y-6 max-w-md">
            <p className="text-xl text-gray-300 leading-relaxed">
              Forging tomorrow's defenders with discipline, excellence, and unwavering dedication.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { value: '500+', label: 'Students' },
                { value: '95%', label: 'Selection Rate' },
                { value: '8+', label: 'Years' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-display font-bold text-amber-400">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Target exams */}
            <div className="flex flex-wrap gap-2 pt-4">
              {['Sainik School', 'RMS', 'RIMC', 'Scholarship'].map((exam) => (
                <span
                  key={exam}
                  className="px-3 py-1 rounded-full border border-amber-400/30 text-amber-400/80 text-xs font-medium"
                >
                  {exam}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-display font-bold text-gray-900">
              The Prime Classes
            </h1>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-display font-bold text-gray-900">
                Sign In
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Access your ERP dashboard
              </p>
            </div>

            {/* Mode toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
              {[
                { key: 'email' as LoginMode, label: 'Email', icon: Mail },
                { key: 'phone' as LoginMode, label: 'Phone', icon: Phone },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMode(key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    mode === key
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  id={`login-mode-${key}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              {/* Email/Phone input */}
              <div>
                <label htmlFor="email" className="label">
                  {mode === 'email' ? 'Email Address' : 'Phone Number'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {mode === 'email' ? (
                      <Mail className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Phone className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <input
                    id="email"
                    type={mode === 'email' ? 'email' : 'tel'}
                    autoComplete={mode === 'email' ? 'email' : 'tel'}
                    placeholder={
                      mode === 'email'
                        ? 'admin@primeclasses.in'
                        : '+91 9876543210'
                    }
                    className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                    {...register('email', {
                      required:
                        mode === 'email'
                          ? 'Email is required'
                          : 'Phone number is required',
                      pattern:
                        mode === 'email'
                          ? {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: 'Enter a valid email address',
                            }
                          : undefined,
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-danger-500" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className={`input pl-10 pr-10 ${
                      errors.password ? 'input-error' : ''
                    }`}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    id="toggle-password"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-danger-500" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember me + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-primary-700 focus:ring-primary-500"
                    {...register('rememberMe')}
                    id="remember-me"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-primary-700 hover:text-primary-800"
                  id="forgot-password-link"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="btn-primary w-full py-3 text-base"
                id="login-submit"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} The Prime Classes. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
