import React, { useState, useEffect } from 'react';
import { MapPin, User, CheckCircle, LayoutDashboard, X, Building, Mail, Lock, LogOut, Home, TrendingUp, Users, Star, Award, Target, Eye, Trash2, BookOpen, Book, Library, BookMarked, GraduationCap, Sparkles, Grid } from 'lucide-react';

const EmployeePortal = () => {
  const [currentView, setCurrentView] = useState('admin_landing');
  const [stalls, setStalls] = useState(() => {
    const savedStalls = localStorage.getItem('tradeHallStalls');
    return savedStalls ? JSON.parse(savedStalls) : [];
  });
  const [adminTab, setAdminTab] = useState('requests');
  const [fadeIn, setFadeIn] = useState(false);
  const [adminList] = useState(() => {
    const savedAdmins = localStorage.getItem('bookfairAdmins');
    return savedAdmins ? JSON.parse(savedAdmins) : [
      { id: 1, email: 'admin@bookfair.com', password: 'admin123', name: 'Admin User', role: 'admin' },
      { id: 2, email: 'employee@bookfair.com', password: 'employee123', name: 'Employee User', role: 'admin' }
    ];
  });

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'tradeHallStalls' && e.newValue) {
        setStalls(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    setFadeIn(false);
    const timer = setTimeout(() => setFadeIn(true), 50);
    return () => clearTimeout(timer);
  }, [currentView]);

  const handleAdminLogin = (email, password) => {
    const admin = adminList.find(a => a.email === email && a.password === password);
    if (admin) {
      setCurrentView('admin_dashboard');
      return true;
    }
    return false;
  };

  const approveBooking = (stallId) => {
    if (window.confirm('Approve this booking request?')) {
      const updatedStalls = stalls.map(stall => {
        if (stall.id === stallId && stall.pending) {
          return {
            ...stall,
            reserved: true,
            pending: false,
            status: 'approved',
            approvedDate: new Date().toISOString()
          };
        }
        return stall;
      });
      setStalls(updatedStalls);
      localStorage.setItem('tradeHallStalls', JSON.stringify(updatedStalls));
      alert('✅ Booking request approved successfully!');
    }
  };

  const rejectBooking = (stallId) => {
    if (window.confirm('Reject this booking request?\n\nThis will cancel the vendor\'s request.')) {
      const updatedStalls = stalls.map(stall => {
        if (stall.id === stallId && stall.pending) {
          return {
            ...stall,
            reserved: false,
            pending: false,
            status: null,
            businessName: null,
            email: null,
            requestDate: null
          };
        }
        return stall;
      });
      setStalls(updatedStalls);
      localStorage.setItem('tradeHallStalls', JSON.stringify(updatedStalls));
      alert('❌ Booking request rejected.');
    }
  };

  const stats = {
    total: stalls.filter(s => !s.isEmpty).length,
    reserved: stalls.filter(s => s.reserved).length,
    available: stalls.filter(s => !s.isEmpty && !s.reserved && !s.pending).length,
    pending: stalls.filter(s => s.pending).length
  };

  const reservations = stalls.filter(s => s.reserved && s.businessName);
  const pendingRequests = stalls.filter(s => s.pending && s.businessName);

  // Progress Circle Component
  const ProgressCircle = ({ percentage, size = 120, strokeWidth = 8, color = 'pink' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    
    const colorMap = {
      pink: { from: '#ec4899', to: '#8b5cf6', glow: 'rgba(236, 72, 153, 0.3)' },
      blue: { from: '#3b82f6', to: '#06b6d4', glow: 'rgba(59, 130, 246, 0.3)' },
      green: { from: '#10b981', to: '#84cc16', glow: 'rgba(16, 185, 129, 0.3)' },
      orange: { from: '#f97316', to: '#fb923c', glow: 'rgba(249, 115, 22, 0.3)' }
    };
    
    const colors = colorMap[color] || colorMap.pink;
    
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.from} />
              <stop offset="100%" stopColor={colors.to} />
            </linearGradient>
            <filter id={`glow-${color}`}>
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#gradient-${color})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            filter={`url(#glow-${color})`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{percentage}%</div>
            <div className="text-xs text-gray-400">Capacity</div>
          </div>
        </div>
      </div>
    );
  };

  // Admin Landing Page
  const AdminLandingPage = () => (
    <div className={`min-h-screen bg-gradient-to-br from-[#1a1f37] via-[#2d1b4e] to-[#1a1f37] flex items-center justify-center p-8 transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'} relative overflow-hidden`}>
      <div className="background-orbs">
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="orb orb-4"></div>
      </div>
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute text-white/5 animate-floating-book"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${6 + Math.random() * 6}s`
            }}
          >
            {i % 3 === 0 ? <BookOpen size={40 + Math.random() * 40} /> : 
             i % 3 === 1 ? <Book size={40 + Math.random() * 40} /> : 
             <Library size={40 + Math.random() * 40} />}
          </div>
        ))}
      </div>
      
      <div className="max-w-4xl w-full relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 border border-blue-500/30 px-4 py-2 rounded-full mb-6 animate-book-open">
            <GraduationCap className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 text-sm font-semibold">Admin Access Portal</span>
            <Sparkles className="w-4 h-4 text-blue-400 animate-sparkle" />
          </div>
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent flex items-center justify-center gap-4">
            <Library className="w-16 h-16 text-blue-400 animate-floating-book" />
            Employee Portal
          </h1>
          <p className="text-xl text-gray-300 mb-8 flex items-center justify-center gap-2">
            <BookMarked className="w-5 h-5 text-cyan-400" />
            Admin Dashboard for Managing Reservations
            <BookMarked className="w-5 h-5 text-blue-400" />
          </p>
        </div>
        
        <div className="grid md:grid-cols-1 gap-8">
          <button
            onClick={() => setCurrentView('admin_login')}
            className="group relative bg-gradient-to-br from-[#2a2f4a]/80 to-[#1e2337]/80 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-2xl hover:shadow-blue-500/30 transform hover:scale-105 transition-all duration-300 hover:border-blue-500/40 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="absolute bottom-0 left-0 opacity-10 group-hover:opacity-20 transition-opacity">
              <Library className="w-40 h-40 text-blue-400 animate-floating-book" />
            </div>
            
            <div className="relative flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-cyan-600 p-8 rounded-full group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/50">
                  <GraduationCap className="w-16 h-16 text-white" />
                </div>
              </div>
              
              <div>
                <h2 className="text-4xl font-bold text-white mb-3">Login to Dashboard</h2>
                <p className="text-gray-300 text-center mb-6 text-lg">Secure access for authorized personnel only</p>
              </div>
              
              <div className="flex flex-wrap gap-3 justify-center">
                <span className="bg-blue-500/20 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Analytics Dashboard
                </span>
                <span className="bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                  <BookMarked className="w-4 h-4" />
                  Detailed Reports
                </span>
                <span className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                  <Library className="w-4 h-4" />
                  Reservation Management
                </span>
              </div>
              
              <div className="mt-6 text-blue-400 group-hover:translate-x-2 transition-transform flex items-center gap-2">
                <span className="text-lg font-semibold">Access Dashboard</span>
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </button>
        </div>
        
        <div className="mt-12 bg-gradient-to-r from-[#2a2f4a]/60 to-[#1e2337]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-center gap-4">
            <Lock className="w-6 h-6 text-blue-400" />
            <div className="text-center">
              <div className="text-white font-bold">Secure Employee Access</div>
              <div className="text-sm text-gray-400">Authorized personnel only - Contact IT for access credentials</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Admin Login
  const AdminLogin = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      setError('');
      
      const success = handleAdminLogin(credentials.email, credentials.password);
      if (!success) {
        setError('Invalid admin credentials');
      }
    };

    return (
      <div className={`min-h-screen bg-gradient-to-br from-[#1a1f37] via-[#2d1b4e] to-[#1a1f37] flex items-center justify-center p-8 transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'} relative overflow-hidden`}>
        <div className="background-orbs">
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>
        
        <div className="max-w-md w-full relative z-10">
          <button
            onClick={() => setCurrentView('admin_landing')}
            className="mb-4 text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-colors group"
          >
            <Home className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
          </button>
          
          <div className="bg-gradient-to-br from-[#2a2f4a]/80 to-[#1e2337]/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/50">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Admin Login</h2>
              <p className="text-gray-300 mt-2">Enter your credentials to access the dashboard</p>
            </div>
            
            {error && (
              <div className="mb-4 bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    required
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-[#1a1f37]/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition text-white placeholder-gray-500"
                    placeholder="admin@bookfair.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    required
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-[#1a1f37]/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition text-white placeholder-gray-500"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-700 transform hover:scale-105 transition-all shadow-lg shadow-blue-500/50"
              >
                Login to Dashboard
              </button>
            </form>
            
            <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
              <p className="text-xs text-gray-400 text-center">
                Demo: admin@bookfair.com / admin123
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Admin Dashboard
  const AdminDashboard = () => (
    <div className={`min-h-screen bg-gradient-to-br from-[#1a1f37] via-[#2d1b4e] to-[#1a1f37] p-8 transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'} relative overflow-hidden`}>
      <div className="background-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="orb orb-4"></div>
      </div>
      
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 2px, transparent 2px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 2px, transparent 2px)`,
          backgroundSize: '100px 100px'
        }}></div>
      </div>
      
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-xl shadow-lg shadow-blue-500/50 relative">
              <Library className="w-8 h-8 text-white animate-floating-book" />
              <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1 animate-sparkle" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                Admin Dashboard
              </h2>
              <p className="text-gray-300 text-sm">Manage bookfair reservations and stalls</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('admin_landing')}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold hover:from-red-600 hover:to-pink-700 transition shadow-lg flex items-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>

          <div className="bg-gradient-to-br from-[#2a2f4a]/80 to-[#1e2337]/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl p-4 sm:p-6 md:p-8">
            <div className="flex gap-2 sm:gap-4 mb-6 border-b border-white/10 overflow-x-auto">
            <button
              type="button"
              onClick={() => setAdminTab('requests')}
              className={`px-6 py-3 font-semibold transition-all rounded-t-xl relative ${
                adminTab === 'requests' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Booking Requests
                {stats.pending > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {stats.pending}
                  </span>
                )}
              </div>
              {adminTab === 'requests' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full"></div>
              )}
            </button>
            <button
              type="button"
              onClick={() => setAdminTab('availability')}
              className={`px-6 py-3 font-semibold transition-all rounded-t-xl relative ${
                adminTab === 'availability' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Grid className="w-5 h-5" />
                Stall Availability
              </div>
              {adminTab === 'availability' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full"></div>
              )}
            </button>
            <button
              type="button"
              onClick={() => setAdminTab('reservations')}
              className={`px-6 py-3 font-semibold transition-all rounded-t-xl relative ${
                adminTab === 'reservations' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                All Reservations
              </div>
              {adminTab === 'reservations' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full"></div>
              )}
            </button>
          </div>

          {adminTab === 'requests' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <CheckCircle className="w-7 h-7 text-blue-400" />
                  Pending Booking Requests
                  {stats.pending > 0 && (
                    <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">
                      {stats.pending} pending
                    </span>
                  )}
                </h2>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border border-blue-500/20 rounded-2xl p-12 text-center">
                  <CheckCircle className="w-16 h-16 text-blue-400 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-bold text-white mb-2">No Pending Requests</h3>
                  <p className="text-gray-300">All booking requests have been processed.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pendingRequests.map(stall => (
                    <div key={stall.id} className="bg-gradient-to-br from-orange-500/10 to-yellow-600/10 border border-orange-500/30 rounded-2xl p-6 hover:border-orange-500/50 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="bg-orange-500 text-white px-4 py-2 rounded-xl font-bold text-lg">
                              Stall {stall.id}
                            </span>
                            <span className="bg-orange-500/20 border border-orange-500/40 text-orange-300 px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                              ⏳ PENDING APPROVAL
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              stall.size === 'small' ? 'bg-green-500/20 border border-green-500/30 text-green-300' :
                              stall.size === 'medium' ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300' :
                              'bg-purple-500/20 border border-purple-500/30 text-purple-300'
                            }`}>
                              {stall.size}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <p className="text-white font-semibold">
                              <Building className="w-4 h-4 inline mr-2 text-blue-400" />
                              {stall.businessName}
                            </p>
                            <p className="text-gray-300 text-sm">
                              <Mail className="w-4 h-4 inline mr-2 text-gray-400" />
                              {stall.email}
                            </p>
                            <p className="text-gray-400 text-xs">
                              Requested: {new Date(stall.requestDate).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => approveBooking(stall.id)}
                            className="px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition shadow-lg flex items-center gap-2"
                          >
                            <CheckCircle className="w-5 h-5" />
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => rejectBooking(stall.id)}
                            className="px-5 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold hover:from-red-600 hover:to-pink-700 transition shadow-lg flex items-center gap-2"
                          >
                            <X className="w-5 h-5" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {adminTab === 'availability' && (
            <div className="grid md:grid-cols-4 gap-6">
              <div className="md:col-span-3">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Grid className="w-6 h-6 text-blue-400" />
                  All Stalls
                </h3>
                <div className="grid grid-cols-5 gap-3">
                  {stalls.filter(s => !s.isEmpty).map(stall => (
                    <div
                      key={stall.id}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        stall.pending
                          ? 'bg-orange-500/10 border-orange-500/40 animate-pulse'
                          : stall.reserved
                          ? 'bg-gray-700/30 border-gray-600'
                          : 'bg-green-500/10 border-green-500/30'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{stall.id}</div>
                        <div className="text-xs text-gray-400">{stall.size}</div>
                        {stall.pending && (
                          <div className="mt-2">
                            <CheckCircle className="w-5 h-5 text-orange-400 mx-auto" />
                            <div className="text-xs text-orange-400 mt-1">Pending</div>
                          </div>
                        )}
                        {stall.reserved && !stall.pending && (
                          <div className="mt-2">
                            <CheckCircle className="w-5 h-5 text-gray-400 mx-auto" />
                            <div className="text-xs text-gray-500 mt-1">Reserved</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-[#2a2f4a]/80 to-[#1e2337]/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-6">
                  <div className="text-sm text-gray-400 mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Booking Progress
                  </div>
                  <div className="flex justify-center mb-4">
                    <ProgressCircle 
                      percentage={Math.round((stats.reserved / stats.total) * 100)} 
                      size={140} 
                      strokeWidth={10}
                      color="pink" 
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400">Stalls Reserved</div>
                    <div className="text-lg font-bold text-white">{stats.reserved} of {stats.total}</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-[#2a2f4a]/80 to-[#1e2337]/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-6">
                  <div className="text-sm text-gray-400 mb-4 flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Stall Sizes
                  </div>
                  <div className="space-y-3">
                    {['small', 'medium', 'large'].map((size, idx) => {
                      const count = stalls.filter(s => s.size === size && !s.isEmpty).length;
                      const reserved = stalls.filter(s => s.size === size && s.reserved).length;
                      const percentage = count > 0 ? (reserved / count) * 100 : 0;
                      const colors = ['from-blue-500 to-cyan-600', 'from-pink-500 to-purple-600', 'from-orange-500 to-amber-600'];
                      
                      return (
                        <div key={size}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-300 capitalize font-medium">{size}</span>
                            <span className="text-xs text-gray-400">{reserved}/{count}</span>
                          </div>
                          <div className="h-2 bg-[#1a1f37] rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r ${colors[idx]} transition-all duration-1000 rounded-full`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {adminTab === 'reservations' && (
            <div className="grid md:grid-cols-4 gap-6">
              <div className="md:col-span-3">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6 text-purple-400" />
                  Active Reservations ({reservations.length})
                </h3>
                {reservations.length > 0 ? (
                  <div className="space-y-3">
                    {reservations.map((stall) => (
                      <div
                        key={stall.id}
                        className="bg-[#1a1f37]/50 border border-white/10 rounded-xl p-4 hover:border-purple-500/30 transition"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="bg-purple-500/20 border border-purple-500/30 px-3 py-1 rounded-lg">
                                <span className="text-purple-300 font-bold">{stall.id}</span>
                              </div>
                              <div className="text-sm text-gray-400">{stall.size}</div>
                            </div>
                            <div className="text-white font-semibold mb-1">{stall.businessName}</div>
                            <div className="text-gray-400 text-sm flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              {stall.email}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="bg-green-500/20 border border-green-500/30 px-3 py-1 rounded-full">
                              <span className="text-green-300 text-xs font-semibold">✓ Confirmed</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-700/30 rounded-full mb-4">
                      <Users className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-gray-400">No reservations yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Main render
  return (
    <div>
      {currentView === 'admin_landing' && <AdminLandingPage />}
      {currentView === 'admin_login' && <AdminLogin />}
      {currentView === 'admin_dashboard' && <AdminDashboard />}
    </div>
  );
};

export default EmployeePortal;
