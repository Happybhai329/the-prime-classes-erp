import React from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Shield, Loader2, CheckCircle } from 'lucide-react';
import { useForgotPassword } from '@/hooks/useAuth';

export const ForgotPasswordPage: React.FC = () => {
  const forgotMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>();

  const onSubmit = (data: { email: string }) => {
    forgotMutation.mutate(data.email);
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
          {forgotMutation.isSuccess ? (
            <div className="text-center py-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 mx-auto mb-4">
                <CheckCircle className="h-7 w-7 text-emerald-600" />
              </div>
              <h2 className="text-xl font-display font-bold text-gray-900 mb-2">
                Check your email
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                If an account exists with that email address, we've sent a password reset link.
              </p>
              <Link to="/login" className="btn-primary">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-display font-bold text-gray-900">
                  Reset Password
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Enter your email and we'll send a reset link
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
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
                      className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Enter a valid email address',
                        },
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-danger-500" role="alert">
                      {errors.email.message}
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
                    'Send Reset Link'
                  )}
                </button>
              </form>

              <Link
                to="/login"
                className="flex items-center gap-2 mt-6 text-sm text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
