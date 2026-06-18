import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, CheckCircle2, ChevronRight, Loader2, Sparkles, Building, Lock, Phone, Globe, ArrowLeft } from 'lucide-react';
import { onboardingService } from '@/services/onboarding.service';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

interface Step1Data {
  name: string;
  slug: string;
  ownerEmail: string;
}

interface Step2Data {
  otp: string;
}

interface Step3Data {
  adminEmail: string;
  adminPhone: string;
  adminPassword: string;
  customDomain?: string;
}

export const OnboardingWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tenantId, setTenantId] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<string>('professional'); // starter, professional, enterprise, franchise
  
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  // Form hooks
  const step1Form = useForm<Step1Data>();
  const step2Form = useForm<Step2Data>();
  const step3Form = useForm<Step3Data>();

  // Plans details
  const plans = [
    {
      id: 'starter',
      dbId: '', // resolved dynamically or mock
      name: 'Starter Plan',
      price: '999',
      color: 'from-blue-500 to-indigo-500',
      features: ['Online Testing', 'Parent Portal', 'Basic Reports', 'Up to 50 Students'],
      disabledFeatures: ['LMS Module', 'Mobile App Access', 'AI Analytics', 'Franchise Controls'],
    },
    {
      id: 'professional',
      name: 'Professional Plan',
      price: '2,999',
      color: 'from-amber-500 to-orange-500',
      popular: true,
      features: ['LMS Module', 'Online Testing', 'Parent Portal', 'Advanced Reports', 'Up to 300 Students'],
      disabledFeatures: ['Mobile App Access', 'AI Analytics', 'Franchise Controls'],
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      price: '5,999',
      color: 'from-purple-500 to-pink-500',
      features: ['LMS Module', 'Mobile App Integration', 'AI Performance Predictor', 'Online Testing', 'Parent Portal', 'Unlimited Students'],
      disabledFeatures: ['Franchise Controls'],
    },
    {
      id: 'franchise',
      name: 'Franchise Plan',
      price: '9,999',
      color: 'from-emerald-500 to-teal-500',
      features: ['Head Office Dashboard', 'Branch Analytics', 'Branch Performance Reports', 'Consolidated Revenue', 'All Enterprise Features', 'Unlimited Branches'],
      disabledFeatures: [],
    },
  ];

  // Handler Step 1: Register Tenant
  const onStep1Submit = async (data: Step1Data) => {
    setLoading(true);
    try {
      const res = await onboardingService.register(data);
      setTenantId(res.tenantId);
      setEmail(data.ownerEmail);
      toast.success('Institute registered! Check terminal/console for OTP.');
      setStep(2);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Handler Step 2: Verify Email
  const onStep2Submit = async (data: Step2Data) => {
    setLoading(true);
    try {
      await onboardingService.verifyEmail({ email, token: data.otp });
      toast.success('Email verified successfully!');
      setStep(3);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid verification OTP');
    } finally {
      setLoading(false);
    }
  };

  // Handler Step 3: Select Plan
  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setStep(4);
  };

  // Handler Step 4: Final Provisioning
  const onStep4Submit = async (data: Step3Data) => {
    setLoading(true);
    try {
      // Call provision API
      const res = await onboardingService.provision({
        tenantId,
        adminEmail: data.adminEmail,
        adminPhone: data.adminPhone,
        adminPassword: data.adminPassword,
        planId: selectedPlan, // Passes slug or ID
        customDomain: data.customDomain,
      });

      // Login directly
      login(res.accessToken, res.refreshToken, res.user);
      
      toast.success('Workspace provisioned! Redirecting to ERP...');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Provisioning failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between relative overflow-hidden font-display text-white">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px]" />

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-slate-900/50 backdrop-blur-md z-10">
        <Link to="/login" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center">
            <Shield className="h-4 w-4 text-slate-950 font-bold" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Prime SaaS Setup
          </span>
        </Link>
        <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Already registered?
        </Link>
      </header>

      {/* Wizard Body */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 z-10">
        <div className="w-full max-w-4xl bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl shadow-black/40">
          
          {/* Step Indicator */}
          <div className="mb-10 max-w-xl mx-auto">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-white/10 -z-10" />
              {[
                { label: 'Register', stepNum: 1 },
                { label: 'Verify', stepNum: 2 },
                { label: 'Plan', stepNum: 3 },
                { label: 'Configure', stepNum: 4 },
              ].map((s) => {
                const isActive = step >= s.stepNum;
                return (
                  <div key={s.stepNum} className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-300 ${
                      step === s.stepNum
                        ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                        : isActive
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'bg-slate-800 border-white/10 text-slate-400'
                    }`}>
                      {isActive && step > s.stepNum ? <CheckCircle2 className="h-5 w-5" /> : s.stepNum}
                    </div>
                    <span className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-slate-500'}`}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <div className="animate-fade-in">
            {/* STEP 1: REGISTER */}
            {step === 1 && (
              <div className="max-w-md mx-auto">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Create Your Institute Workspace</h2>
                  <p className="text-slate-400 text-sm">Register your branch or institute to provision your custom ERP tenant.</p>
                </div>

                <form onSubmit={step1Form.handleSubmit(onStep1Submit)} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Institute Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Building className="h-4 w-4" /></div>
                      <input 
                        type="text"
                        placeholder="e.g. Sainik Academy Jaipur"
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-amber-500 text-white text-sm"
                        {...step1Form.register('name', { required: 'Institute name is required' })}
                      />
                    </div>
                    {step1Form.formState.errors.name && <p className="text-red-500 text-xs mt-1">{step1Form.formState.errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">URL Slug (Subdomain)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Globe className="h-4 w-4" /></div>
                      <input 
                        type="text"
                        placeholder="e.g. sainik-jaipur"
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-amber-500 text-white text-sm"
                        {...step1Form.register('slug', { 
                          required: 'Slug is required',
                          pattern: { value: /^[a-z0-9-]+$/, message: 'Slug must contain only lowercase letters, numbers, or dashes' }
                        })}
                      />
                    </div>
                    {step1Form.formState.errors.slug && <p className="text-red-500 text-xs mt-1">{step1Form.formState.errors.slug.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Owner / Admin Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Mail className="h-4 w-4" /></div>
                      <input 
                        type="email"
                        placeholder="e.g. owner@academy.com"
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-amber-500 text-white text-sm"
                        {...step1Form.register('ownerEmail', { required: 'Owner email is required' })}
                      />
                    </div>
                    {step1Form.formState.errors.ownerEmail && <p className="text-red-500 text-xs mt-1">{step1Form.formState.errors.ownerEmail.message}</p>}
                  </div>

                  <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all duration-300">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Register & Continue <ChevronRight className="h-5 w-5" /></>}
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2: VERIFY */}
            {step === 2 && (
              <div className="max-w-md mx-auto">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Verify Your Email Address</h2>
                  <p className="text-slate-400 text-sm">We've generated an email verification code for <b>{email}</b>. Please inspect the logs or terminal to copy the OTP.</p>
                </div>

                <form onSubmit={step2Form.handleSubmit(onStep2Submit)} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">6-Digit Verification OTP</label>
                    <input 
                      type="text"
                      maxLength={6}
                      placeholder="Enter OTP"
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-amber-500 text-white text-center font-bold tracking-widest text-lg"
                      {...step2Form.register('otp', { required: 'Verification OTP is required', minLength: { value: 6, message: 'OTP must be 6 digits' } })}
                    />
                    {step2Form.formState.errors.otp && <p className="text-red-500 text-xs mt-1">{step2Form.formState.errors.otp.message}</p>}
                  </div>

                  <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Verify Code <ChevronRight className="h-5 w-5" /></>}
                  </button>
                  <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-slate-400 hover:text-white transition-colors py-2">Back</button>
                </form>
              </div>
            )}

            {/* STEP 3: SELECT PLAN */}
            {step === 3 && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-amber-400 to-orange-500 bg-clip-text text-transparent">Select a Subscription Plan</h2>
                  <p className="text-slate-400 text-sm max-w-md mx-auto">Choose a plan that matches your institute's scale. Upgrade or downgrade anytime.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {plans.map((p) => (
                    <div key={p.id} className={`bg-slate-900/50 border border-white/10 rounded-2xl p-6 relative flex flex-col justify-between transition-all duration-300 hover:border-white/30 hover:scale-[1.02] ${
                      p.popular ? 'border-amber-500/60 shadow-lg shadow-amber-500/5' : ''
                    }`}>
                      {p.popular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                          Most Popular
                        </span>
                      )}

                      <div>
                        <h3 className="font-bold text-lg text-slate-200 mb-1">{p.name}</h3>
                        <div className="flex items-baseline gap-1 my-4">
                          <span className="text-3xl font-extrabold text-white">₹{p.price}</span>
                          <span className="text-xs text-slate-400">/ month</span>
                        </div>
                        <ul className="space-y-2.5 text-xs text-slate-300 border-t border-white/5 pt-4">
                          {p.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="text-emerald-500 font-bold">✓</span> {f}
                            </li>
                          ))}
                          {p.disabledFeatures.map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-slate-600 line-through">
                              <span>×</span> {f}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button onClick={() => handleSelectPlan(p.id)} className="w-full mt-6 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs border border-white/10 hover:border-amber-500/50 transition-all duration-300">
                        Choose {p.name.split(' ')[0]}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: PROVISION */}
            {step === 4 && (
              <div className="max-w-md mx-auto">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Configure Workspace & Launch</h2>
                  <p className="text-slate-400 text-sm">Create the owner/administrator account credentials to launch the ERP.</p>
                </div>

                <form onSubmit={step3Form.handleSubmit(onStep4Submit)} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Admin Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Mail className="h-4 w-4" /></div>
                      <input 
                        type="email"
                        placeholder="e.g. admin@yourdomain.com"
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-amber-500 text-white text-sm"
                        {...step3Form.register('adminEmail', { required: 'Admin email is required' })}
                      />
                    </div>
                    {step3Form.formState.errors.adminEmail && <p className="text-red-500 text-xs mt-1">{step3Form.formState.errors.adminEmail.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Admin Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Phone className="h-4 w-4" /></div>
                      <input 
                        type="text"
                        placeholder="e.g. 9876543210"
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-amber-500 text-white text-sm"
                        {...step3Form.register('adminPhone', { required: 'Phone is required' })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Secure Admin Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Lock className="h-4 w-4" /></div>
                      <input 
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-amber-500 text-white text-sm"
                        {...step3Form.register('adminPassword', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Custom Domain (Optional)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Globe className="h-4 w-4" /></div>
                      <input 
                        type="text"
                        placeholder="e.g. academy.yourdomain.com"
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-amber-500 text-white text-sm"
                        {...step3Form.register('customDomain')}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500">You can map this domain to our servers via CNAME record.</span>
                  </div>

                  <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all duration-300">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Launch Workspace <Sparkles className="h-5 w-5" /></>}
                  </button>
                  <button type="button" onClick={() => setStep(3)} className="w-full text-sm text-slate-400 hover:text-white transition-colors py-2">Back to Plans</button>
                </form>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center border-t border-white/5 bg-slate-900/50 backdrop-blur-md z-10 text-xs text-slate-500">
        © 2026 The Prime Classes ERP Platform. Multi-Tenant SaaS Engine.
      </footer>
    </div>
  );
};
export default OnboardingWizard;
