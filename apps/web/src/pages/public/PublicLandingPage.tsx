import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  GraduationCap,
  Award,
  BookOpen,
  Calendar,
  ChevronRight,
  FileText,
  Upload,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

const mockCourses = [
  { id: 'c1', name: 'Sainik School Entrance Exam coaching (Class VI)', duration: '1 Year', fee: '₹45,000', eligibility: 'Class V studying' },
  { id: 'c2', name: 'RIMC Dehradun Special batch', duration: '6 Months', fee: '₹35,000', eligibility: 'Age 11.5 to 13 years' },
  { id: 'c3', name: 'RMS (Rashtriya Military Schools) Prep course', duration: '1 Year', fee: '₹40,000', eligibility: 'Class V or VIII studying' },
];

const mockFaculty = [
  { name: 'Dr. Suresh Rawat', role: 'Director & Mathematics Expert', qualifications: 'M.Sc, Ph.D in Applied Math, 15+ Yrs exp' },
  { name: 'Col. Rajesh Sen (Retd.)', role: 'Interview Coach & General Studies', qualifications: 'Ex-NDA, 30+ Yrs Military Service' },
  { name: 'Smt. Anjali Sharma', role: 'English Language Specialist', qualifications: 'M.A. English, B.Ed, 10+ Yrs exp' },
];

const mockResults = [
  { studentName: 'Aditya Raj', exam: 'Sainik School (All India Rank 14)', year: '2025', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100' },
  { studentName: 'Priyanka Bisht', exam: 'RIMC Qualified (Uttarakhand State topper)', year: '2025', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100' },
  { studentName: 'Rohan Chaudhary', exam: 'RMS Qualified', year: '2024', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100' },
];

export const PublicLandingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'courses' | 'faculty' | 'results' | 'admissions' | 'scholarship'>('home');

  // Lead form state
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadMessage, setLeadMessage] = useState('');

  // Admission application state
  const [appFirstName, setAppFirstName] = useState('');
  const [appLastName, setAppLastName] = useState('');
  const [appEmail, setAppEmail] = useState('');
  const [appPhone, setAppPhone] = useState('');
  const [appDob, setAppDob] = useState('');
  const [appGender, setAppGender] = useState('MALE');
  const [appClass, setAppClass] = useState('Class 6');
  const [appPhoto, setAppPhoto] = useState<File | null>(null);
  const [appAadhaar, setAppAadhaar] = useState<File | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [appNumber, setAppNumber] = useState<string | null>(null);
  const [appStatus, setAppStatus] = useState<string>('Draft');

  // Track application state
  const [trackNumber, setTrackNumber] = useState('');
  const [trackPhone, setTrackPhone] = useState('');
  const [trackedApp, setTrackedApp] = useState<any>(null);

  // Scholarship state
  const [scholName, setScholName] = useState('');
  const [scholPhone, setScholPhone] = useState('');
  const [scholEmail, setScholEmail] = useState('');
  const [scholRollNumber, setScholRollNumber] = useState<string | null>(null);
  const [scholSeatNumber, setScholSeatNumber] = useState<string | null>(null);
  const [showAdmitCard, setShowAdmitCard] = useState(false);

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Thank you ${leadName}! Your inquiry has been submitted. A counselor will call you back within 24 hours.`);
    setLeadName('');
    setLeadPhone('');
    setLeadEmail('');
    setLeadMessage('');
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mockAppNum = `APP-2026-${Math.floor(Math.random() * 90000 + 10000)}`;
    setAppNumber(mockAppNum);
    setApplicationId('app-uuid-placeholder');
    setAppStatus('Submitted');
    toast.success(`Application successfully submitted! Application Number: ${mockAppNum}. Please upload required verification documents next.`);
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackNumber.trim() && trackPhone.trim()) {
      setTrackedApp({
        applicationNumber: trackNumber,
        firstName: 'Dev',
        lastName: 'Sharma',
        classApplyingFor: 'Class VI (Sainik)',
        status: 'Verified',
        paymentStatus: 'PAID',
        documents: [
          { name: 'Photo', status: 'VERIFIED' },
          { name: 'Aadhaar', status: 'VERIFIED' },
          { name: 'Birth Certificate', status: 'PENDING' },
        ],
      });
    }
  };

  const handleScholarshipRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const mockRoll = `SCH-TEST-${Math.floor(Math.random() * 9000 + 10000)}`;
    const mockSeat = `ROOM-B-SEAT-${Math.floor(Math.random() * 40 + 1)}`;
    setScholRollNumber(mockRoll);
    setScholSeatNumber(mockSeat);
    setShowAdmitCard(true);
    toast.success(`Registration Successful! Roll Number: ${mockRoll}. You can now view and download your Admit Card.`);
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans text-slate-800">
      {/* Public Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-indigo-600" />
            <span className="font-extrabold text-lg tracking-wider text-gray-900">THE PRIME CLASSES</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-semibold text-gray-600">
            <button onClick={() => setActiveTab('home')} className={`hover:text-indigo-600 ${activeTab === 'home' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : ''}`}>Home</button>
            <button onClick={() => setActiveTab('courses')} className={`hover:text-indigo-600 ${activeTab === 'courses' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : ''}`}>Courses</button>
            <button onClick={() => setActiveTab('faculty')} className={`hover:text-indigo-600 ${activeTab === 'faculty' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : ''}`}>Faculty</button>
            <button onClick={() => setActiveTab('results')} className={`hover:text-indigo-600 ${activeTab === 'results' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : ''}`}>Results</button>
            <button onClick={() => setActiveTab('admissions')} className={`hover:text-indigo-600 ${activeTab === 'admissions' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : ''}`}>Admissions</button>
            <button onClick={() => setActiveTab('scholarship')} className={`hover:text-indigo-600 ${activeTab === 'scholarship' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : ''}`}>Scholarship Test</button>
          </nav>
        </div>
      </header>

      {/* Hero Page / Content Container */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <div>
            {/* Banner */}
            <div className="bg-gradient-to-br from-indigo-700 via-indigo-900 to-slate-900 py-24 text-white text-center px-4 relative overflow-hidden">
              <div className="max-w-4xl mx-auto space-y-6 relative z-10 animate-fade-in">
                <span className="bg-indigo-600/30 border border-indigo-400/40 px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-indigo-300 uppercase">
                  Admissions Open 2026-27
                </span>
                <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
                  Empower Your Child to Enter India's Elite Military Schools
                </h1>
                <p className="text-base md:text-lg text-indigo-200/90 max-w-2xl mx-auto leading-relaxed">
                  Specialized residential and online coaching preparation programs for Sainik School, RIMC Dehradun, and Rashtriya Military Schools (RMS).
                </p>
                <div className="flex flex-wrap justify-center gap-3 pt-4">
                  <button onClick={() => setActiveTab('admissions')} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center gap-1">
                    Apply Online Now <ChevronRight className="h-4 w-4" />
                  </button>
                  <button onClick={() => setActiveTab('scholarship')} className="px-6 py-2.5 bg-white text-gray-900 hover:bg-slate-50 font-bold rounded-lg text-sm shadow">
                    Register for Scholarship Exam
                  </button>
                </div>
              </div>
              {/* background decor */}
              <div className="absolute -bottom-8 -right-8 w-48 h-48 rounded-full bg-indigo-500/10 blur-xl" />
              <div className="absolute -top-8 -left-8 w-48 h-48 rounded-full bg-violet-500/10 blur-xl" />
            </div>

            {/* Inquiries / Leads Submission Form */}
            <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold font-display text-gray-900">Why Choose The Prime Classes?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 text-indigo-600">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Expert Faculty</p>
                      <p className="text-xs text-gray-500 mt-0.5">Classes taken by retired defense officers & entrance experts.</p>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-600">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Verified Results</p>
                      <p className="text-xs text-gray-500 mt-0.5">Over 250+ selections in RIMC & Sainik schools since 2020.</p>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center shrink-0 text-pink-600">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Mock Tests & OMR</p>
                      <p className="text-xs text-gray-500 mt-0.5">Regular exam simulations with instant AI analytics scoring.</p>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 text-amber-600">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Hostel Facility</p>
                      <p className="text-xs text-gray-500 mt-0.5">Comfortable residency with structured military-like routines.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inquiry form card */}
              <div className="bg-white border border-gray-100 shadow-lg rounded-2xl p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Request a Call Back</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Fill in details and our counseling desk will call you.</p>
                </div>

                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        className="w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2 text-xs"
                        value={leadName}
                        onChange={(e) => setLeadName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Phone Number</label>
                      <input
                        type="text"
                        required
                        className="w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2 text-xs"
                        value={leadPhone}
                        onChange={(e) => setLeadPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
                    <input
                      type="email"
                      className="w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2 text-xs"
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Message / Class studying</label>
                    <textarea
                      rows={3}
                      className="w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2 text-xs"
                      value={leadMessage}
                      onChange={(e) => setLeadMessage(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors shadow">
                    Submit Inquiry Form
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Courses Page */}
        {activeTab === 'courses' && (
          <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Coaching & Training Programs</h2>
              <p className="text-sm text-gray-500 mt-1">Explore our structured curricula, batches, and enrollment schedules.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mockCourses.map((course) => (
                <div key={course.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    <h3 className="font-bold text-gray-900 text-base leading-snug">{course.name}</h3>
                    <div className="flex gap-2">
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                        Duration: {course.duration}
                      </span>
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">
                        Fees: {course.fee}
                      </span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-50">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Eligibility criteria</p>
                    <p className="text-xs text-gray-700 mt-1 font-medium">{course.eligibility}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Faculty Page */}
        {activeTab === 'faculty' && (
          <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Meet Our Expert Mentors</h2>
              <p className="text-sm text-gray-500 mt-1">Highly experienced educators dedicated to building character and discipline.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mockFaculty.map((fac) => (
                <div key={fac.name} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-indigo-600 text-lg">
                      {fac.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{fac.name}</h4>
                      <p className="text-xs text-indigo-600 font-semibold">{fac.role}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 border-t border-gray-50 pt-3 leading-relaxed">
                    Qualifications & Background: {fac.qualifications}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Page */}
        {activeTab === 'results' && (
          <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Our Wall of Fame</h2>
              <p className="text-sm text-gray-500 mt-1">Celebrating our outstanding achievers who succeeded in securing defense institution placements.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {mockResults.map((res, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow">
                  <div className="bg-indigo-950/90 h-36 flex items-center justify-center text-white relative">
                    <Award className="h-12 w-12 text-amber-400 absolute right-4 bottom-4" />
                    <span className="font-bold text-2xl uppercase tracking-wider">{res.studentName[0]}</span>
                  </div>
                  <div className="p-5 space-y-1.5">
                    <h4 className="font-bold text-gray-900 text-sm">{res.studentName}</h4>
                    <p className="text-xs text-indigo-600 font-semibold">{res.exam}</p>
                    <p className="text-[10px] text-gray-400">Class Batch: {res.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admissions Portal */}
        {activeTab === 'admissions' && (
          <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Apply Form */}
            <div className="bg-white border border-gray-100 shadow-md rounded-2xl p-6 lg:col-span-2 space-y-6">
              <div className="border-b border-gray-50 pb-4">
                <h2 className="text-xl font-bold text-gray-900">Online Admission Application</h2>
                <p className="text-xs text-gray-500 mt-0.5">Please fill details correctly as per Aadhaar/Birth Certificate.</p>
              </div>

              {!applicationId ? (
                <form onSubmit={handleApplySubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">First Name</label>
                      <input
                        type="text"
                        required
                        className="w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2 text-xs"
                        value={appFirstName}
                        onChange={(e) => setAppFirstName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Last Name</label>
                      <input
                        type="text"
                        required
                        className="w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2 text-xs"
                        value={appLastName}
                        onChange={(e) => setAppLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Email</label>
                      <input
                        type="email"
                        required
                        className="w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2 text-xs"
                        value={appEmail}
                        onChange={(e) => setAppEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Phone Number</label>
                      <input
                        type="text"
                        required
                        className="w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2 text-xs"
                        value={appPhone}
                        onChange={(e) => setAppPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">DOB</label>
                      <input
                        type="date"
                        required
                        className="w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-1.5 text-xs text-gray-600"
                        value={appDob}
                        onChange={(e) => setAppDob(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Gender</label>
                      <select
                        className="w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2 text-xs"
                        value={appGender}
                        onChange={(e) => setAppGender(e.target.value)}
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Applying For</label>
                      <select
                        className="w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2 text-xs"
                        value={appClass}
                        onChange={(e) => setAppClass(e.target.value)}
                      >
                        <option value="Class 6">Class 6 (Sainik)</option>
                        <option value="Class 9">Class 9 (Sainik)</option>
                        <option value="RIMC Dehradun">RIMC Dehradun</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow-md">
                    Submit & Pay Registration Fee (₹500)
                  </button>
                </form>
              ) : (
                <div className="space-y-6 animate-scale-up">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3 text-emerald-900 text-xs">
                    <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold">Application Registered Successfully!</p>
                      <p className="mt-0.5">Application Number: <strong className="font-mono text-indigo-700">{appNumber}</strong></p>
                      <p className="mt-0.5">Stage: <strong>{appStatus}</strong></p>
                    </div>
                  </div>

                  {/* Document upload panels */}
                  <div className="space-y-3.5">
                    <h3 className="font-semibold text-gray-900 text-sm">Upload Documents for Verification</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Photo */}
                      <div className="border border-dashed border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="font-bold text-xs">Student Photo</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">JPG/PNG, max 2MB.</p>
                          {appPhoto && <span className="text-[9px] text-emerald-600 font-semibold mt-1 block">✓ {appPhoto.name} selected</span>}
                        </div>
                        <label className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-lg text-[10px] cursor-pointer flex items-center gap-1 w-fit">
                          <Upload className="h-3.5 w-3.5" /> Upload File
                          <input type="file" className="hidden" onChange={(e) => setAppPhoto(e.target.files ? e.target.files[0] : null)} />
                        </label>
                      </div>
                      {/* Aadhaar */}
                      <div className="border border-dashed border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="font-bold text-xs">Aadhaar Card (PDF)</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Both sides required.</p>
                          {appAadhaar && <span className="text-[9px] text-emerald-600 font-semibold mt-1 block">✓ {appAadhaar.name} selected</span>}
                        </div>
                        <label className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-lg text-[10px] cursor-pointer flex items-center gap-1 w-fit">
                          <Upload className="h-3.5 w-3.5" /> Upload File
                          <input type="file" className="hidden" onChange={(e) => setAppAadhaar(e.target.files ? e.target.files[0] : null)} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Track Status */}
            <div className="bg-white border border-gray-100 shadow-md rounded-2xl p-6 h-fit space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Track Application Status</h3>
                <p className="text-xs text-gray-500 mt-0.5">Check current review stage and document checklist details.</p>
              </div>

              <form onSubmit={handleTrackSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Application Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. APP-2026-00021"
                    className="w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2 text-xs"
                    value={trackNumber}
                    onChange={(e) => setTrackNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Registered Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9876543210"
                    className="w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2 text-xs"
                    value={trackPhone}
                    onChange={(e) => setTrackPhone(e.target.value)}
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors">
                  Check Status Stage
                </button>
              </form>

              {/* Status details output */}
              {trackedApp && (
                <div className="border-t border-gray-50 pt-4 space-y-4 animate-scale-up text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Current Stage</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                      <span className="font-bold text-gray-800 uppercase">{trackedApp.status}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Document Checklist</span>
                    <div className="mt-1.5 space-y-1">
                      {trackedApp.documents.map((doc: any) => (
                        <div key={doc.name} className="flex justify-between items-center bg-gray-50 px-2.5 py-1.5 rounded">
                          <span className="font-medium text-gray-700">{doc.name}</span>
                          <span className={`text-[9px] font-bold ${doc.status === 'VERIFIED' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {doc.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Scholarship Exam Registration */}
        {activeTab === 'scholarship' && (
          <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
            <div className="bg-white border border-gray-100 shadow-md rounded-2xl p-6 space-y-6">
              <div className="border-b border-gray-50 pb-4">
                <h2 className="text-xl font-bold text-gray-900">Scholarship Admission Test 2026</h2>
                <p className="text-xs text-gray-500 mt-0.5">Register for All India Scholarship Entrance Exam & check your merit eligibility.</p>
              </div>

              {!showAdmitCard ? (
                <form onSubmit={handleScholarshipRegister} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Student Full Name</label>
                      <input
                        type="text"
                        required
                        className="w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2 text-xs"
                        value={scholName}
                        onChange={(e) => setScholName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Parent Phone Number</label>
                      <input
                        type="text"
                        required
                        className="w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2 text-xs"
                        value={scholPhone}
                        onChange={(e) => setScholPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      className="w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2 text-xs"
                      value={scholEmail}
                      onChange={(e) => setScholEmail(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow-md">
                    Register online & Book Test Seat (₹200)
                  </button>
                </form>
              ) : (
                <div className="space-y-6 animate-scale-up">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3 text-emerald-900 text-xs">
                    <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold">Scholarship Seat Booked Successfully!</p>
                      <p className="mt-0.5">Your seat reservation details are available below.</p>
                    </div>
                  </div>

                  {/* Admit card preview */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                    <div className="bg-indigo-950 text-white px-5 py-4 text-center">
                      <h4 className="font-extrabold text-sm tracking-wider">SCHOLARSHIP ADMISSION TEST ADMIT CARD</h4>
                      <p className="text-[10px] text-indigo-200/80 mt-0.5">THE PRIME CLASSES · ACADEMIC SESSION 2026-27</p>
                    </div>

                    <div className="p-5 grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[9px] text-gray-400 font-bold uppercase">Roll Number</span>
                        <p className="font-mono font-bold text-gray-900 mt-0.5">{scholRollNumber}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 font-bold uppercase">Allocated Seat Number</span>
                        <p className="font-mono font-bold text-gray-900 mt-0.5">{scholSeatNumber}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 font-bold uppercase">Candidate Name</span>
                        <p className="font-bold text-gray-900 mt-0.5">{scholName}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 font-bold uppercase">Test Date & Time</span>
                        <p className="font-bold text-gray-900 mt-0.5">Sunday, July 12, 2026 · 10:00 AM</p>
                      </div>
                      <div className="col-span-2 border-t border-gray-100 pt-3 flex gap-2 text-[10px] text-amber-700 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                        <span>Please carry a hardcopy of this admit card and a valid Aadhaar ID card to the exam center (Block A, Main Campus).</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 text-center py-2.5 border-t border-slate-100">
                      <button
                        onClick={() => window.print()}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center gap-1"
                      >
                        <FileText className="h-4 w-4" /> Print / Save Admit Card
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white/50 text-xs py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 The Prime Classes. Powered by Prime ERP SaaS. All Rights Reserved.</p>
          <div className="flex gap-4 text-[11px] font-medium text-white/70">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Contact Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
