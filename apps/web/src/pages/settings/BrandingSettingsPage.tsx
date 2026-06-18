import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Settings, Paintbrush, Globe, Mail, FileText, CheckCircle, 
  HelpCircle, AlertCircle, Loader2
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface BrandingForm {
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  sidebarBg: string;
  tagline: string;
  emailSenderName: string;
  emailSenderEmail: string;
  emailFooterText: string;
  pdfFooterText: string;
  pdfShowWatermark: boolean;
}

export const BrandingSettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [customDomainInput, setCustomDomainInput] = useState('');
  
  // Dynamic current tenant branding details
  const [tenantBranding, setTenantBranding] = useState<any | null>(null);

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<BrandingForm>();

  const loadBranding = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tenants/branding');
      const data = res.data.data;
      setTenantBranding(data);
      setCustomDomainInput(data.customDomain || '');
      
      // Parse database values to form DTO
      const colors = data.brandColors || {};
      const email = data.emailBranding || {};
      const pdf = data.pdfBranding || {};

      reset({
        logoUrl: data.logoUrl || '',
        primaryColor: colors.primaryColor || '#1a365d',
        secondaryColor: colors.secondaryColor || '#319795',
        sidebarBg: colors.sidebarBg || '#ffffff',
        tagline: colors.tagline || '',
        emailSenderName: email.senderName || '',
        emailSenderEmail: email.senderEmail || '',
        emailFooterText: email.footerText || '',
        pdfFooterText: pdf.footerText || '',
        pdfShowWatermark: pdf.showWatermark || false,
      });
    } catch (err: any) {
      toast.error('Failed to load branding settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranding();
  }, []);

  const onSubmit = async (data: BrandingForm) => {
    setSaving(true);
    try {
      await api.patch('/tenants/branding', {
        logoUrl: data.logoUrl,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        sidebarBg: data.sidebarBg,
        tagline: data.tagline,
        emailBranding: {
          senderName: data.emailSenderName,
          senderEmail: data.emailSenderEmail,
          footerText: data.emailFooterText,
        },
        pdfBranding: {
          footerText: data.pdfFooterText,
          showWatermark: data.pdfShowWatermark,
        },
      });
      toast.success('White-label branding updated successfully!');
      loadBranding();
    } catch (err: any) {
      toast.error('Failed to save branding configurations');
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyDomain = async () => {
    if (!customDomainInput.trim()) return;
    setVerifying(true);
    try {
      await api.post('/tenants/domain/verify', {
        customDomain: customDomainInput.toLowerCase().trim(),
      });
      toast.success('Custom domain SSL & verification completed!');
      loadBranding();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Verification failed. Check your CNAME records.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoaderSpinner className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-500 text-xs">Loading branding panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-display text-gray-800">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold">White-Label Branding Settings</h1>
          <p className="text-xs text-gray-500">Configure your logos, themes, dynamic custom domains, and automated branding assets.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Configurations Form */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Design System */}
            <div className="space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <Paintbrush className="h-4 w-4" /> Custom Design Theme Colors
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="label">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" className="w-9 h-9 border border-gray-200 rounded cursor-pointer" {...register('primaryColor')} />
                    <input type="text" className="input text-xs py-1.5 font-mono" {...register('primaryColor')} />
                  </div>
                </div>

                <div>
                  <label className="label">Secondary Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" className="w-9 h-9 border border-gray-200 rounded cursor-pointer" {...register('secondaryColor')} />
                    <input type="text" className="input text-xs py-1.5 font-mono" {...register('secondaryColor')} />
                  </div>
                </div>

                <div>
                  <label className="label">Sidebar Background</label>
                  <div className="flex items-center gap-2">
                    <input type="color" className="w-9 h-9 border border-gray-200 rounded cursor-pointer" {...register('sidebarBg')} />
                    <input type="text" className="input text-xs py-1.5 font-mono" {...register('sidebarBg')} />
                  </div>
                </div>
              </div>

              <div>
                <label className="label">Logo Image URL</label>
                <input type="text" placeholder="https://yourdomain.com/logo.png" className="input text-xs py-2.5" {...register('logoUrl')} />
              </div>

              <div>
                <label className="label">Dynamic Brand Tagline</label>
                <input type="text" placeholder="e.g. Building Future Military Leaders" className="input text-xs py-2.5" {...register('tagline')} />
              </div>
            </div>

            {/* Email Branding */}
            <div className="border-t border-gray-100 pt-6 space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <Mail className="h-4 w-4" /> Custom Email Branding
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Sender Name</label>
                  <input type="text" placeholder="Sainik School Jaipur" className="input text-xs py-2.5" {...register('emailSenderName')} />
                </div>
                <div>
                  <label className="label">Reply-To Email</label>
                  <input type="email" placeholder="contact@sainikjaipur.com" className="input text-xs py-2.5" {...register('emailSenderEmail')} />
                </div>
              </div>

              <div>
                <label className="label">Email Footer Signature</label>
                <textarea rows={2} placeholder="Sainik School Academy. All rights reserved." className="input text-xs py-2" {...register('emailFooterText')} />
              </div>
            </div>

            {/* PDF Report Branding */}
            <div className="border-t border-gray-100 pt-6 space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Automated PDF & Invoice Branding
              </h3>
              
              <div>
                <label className="label">PDF Header / Footer Text</label>
                <input type="text" placeholder="Generated dynamically by Sainik School ERP" className="input text-xs py-2.5" {...register('pdfFooterText')} />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="watermark" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" {...register('pdfShowWatermark')} />
                <label htmlFor="watermark" className="text-xs font-semibold text-gray-700 select-none">Include official logo watermark on certificates</label>
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn-primary py-3 px-6 rounded-xl font-bold text-xs flex items-center justify-center gap-2 w-full sm:w-auto self-end">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Configurations'}
            </button>

          </form>
        </div>

        {/* Custom Domain panel */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Globe className="h-4 w-4" /> Custom Domain Mapping
            </h3>

            <p className="text-xs text-gray-500">Map your own domain name (e.g. <code>academy.com</code>) directly to your ERP workspace.</p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="label">Your Custom Domain</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="e.g. academy.com" 
                    value={customDomainInput}
                    onChange={(e) => setCustomDomainInput(e.target.value)}
                    className="input text-xs py-2 flex-1"
                  />
                  <button 
                    onClick={handleVerifyDomain} 
                    disabled={verifying || !customDomainInput.trim()}
                    className="btn-primary py-2 px-4 rounded-xl text-xs font-bold whitespace-nowrap"
                  >
                    {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify DNS'}
                  </button>
                </div>
              </div>

              {tenantBranding?.customDomain ? (
                <div className={`p-4 rounded-xl border flex gap-3 ${
                  tenantBranding.domainVerified 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  {tenantBranding.domainVerified ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-bold">Domain Active</div>
                        <div className="text-[10px] text-emerald-600 font-mono mt-0.5">{tenantBranding.customDomain}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-bold">DNS Pending</div>
                        <div className="text-[10px] text-amber-600 font-mono mt-0.5">{tenantBranding.customDomain}</div>
                      </div>
                    </>
                  )}
                </div>
              ) : null}

              {/* DNS guide */}
              <div className="bg-slate-50 p-4 rounded-xl border border-gray-200/50 text-[10px] text-gray-500 space-y-2">
                <div className="font-bold text-gray-700 flex items-center gap-1"><HelpCircle className="h-3.5 w-3.5" /> DNS Mapping Guide</div>
                <p>1. In your domain registrar settings, add a new DNS record:</p>
                <div className="bg-white p-2 rounded font-mono border border-gray-200 text-gray-700">
                  Type: CNAME <br />
                  Host: @ or sub <br />
                  Value: cname.primeerp.com
                </div>
                <p>2. Set verification TXT record if requested.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

const LoaderSpinner = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
export default BrandingSettingsPage;
