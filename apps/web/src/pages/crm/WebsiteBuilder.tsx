import React, { useState } from 'react';
import {
  Laptop,
  Save,
  Globe,
  Settings,
} from 'lucide-react';

export const WebsiteBuilder: React.FC = () => {
  const [primaryColor, setPrimaryColor] = useState('#4f46e5');
  const [secondaryColor, setSecondaryColor] = useState('#0d9488');
  const [heroTitle, setHeroTitle] = useState('Welcome to Prime Classes');
  const [heroSubtitle, setHeroSubtitle] = useState('The leading coaching institute for Sainik School, RIMC, and RMS exams.');
  const [metaTitle, setMetaTitle] = useState('Prime Classes - Sainik & RIMC Coaching');
  const [metaDesc, setMetaDesc] = useState('Production-grade coaching and preparation portal for elite entrance tests.');
  const [isActive, setIsActive] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Website configuration successfully updated and published to custom domain/slug!');
  };

  return (
    <div className="space-y-6 animate-slide-up p-1">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900 tracking-tight">Public Website Customizer</h1>
          <p className="text-sm text-gray-500">Manage branding styles, layout contents, custom domains, and SEO keywords for your institute's public portal.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${
            isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            <Globe className="h-3.5 w-3.5" /> {isActive ? 'Live & Published' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Editor Controls (left column - 3/5 width) */}
        <form onSubmit={handleSave} className="card p-6 space-y-6 xl:col-span-3">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-3">
            <Settings className="h-4 w-4 text-indigo-500" /> Site Configurations
          </h3>

          {/* Section 1: Domain & SEO */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Custom Domain & SEO</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-gray-500 font-semibold mb-1">Custom Domain Name</label>
                <input
                  type="text"
                  placeholder="e.g. admissions.primeclasses.in"
                  className="w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2 text-xs text-gray-700"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 font-semibold mb-1">SEO Meta Title</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2 text-xs text-gray-700"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 font-semibold mb-1">SEO Meta Description</label>
              <textarea
                rows={2}
                className="w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2 text-xs text-gray-700"
                value={metaDesc}
                onChange={(e) => setMetaDesc(e.target.value)}
              />
            </div>
          </div>

          {/* Section 2: Branding Colors */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Color Branding Palette</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] text-gray-500 font-semibold mb-1">Primary Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    className="w-8 h-8 rounded cursor-pointer border border-gray-200"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                  />
                  <span className="text-xs font-mono text-gray-600 uppercase">{primaryColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 font-semibold mb-1">Secondary Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    className="w-8 h-8 rounded cursor-pointer border border-gray-200"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                  />
                  <span className="text-xs font-mono text-gray-600 uppercase">{secondaryColor}</span>
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] text-gray-500 font-semibold mb-1">Upload Brand Logo</label>
                <input
                  type="file"
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Hero Content */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hero Banner Text</h4>
            <div>
              <label className="block text-[11px] text-gray-500 font-semibold mb-1">Main Heading</label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2 text-xs text-gray-700"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 font-semibold mb-1">Sub-heading Description</label>
              <textarea
                rows={3}
                className="w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2 text-xs text-gray-700"
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
              />
            </div>
          </div>

          {/* Section 4: Contact & Social configs */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Info Display</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-gray-500 font-semibold mb-1">Support Email</label>
                <input
                  type="email"
                  placeholder="contact@institute.com"
                  className="w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2 text-xs text-gray-700"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 font-semibold mb-1">Support Phone</label>
                <input
                  type="text"
                  placeholder="+91 XXXXXXXXXX"
                  className="w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2 text-xs text-gray-700"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-50">
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`px-4 py-2 border rounded-lg text-xs font-semibold transition-colors ${
                isActive ? 'border-gray-200 text-gray-600 hover:bg-gray-50' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}
            >
              {isActive ? 'Deactivate Website' : 'Activate & Go Live'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow flex items-center gap-1.5 transition-colors"
            >
              <Save className="h-4 w-4" /> Save changes
            </button>
          </div>
        </form>

        {/* Real-time Preview Pane (right column - 2/5 width) */}
        <div className="xl:col-span-2 flex flex-col h-full">
          <div className="bg-slate-900 rounded-t-xl px-4 py-2 flex items-center gap-1.5 text-white/80">
            <Laptop className="h-4 w-4" />
            <span className="text-[11px] font-bold tracking-wider uppercase">Live Website Mockup Preview</span>
          </div>

          <div className="bg-slate-100 border-x border-b border-gray-200 rounded-b-xl flex-1 p-4 flex flex-col justify-center">
            {/* Inner mockup iframe/container styled with custom color pickers */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden text-slate-800 text-[10px] flex flex-col min-h-[380px]">
              {/* Mock Header */}
              <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                <span className="font-extrabold text-xs tracking-wider" style={{ color: primaryColor }}>
                  ★ INSTITUTELOGO
                </span>
                <div className="flex gap-2 text-[9px] font-medium text-gray-500">
                  <span>Home</span>
                  <span>Courses</span>
                  <span>Results</span>
                  <span>Faculty</span>
                </div>
              </div>

              {/* Mock Hero Section */}
              <div
                className="py-12 px-6 text-center text-white space-y-3 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                }}
              >
                <h4 className="font-extrabold text-sm max-w-xs mx-auto leading-tight">{heroTitle}</h4>
                <p className="text-[9px] text-white/80 max-w-sm mx-auto leading-relaxed">{heroSubtitle}</p>
                <div className="flex justify-center gap-2 pt-2">
                  <button className="bg-white text-gray-900 font-bold px-3 py-1 rounded shadow-sm text-[8px]">
                    Apply Online
                  </button>
                  <button className="bg-white/20 border border-white/30 text-white font-bold px-3 py-1 rounded text-[8px]">
                    Scholarship Test
                  </button>
                </div>
              </div>

              {/* Mock Content Sections */}
              <div className="p-4 space-y-4 flex-1">
                <div className="space-y-1">
                  <div className="w-12 h-1.5 rounded-full" style={{ backgroundColor: secondaryColor }} />
                  <p className="font-bold text-gray-900 text-xs">Featured Academic Programs</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="border border-slate-100 rounded p-2 bg-slate-50/50">
                    <p className="font-bold text-gray-800">Sainik Entrance Prep</p>
                    <p className="text-gray-400 mt-0.5">Classes 6 to 9, intensive course.</p>
                  </div>
                  <div className="border border-slate-100 rounded p-2 bg-slate-50/50">
                    <p className="font-bold text-gray-800">RIMC Foundation</p>
                    <p className="text-gray-400 mt-0.5">Focus on math, english basics.</p>
                  </div>
                </div>
              </div>

              {/* Mock Footer */}
              <div className="bg-slate-900 text-white/50 text-[8px] py-3 px-4 text-center border-t border-slate-800">
                <p>© 2026 Institute. Powered by Prime ERP.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
