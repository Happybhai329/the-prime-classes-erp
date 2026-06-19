import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Shield, Loader2, CheckCircle, KeyRound, Lock } from 'lucide-react';
import { useForgotPassword, useVerifyOtp, useResetPassword } from '@/hooks/useAuth';

type Step = 'request' | 'verify' | 'reset' | 'success';

export const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const forgotMutation = useForgotPassword();
  const verifyMutation = useVerifyOtp();
  const resetMutation = useResetPassword();

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // ── Step 1: Request OTP ─────────────────────────────────────
  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm<{ email: string }>();

  const onRequestOtp = (data: { email: string }) => {
    setEmail(data.email);
    forgotMutation.mutate(data.email, {
      onSuccess: () => {
        setStep('verify');
        setResendCooldown(120);
      },
      onError: () => {
        // Still move to verify step to prevent enumeration
        setStep('verify');
        setResendCooldown(120);
      },
    });
  };

  // ── Step 2: Verify OTP ──────────────────────────────────────
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''));

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    const fullOtp = newDigits.join('');
    if (fullOtp.length === 6) {
      setOtp(fullOtp);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const onVerifyOtp = () => {
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) return;
    verifyMutation.mutate(
      { email, otp: fullOtp },
      {
        onSuccess: () => {
          setOtp(fullOtp);
          setStep('reset');
        },
      },
    );
  };

  const onResendOtp = () => {
    if (resendCooldown > 0) return;
    forgotMutation.mutate(email, {
      onSuccess: () => setResendCooldown(120),
      onError: () => setResendCooldown(120),
    });
  };

  // ── Step 3: Reset Password ──────────────────────────────────
  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
    watch,
  } = useForm<{ newPassword: string; confirmPassword: string }>();

  const newPasswordValue = watch('newPassword', '');

  const getPasswordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = getPasswordStrength(newPasswordValue);
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
  const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-emerald-600'];

  const onResetPassword = (data: { newPassword: string }) => {
    resetMutation.mutate(
      { email, otp, newPassword: data.newPassword },
      {
        onSuccess: () => setStep('success'),
      },
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-display font-bold text-gray-900">
            The Prime Classes
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
          {/* Step indicator */}
          {step !== 'success' && (
            <div className="flex items-center justify-center gap-2 mb-6">
              {(['request', 'verify', 'reset'] as const).map((s, i) => (
                <React.Fragment key={s}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      step === s
                        ? 'bg-primary-600 text-white'
                        : i < ['request', 'verify', 'reset'].indexOf(step)
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {i < ['request', 'verify', 'reset'].indexOf(step) ? '✓' : i + 1}
                  </div>
                  {i < 2 && <div className="w-8 h-0.5 bg-gray-200" />}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* ── Step 1: Request ──────────────────────── */}
          {step === 'request' && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-display font-bold text-gray-900">
                  Reset Password
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Enter your email and we'll send a 6-digit OTP
                </p>
              </div>

              <form onSubmit={handleEmailSubmit(onRequestOtp)} noValidate className="space-y-5">
                <div>
                  <label htmlFor="reset-email" className="label">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      placeholder="admin@primeclasses.in"
                      className={`input pl-10 ${emailErrors.email ? 'input-error' : ''}`}
                      {...registerEmail('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Enter a valid email address',
                        },
                      })}
                    />
                  </div>
                  {emailErrors.email && (
                    <p className="mt-1 text-xs text-danger-500" role="alert">
                      {emailErrors.email.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={forgotMutation.isPending}
                  className="btn-primary w-full py-3"
                  id="forgot-submit"
                >
                  {forgotMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </button>
              </form>
            </>
          )}

          {/* ── Step 2: Verify OTP ──────────────────── */}
          {step === 'verify' && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-display font-bold text-gray-900">
                  Enter OTP
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  We sent a 6-digit code to <span className="font-medium text-gray-700">{email}</span>
                </p>
              </div>

              <div className="space-y-5">
                <div className="flex justify-center gap-2" id="otp-input-group">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { otpInputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                      aria-label={`OTP digit ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={onVerifyOtp}
                  disabled={otpDigits.join('').length !== 6 || verifyMutation.isPending}
                  className="btn-primary w-full py-3"
                  id="verify-otp-submit"
                >
                  {verifyMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4 mr-2" />
                      Verify OTP
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    onClick={onResendOtp}
                    disabled={resendCooldown > 0}
                    className="text-sm text-primary-600 hover:text-primary-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0
                      ? `Resend OTP in ${Math.floor(resendCooldown / 60)}:${String(resendCooldown % 60).padStart(2, '0')}`
                      : 'Resend OTP'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── Step 3: Reset Password ──────────────── */}
          {step === 'reset' && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-display font-bold text-gray-900">
                  Set New Password
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a strong password for your account
                </p>
              </div>

              <form onSubmit={handleResetSubmit(onResetPassword)} noValidate className="space-y-5">
                <div>
                  <label htmlFor="new-password" className="label">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="new-password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Minimum 8 characters"
                      className={`input pl-10 ${resetErrors.newPassword ? 'input-error' : ''}`}
                      {...registerReset('newPassword', {
                        required: 'Password is required',
                        minLength: { value: 8, message: 'Password must be at least 8 characters' },
                      })}
                    />
                  </div>
                  {newPasswordValue && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                              level <= strength ? strengthColors[strength] : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{strengthLabels[strength]}</p>
                    </div>
                  )}
                  {resetErrors.newPassword && (
                    <p className="mt-1 text-xs text-danger-500" role="alert">
                      {resetErrors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirm-password" className="label">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Repeat your password"
                      className={`input pl-10 ${resetErrors.confirmPassword ? 'input-error' : ''}`}
                      {...registerReset('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (val) =>
                          val === newPasswordValue || 'Passwords do not match',
                      })}
                    />
                  </div>
                  {resetErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-danger-500" role="alert">
                      {resetErrors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={resetMutation.isPending}
                  className="btn-primary w-full py-3"
                  id="reset-password-submit"
                >
                  {resetMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            </>
          )}

          {/* ── Success ─────────────────────────────── */}
          {step === 'success' && (
            <div className="text-center py-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 mx-auto mb-4">
                <CheckCircle className="h-7 w-7 text-emerald-600" />
              </div>
              <h2 className="text-xl font-display font-bold text-gray-900 mb-2">
                Password Reset Complete
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Your password has been successfully updated. You can now sign in with your new password.
              </p>
              <Link to="/login" className="btn-primary inline-flex items-center py-3 px-6">
                Back to Sign In
              </Link>
            </div>
          )}

          {/* Back to login link (not on success) */}
          {step !== 'success' && (
            <Link
              to="/login"
              className="flex items-center gap-2 mt-6 text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
