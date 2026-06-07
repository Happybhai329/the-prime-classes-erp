import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';

// Placeholder pages — will be replaced with full implementations
const LoginPage = () => (
  <div className="min-h-screen gradient-primary flex items-center justify-center p-4">
    <div className="glass-card p-8 w-full max-w-md animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          The Prime Classes
        </h1>
        <p className="text-primary-200 text-sm">
          Military School Entrance Preparation
        </p>
      </div>
      <p className="text-white/70 text-center text-sm">
        Login page will be implemented in Phase 1
      </p>
    </div>
  </div>
);

const DashboardPage = () => (
  <div className="p-6 animate-slide-up">
    <h1 className="text-2xl font-display font-bold text-gray-900 mb-6">
      Dashboard
    </h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { label: 'Total Students', value: '500+', color: 'from-blue-500 to-blue-700' },
        { label: 'Active Batches', value: '8', color: 'from-emerald-500 to-emerald-700' },
        { label: 'Today\'s Attendance', value: '94%', color: 'from-purple-500 to-purple-700' },
        { label: 'Pending Fees', value: '₹2.4L', color: 'from-orange-500 to-orange-700' },
      ].map((stat) => (
        <div key={stat.label} className={`card-hover p-6 bg-gradient-to-br ${stat.color} text-white`}>
          <p className="text-sm font-medium text-white/80">{stat.label}</p>
          <p className="text-3xl font-display font-bold mt-2">{stat.value}</p>
        </div>
      ))}
    </div>
  </div>
);

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
