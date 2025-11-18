import React, { useState, useEffect } from 'react';
import { MapPin, User, CheckCircle, X, Building, Mail, Lock, Home, Calendar, Users, BookOpen, Book, Library, Bookmark, BookMarked, Feather, Sparkles, Grid, LogOut } from 'lucide-react';

// Generate initial stall data with map positions matching Trade Hall floor plan
const generateInitialStalls = () => {
  const stalls = [];
  const sizes = ['small', 'medium', 'large'];
  
  // Define stalls based on the actual Trade Hall layout
  const stallLayout = [
    // Row A (Top)
    { id: 'A1', x: 23, y: 12 }, { id: 'A2', x: 29, y: 12 }, { id: 'A3', x: 35, y: 12 },
    { id: 'A4', x: 45, y: 12 }, { id: 'A5', x: 51, y: 12 }, { id: 'A6', x: 57, y: 12 },
    { id: 'A7', x: 63, y: 12 }, { id: 'A8', x: 69, y: 12 }, { id: 'A9', x: 80, y: 12 },
    { id: 'A10', x: 86, y: 12 },
    
    // Row B (Second row)
    { id: 'B1', x: 17, y: 22 }, { id: 'B2', x: 23, y: 22 }, { id: 'B3', x: 29, y: 22 },
    { id: 'B4', x: 41, y: 22 }, { id: 'B5', x: 49, y: 22 }, { id: 'B6', x: 57, y: 22 },
    { id: 'B7', x: 65, y: 22 }, { id: 'B8', x: 73, y: 22 }, { id: 'B9', x: 81, y: 22 },
    { id: 'B10', x: 87, y: 22 },
    
    // Row C (Middle section)
    { id: 'C1', x: 17, y: 32 }, { id: 'C2', x: 23, y: 32 }, { id: 'C3', x: 29, y: 32 },
    { id: 'C4', x: 41, y: 32 }, { id: 'C7', x: 65, y: 32 }, { id: 'C8', x: 73, y: 32 },
    { id: 'C9', x: 81, y: 32 }, { id: 'C10', x: 87, y: 32 },
    
    // Row D (Center blocks)
    { id: 'D1', x: 17, y: 42 }, { id: 'D2', x: 23, y: 42 }, { id: 'D3', x: 29, y: 42 },
    { id: 'D4', x: 41, y: 42 }, { id: 'D5', x: 49, y: 42 }, { id: 'D6', x: 57, y: 42 },
    { id: 'D7', x: 65, y: 42 }, { id: 'D8', x: 73, y: 42 }, { id: 'D9', x: 81, y: 42 },
    { id: 'D10', x: 87, y: 42 },
    
    // Row E (Bottom)
    { id: 'E1', x: 17, y: 52 }, { id: 'E2', x: 29, y: 52 }, { id: 'E3', x: 35, y: 52 },
    { id: 'E4', x: 41, y: 52 }, { id: 'E5', x: 49, y: 52 }, { id: 'E6', x: 57, y: 52 },
    { id: 'E7', x: 65, y: 52 }, { id: 'E8', x: 73, y: 52 }, { id: 'E9', x: 81, y: 52 },
    { id: 'E10', x: 87, y: 52 }
  ];
  
  stallLayout.forEach(stall => {
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    const reserved = Math.random() < 0.3;
    
    stalls.push({
      id: stall.id,
      size,
      reserved,
      isEmpty: false,
      businessName: reserved ? `Business ${stall.id}` : null,
      email: reserved ? `vendor${stall.id.toLowerCase()}@example.com` : null,
      mapPosition: { x: stall.x, y: stall.y }
    });
  });
  
  return stalls;
};

const VendorPortal = () => {
  const [currentView, setCurrentView] = useState('landing');
  const [stalls, setStalls] = useState(() => {
    const savedStalls = localStorage.getItem('tradeHallStalls');
    return savedStalls ? JSON.parse(savedStalls) : generateInitialStalls();
  });
  const [selectedStalls, setSelectedStalls] = useState([]);
  // Booking flow state
  const [bookingStep, setBookingStep] = useState(1); // 1 select, 2 review, 3 submitted
  const [vendorHomeTab, setVendorHomeTab] = useState('booking'); // booking | profile
  const [vendorInfo, setVendorInfo] = useState({ businessName: '', email: '', password: '' });
  const [genres, setGenres] = useState([]);
  const [genreInput, setGenreInput] = useState('');
  const [fadeIn, setFadeIn] = useState(false);
  const [isVendorAuthenticated, setIsVendorAuthenticated] = useState(false);
  const [registeredVendors, setRegisteredVendors] = useState([
    { email: 'vendor1@bookfair.com', password: 'vendor123', businessName: 'Demo Bookstore' }
  ]);
  const [stallMapImage, setStallMapImage] = useState(() => {
    const savedMap = localStorage.getItem('tradeHallMap');
    return savedMap || null;
  });
  const [useMapView, setUseMapView] = useState(false);

  // Save stalls to localStorage
  useEffect(() => {
    localStorage.setItem('tradeHallStalls', JSON.stringify(stalls));
  }, [stalls]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'tradeHallMap' && e.newValue) {
        setStallMapImage(e.newValue);
      }
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

  const handleStallClick = (stall) => {
    if (stall.reserved || stall.pending) return;
    
    if (selectedStalls.includes(stall.id)) {
      setSelectedStalls(selectedStalls.filter(id => id !== stall.id));
    } else {
      if (selectedStalls.length < 3) {
        setSelectedStalls([...selectedStalls, stall.id]);
      }
    }
  };

  const confirmReservation = () => {
    const updatedStalls = stalls.map(stall => {
      if (selectedStalls.includes(stall.id)) {
        return {
          ...stall,
          reserved: false,
          pending: true,
          status: 'pending',
          businessName: vendorInfo.businessName,
          email: vendorInfo.email,
          requestDate: new Date().toISOString()
        };
      }
      return stall;
    });
    
    setStalls(updatedStalls);
    alert('🎉 Booking request submitted! Your request is now pending admin approval.');
    setBookingStep(3); // show submitted state
  };

  const addGenre = () => {
    if (genreInput.trim()) {
      setGenres([...genres, genreInput.trim()]);
      setGenreInput('');
    }
  };

  const cancelReservation = (stallId) => {
    const updatedStalls = stalls.map(stall => {
      if (stall.id === stallId && stall.businessName === vendorInfo.businessName) {
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
  };
  
  const handleVendorLogin = (email, password) => {
    if (email && password) {
      let vendor = registeredVendors.find(v => v.email === email);
      if (!vendor) {
        vendor = { 
          businessName: email.split('@')[0] || 'Vendor', 
          email: email, 
          password: password 
        };
      }
      setVendorInfo(vendor);
      setIsVendorAuthenticated(true);
      setCurrentView('vendor_home');
      return true;
    }
    return false;
  };
  
  const handleVendorSignup = (businessName, email, password) => {
    const existingVendor = registeredVendors.find(v => v.email === email);
    if (existingVendor) {
      return { success: false, message: 'Email already registered' };
    }
    
    const newVendor = { businessName, email, password };
    setRegisteredVendors([...registeredVendors, newVendor]);
    setVendorInfo(newVendor);
    setIsVendorAuthenticated(true);
    return { success: true };
  };
  
  const handleVendorLogout = () => {
    setIsVendorAuthenticated(false);
    setVendorInfo({ businessName: '', email: '', password: '' });
    setSelectedStalls([]);
    setGenres([]);
    setCurrentView('landing');
  };

  const handleMapClick = (e) => {
    if (!stallMapImage) return;
    
    const isImage = e.target.tagName === 'IMG';
    if (!isImage) return;
    
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    let nearestStall = null;
    let minDistance = 8;
    
    stalls.forEach(stall => {
      if (!stall.mapPosition || stall.isEmpty) return;
      const distance = Math.sqrt(
        Math.pow(stall.mapPosition.x - x, 2) + 
        Math.pow(stall.mapPosition.y - y, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestStall = stall;
      }
    });
    
    if (nearestStall && !nearestStall.reserved) {
      handleStallClick(nearestStall);
    }
  };

  const stats = {
    total: stalls.filter(s => !s.isEmpty).length,
    reserved: stalls.filter(s => s.reserved).length,
    available: stalls.filter(s => !s.isEmpty && !s.reserved).length
  };

  // Landing Page Component
  const LandingPage = () => (
    <div className={`min-h-screen bg-gradient-to-br from-[#1a1f37] via-[#2d1b4e] to-[#1a1f37] flex items-center justify-center p-8 transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'} relative overflow-hidden`}>
      <div className="background-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="orb orb-4"></div>
      </div>
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          ></div>
        ))}
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
      
      <div className="max-w-6xl w-full relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500/20 to-purple-600/20 border border-pink-500/30 px-4 py-2 rounded-full mb-6 animate-book-open">
            <BookOpen className="w-4 h-4 text-pink-400 animate-page-flip" />
            <span className="text-pink-300 text-sm font-semibold">Colombo 2025 - Premium Event</span>
            <Sparkles className="w-4 h-4 text-pink-400 animate-sparkle" />
          </div>
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent flex items-center justify-center gap-4">
            <Book className="w-16 h-16 text-pink-400 animate-floating-book" />
            Colombo International Bookfair
            <Library className="w-16 h-16 text-purple-400 animate-floating-book" style={{ animationDelay: '2s' }} />
          </h1>
          <p className="text-xl text-gray-300 mb-8 flex items-center justify-center gap-2">
            <Feather className="w-5 h-5 text-purple-400" />
            Smart Stall Reservation System
            <Feather className="w-5 h-5 text-pink-400" />
          </p>
          
          <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mb-12">
            <div className="bg-gradient-to-br from-[#2a2f4a]/60 to-[#1e2337]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-center gap-3">
                <Calendar className="w-5 h-5 text-blue-400" />
                <div className="text-left">
                  <div className="text-sm text-gray-400">Event Date</div>
                  <div className="text-white font-bold">Dec 15-20</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#2a2f4a]/60 to-[#1e2337]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-center gap-3">
                <MapPin className="w-5 h-5 text-pink-400" />
                <div className="text-left">
                  <div className="text-sm text-gray-400">Available Stalls</div>
                  <div className="text-white font-bold">{stats.available}/{stats.total}</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#2a2f4a]/60 to-[#1e2337]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-center gap-3">
                <Users className="w-5 h-5 text-green-400" />
                <div className="text-left">
                  <div className="text-sm text-gray-400">Vendors</div>
                  <div className="text-white font-bold">{stats.reserved}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-1 gap-8">
          <button
            onClick={() => setCurrentView('vendor_auth')}
            className="group relative bg-gradient-to-br from-[#2a2f4a]/80 to-[#1e2337]/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl hover:shadow-pink-500/30 transform hover:scale-105 transition-all duration-300 hover:border-pink-500/40 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity">
              <BookMarked className="w-32 h-32 text-pink-400 animate-page-flip" />
            </div>
            
            <div className="relative flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-pink-500 to-purple-600 p-6 rounded-full group-hover:scale-110 transition-transform shadow-lg shadow-pink-500/50">
                  <BookOpen className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Vendor Portal</h2>
                <p className="text-gray-300 text-center mb-4">Reserve your stalls and manage your exhibition space</p>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="bg-pink-500/20 border border-pink-500/30 text-pink-300 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Book className="w-3 h-3" />
                  Interactive Map
                </span>
                <span className="bg-purple-500/20 border border-purple-500/30 text-purple-300 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Bookmark className="w-3 h-3" />
                  Instant Booking
                </span>
                <span className="bg-blue-500/20 border border-blue-500/30 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Real-time Updates
                </span>
              </div>
              
              <div className="mt-4 text-pink-400 group-hover:translate-x-2 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </button>
        </div>
        
        <div className="mt-12 bg-gradient-to-r from-[#2a2f4a]/60 to-[#1e2337]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Book className="w-8 h-8 text-yellow-400 animate-floating-book" />
              <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-sparkle" />
            </div>
            <div>
              <div className="text-white font-bold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-pink-400" />
                Trusted by 200+ Publishers
              </div>
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <Feather className="w-3 h-3 text-purple-400" />
                Sri Lanka's Premier Book Exhibition Platform
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="text-center group">
              <div className="text-2xl font-bold text-white flex items-center justify-center gap-1">
                50+
                <BookMarked className="w-5 h-5 text-pink-400 group-hover:animate-bookmark-drop" />
              </div>
              <div className="text-xs text-gray-400">Stalls</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">6</div>
              <div className="text-xs text-gray-400">Days</div>
            </div>
            <div className="text-center group">
              <div className="text-2xl font-bold text-white flex items-center justify-center gap-1">
                24/7
                <Library className="w-5 h-5 text-blue-400 group-hover:animate-floating-book" />
              </div>
              <div className="text-xs text-gray-400">Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Vendor Authentication Component
  const VendorAuth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ businessName: '', email: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      setError('');
      
      if (isLogin) {
        const success = handleVendorLogin(formData.email, formData.password);
        if (!success) {
          setError('Invalid credentials');
        }
      } else {
        const result = handleVendorSignup(formData.businessName, formData.email, formData.password);
        if (!result.success) {
          setError(result.message);
        } else {
          setCurrentView('vendor_home');
        }
      }
    };

    return (
      <div className={`min-h-screen bg-gradient-to-br from-[#1a1f37] via-[#2d1b4e] to-[#1a1f37] flex items-center justify-center p-8 transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'} relative overflow-hidden`}>
        <div className="background-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>
        
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute text-pink-400/10 animate-page-flip"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${4 + Math.random() * 4}s`
              }}
            >
              <BookOpen size={30 + Math.random() * 30} />
            </div>
          ))}
        </div>
        
        <div className="max-w-md w-full relative z-10">
          <button
            onClick={() => setCurrentView('landing')}
            className="mb-4 text-pink-400 hover:text-pink-300 flex items-center gap-2 transition-colors group"
          >
            <Home className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
          </button>
          
          <div className="bg-gradient-to-br from-[#2a2f4a]/80 to-[#1e2337]/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8 animate-book-open">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-br from-pink-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-500/50 relative">
                <BookOpen className="w-8 h-8 text-white animate-page-flip" />
                <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1 animate-sparkle" />
              </div>
              <h2 className="text-3xl font-bold text-white">{isLogin ? 'Vendor Login' : 'Vendor Registration'}</h2>
              <p className="text-gray-300 mt-2 flex items-center justify-center gap-2">
                <Feather className="w-4 h-4 text-purple-400" />
                {isLogin ? 'Access your vendor account' : 'Create your account to reserve stalls'}
              </p>
            </div>
            
            {error && (
              <div className="mb-4 bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Business Name</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      required
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-[#1a1f37]/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500/50 transition text-white placeholder-gray-500"
                      placeholder="Enter your business name"
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-[#1a1f37]/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500/50 transition text-white placeholder-gray-500"
                    placeholder="your.email@example.com"
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
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-[#1a1f37]/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500/50 transition text-white placeholder-gray-500"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg shadow-pink-500/50"
              >
                {isLogin ? 'Login to Account' : 'Create Account & Reserve Stalls'}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setFormData({ businessName: '', email: '', password: '' });
                }}
                className="text-pink-400 hover:text-pink-300 text-sm transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
              </button>
            </div>
            
            {isLogin && (
              <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                <p className="text-xs text-gray-400 text-center">
                  Demo: vendor1@bookfair.com / vendor123
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Vendor Home with Booking/Profile Tabs
  const VendorHome = () => {
    const myReservations = stalls.filter(s => s.businessName === vendorInfo.businessName);
    const selectedStallObjects = stalls.filter(s => selectedStalls.includes(s.id));

    return (
      <div className={`min-h-screen bg-gradient-to-br from-[#1a1f37] via-[#2d1b4e] to-[#1a1f37] p-4 sm:p-6 md:p-8 transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'} relative overflow-hidden`}>
        <div className="background-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-8 h-8 text-pink-400" />
                Welcome, {vendorInfo.businessName}!
              </h2>
              <p className="text-sm sm:text-base text-gray-300">Reserve your perfect stall location</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              {stallMapImage && (
                <button
                  onClick={() => setUseMapView(!useMapView)}
                  className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2 ${
                    useMapView
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                      : 'bg-[#2a2f4a] text-gray-300 border border-white/10 hover:border-purple-500/50'
                  }`}
                >
                  {useMapView ? <MapPin className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                  {useMapView ? 'Map View' : 'Grid View'}
                </button>
              )}
              <button
                onClick={handleVendorLogout}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold hover:from-red-600 hover:to-pink-700 transition shadow-lg flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 sm:gap-4 mb-6 border-b border-white/10 overflow-x-auto">
            <button
              type="button"
              onClick={() => { setVendorHomeTab('booking'); setBookingStep(1); }}
              className={`px-4 sm:px-6 py-3 font-semibold transition-all rounded-t-xl relative whitespace-nowrap ${vendorHomeTab === 'booking' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Book Stalls
              </div>
              {vendorHomeTab === 'booking' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"></div>}
            </button>
            <button
              type="button"
              onClick={() => setVendorHomeTab('profile')}
              className={`px-4 sm:px-6 py-3 font-semibold transition-all rounded-t-xl relative whitespace-nowrap ${vendorHomeTab === 'profile' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                My Profile
              </div>
              {vendorHomeTab === 'profile' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"></div>}
            </button>
          </div>

          {vendorHomeTab === 'profile' && (
            <div className="bg-gradient-to-br from-[#2a2f4a]/80 to-[#1e2337]/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl p-4 sm:p-6 md:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400" />
                Profile Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Business Name</label>
                  <input
                    type="text"
                    value={vendorInfo.businessName}
                    onChange={(e) => setVendorInfo({...vendorInfo, businessName: e.target.value})}
                    className="w-full px-4 py-3 bg-[#0d1229] border border-white/10 rounded-xl text-white focus:outline-none focus:border-pink-500 transition"
                    placeholder="Your business name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Contact Email</label>
                  <input
                    type="email"
                    value={vendorInfo.email}
                    onChange={(e) => setVendorInfo({...vendorInfo, email: e.target.value})}
                    className="w-full px-4 py-3 bg-[#0d1229] border border-white/10 rounded-xl text-white focus:outline-none focus:border-pink-500 transition"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-2">Genres / Categories</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={genreInput}
                    onChange={(e) => setGenreInput(e.target.value)}
                    className="flex-1 px-4 py-3 bg-[#0d1229] border border-white/10 rounded-xl text-white focus:outline-none focus:border-pink-500 transition"
                    placeholder="Add a genre"
                  />
                  <button
                    type="button"
                    onClick={addGenre}
                    className="px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition"
                  >Add</button>
                </div>
                {genres.length === 0 ? (
                  <p className="text-sm text-gray-400">No genres added yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {genres.map(g => (
                      <span
                        key={g}
                        className="group inline-flex items-center gap-2 bg-pink-500/20 border border-pink-500/30 text-pink-300 px-3 py-2 rounded-full text-xs font-semibold"
                      >
                        {g}
                        <button
                          type="button"
                          onClick={() => setGenres(genres.filter(x => x !== g))}
                          className="opacity-60 hover:opacity-100 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => alert('✅ Profile updated (stored in this session).')}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold hover:from-pink-600 hover:to-purple-700 transition"
                >Save Profile</button>
              </div>
            </div>
          )}

          {vendorHomeTab === 'booking' && (
            <>
              {/* Booking Step Indicator */}
              <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  {[1,2,3].map(step => (
                    <div key={step} className={`flex items-center gap-2 ${step < 3 ? 'mr-2' : ''}`}> 
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                        bookingStep === step ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-110' : step < bookingStep ? 'bg-green-600 text-white' : 'bg-[#2a2f4a] text-gray-400'
                      }`}>{step}</div>
                      {step < 3 && <div className="hidden md:block w-12 h-1 bg-gradient-to-r from-pink-500/40 to-purple-600/40 rounded"></div>}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-300 font-medium">
                  {bookingStep === 1 && 'Step 1: Select up to 3 stalls'}
                  {bookingStep === 2 && 'Step 2: Review your selection'}
                  {bookingStep === 3 && 'Step 3: Request submitted - awaiting approval'}
                </div>
              </div>

              {/* Step Content */}
              {bookingStep === 1 && (
                <div className="mb-6 bg-[#1e2337]/60 border border-white/10 rounded-2xl p-5 text-sm text-gray-300">
                  Select up to <span className="text-pink-400 font-semibold">3 stalls</span>. You can toggle between grid and map view. After selecting, click "Review Selection" to continue.
                </div>
              )}
              {bookingStep === 2 && (
                <div className="mb-6 bg-[#1e2337]/60 border border-white/10 rounded-2xl p-5 text-sm text-gray-300">
                  Review your chosen stalls. Remove any if needed. When ready, submit your booking request for admin approval.
                </div>
              )}
              {bookingStep === 3 && (
                <div className="mb-6 bg-green-600/20 border border-green-500/40 rounded-2xl p-5 text-sm text-green-300">
                  Your booking request has been submitted and is pending admin approval. You can track status below.
                </div>
              )}

              {/* Selection / Map/Grid (Step 1 only) */}
              {bookingStep === 1 && (
                <>
                  {/* Conditionally render Map View or Grid View */}
                  {useMapView && stallMapImage ? (
                    <div className="bg-gradient-to-br from-[#2a2f4a]/80 to-[#1e2337]/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
                      <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <MapPin className="w-6 h-6 text-purple-400" />
                        Trade Hall Floor Plan
                      </h3>
                      <div className="relative" onClick={handleMapClick}>
                        <img 
                          src={stallMapImage} 
                          alt="Trade Hall Map" 
                          className="w-full h-auto rounded-lg cursor-pointer" 
                        />
                        {stalls.map((stall) => {
                          if (!stall.mapPosition || stall.isEmpty) return null;
                          const isSelected = selectedStalls.includes(stall.id);
                          const isMyReservation = stall.businessName === vendorInfo.businessName;
                          const isMyPending = stall.pending && isMyReservation;
                          return (
                            <div key={stall.id} className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: `${stall.mapPosition.x}%`, top: `${stall.mapPosition.y}%` }}>
                              <div className={`w-10 h-10 rounded-full flex flex-col items-center justify-center text-xs font-bold transition-all ${
                                isMyPending ? 'bg-orange-500 text-white ring-4 ring-orange-400/50 animate-pulse' :
                                isMyReservation ? 'bg-green-500 text-white ring-4 ring-green-400/50' :
                                isSelected ? 'bg-pink-500 text-white ring-4 ring-pink-400/50 scale-125' :
                                (stall.reserved || stall.pending) ? 'bg-gray-600 text-gray-400 opacity-50' : 'bg-blue-500 text-white hover:scale-110'
                              }`}>
                                <span className="text-[12px] leading-none">{stall.id}</span>
                                <span className="text-[10px] opacity-75 leading-none mt-0.5">{stall.size[0]}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex items-center gap-6 mt-4 justify-center flex-wrap">
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-500 rounded-full"/><span className="text-sm text-gray-300">Available</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-pink-500 rounded-full"/><span className="text-sm text-gray-300">Selected</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-orange-500 rounded-full"/><span className="text-sm text-gray-300">Pending</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded-full"/><span className="text-sm text-gray-300">Approved</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-600 rounded-full"/><span className="text-sm text-gray-300">Reserved</span></div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
                      {stalls.filter(s => !s.isEmpty).map(stall => {
                        const isSelected = selectedStalls.includes(stall.id);
                        const isMyReservation = stall.businessName === vendorInfo.businessName;
                        const isMyPending = stall.pending && isMyReservation;
                        return (
                          <button key={stall.id} type="button" onClick={() => handleStallClick(stall)} disabled={(stall.reserved || stall.pending) && !isMyReservation} className={`p-4 rounded-xl border-2 transition-all ${
                            isMyPending ? 'bg-orange-500/20 border-orange-500 cursor-default' :
                            isMyReservation ? 'bg-green-500/20 border-green-500 cursor-default' :
                            isSelected ? 'bg-pink-500/20 border-pink-500 scale-105' :
                            (stall.reserved || stall.pending) ? 'bg-gray-700/30 border-gray-600 cursor-not-allowed opacity-50' : 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 hover:scale-105'
                          }`}>
                            <div className="text-center">
                              <div className="text-lg font-bold text-white">{stall.id}</div>
                              <div className="text-xs text-gray-400">{stall.size}</div>
                              {isMyPending && <div className="mt-2"><CheckCircle className="w-5 h-5 text-orange-400 mx-auto" /><div className="text-xs text-orange-400 mt-1">Pending</div></div>}
                              {isMyReservation && !isMyPending && <div className="mt-2"><CheckCircle className="w-5 h-5 text-green-400 mx-auto" /><div className="text-xs text-green-400 mt-1">Approved</div></div>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* Review Step */}
              {bookingStep === 2 && (
                <div className="bg-gradient-to-br from-[#2a2f4a]/80 to-[#1e2337]/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Bookmark className="w-6 h-6 text-pink-400" />
                    Review Selection
                  </h3>
                  {selectedStallObjects.length === 0 ? (
                    <p className="text-gray-400">No stalls selected. Go back to selection.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      {selectedStallObjects.map(stall => (
                        <div key={stall.id} className="p-4 rounded-xl border border-pink-500/40 bg-pink-500/10 relative">
                          <div className="text-lg font-bold text-white">{stall.id}</div>
                          <div className="text-xs text-gray-300 mb-2">{stall.size}</div>
                          <button
                            type="button"
                            onClick={() => setSelectedStalls(selectedStalls.filter(id => id !== stall.id))}
                            className="absolute top-2 right-2 text-gray-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-4">
                    <div className="bg-[#1e2337] rounded-xl p-4 text-sm text-gray-300 border border-white/10">
                      <p><span className="text-pink-400 font-semibold">Business:</span> {vendorInfo.businessName || 'Not set'}</p>
                      <p><span className="text-pink-400 font-semibold">Email:</span> {vendorInfo.email || 'Not set'}</p>
                      <p><span className="text-pink-400 font-semibold">Genres:</span> {genres.length ? genres.join(', ') : 'None added'}</p>
                    </div>
                    <button
                      type="button"
                      disabled={selectedStallObjects.length === 0 || !vendorInfo.businessName || !vendorInfo.email}
                      onClick={confirmReservation}
                      className={`w-full py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
                        (selectedStallObjects.length === 0 || !vendorInfo.businessName || !vendorInfo.email)
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700'
                      }`}
                    >
                      <CheckCircle className="w-5 h-5" /> Submit Booking Request
                    </button>
                  </div>
                </div>
              )}

              {/* Submitted Step (Step 3) */}
              {bookingStep === 3 && (
                <div className="bg-gradient-to-br from-green-600/10 to-emerald-600/10 border border-green-500/30 rounded-3xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    Request Submitted
                  </h3>
                  <p className="text-gray-300 mb-6">Your booking request is pending approval. You will see its status below once processed by an admin.</p>
                  <button
                    type="button"
                    onClick={() => { setSelectedStalls([]); setBookingStep(1); }}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold hover:from-pink-600 hover:to-purple-700 transition"
                  >Make Another Booking</button>
                </div>
              )}

              {/* Floating next button for step 1 */}
              {bookingStep === 1 && selectedStalls.length > 0 && (
                <div className="fixed bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-50 w-[calc(100%-2rem)] sm:w-auto">
                  <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-full shadow-2xl flex items-center justify-between gap-2 sm:gap-4">
                    <span className="font-bold text-sm sm:text-base">{selectedStalls.length} stall(s) selected</span>
                    <button
                      type="button"
                      onClick={() => setBookingStep(2)}
                      className="bg-white text-purple-600 px-4 sm:px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition text-sm sm:text-base"
                    >Review Selection</button>
                  </div>
                </div>
              )}
            </>
          )}
          

          {myReservations.length > 0 && (
            <div className="mt-6 sm:mt-8 bg-gradient-to-br from-[#2a2f4a]/80 to-[#1e2337]/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl p-4 sm:p-6 md:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                Your Bookings
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myReservations.map(stall => (
                  <div key={stall.id} className={`rounded-xl p-4 border-2 ${
                    stall.pending 
                      ? 'bg-orange-500/10 border-orange-500/40' 
                      : 'bg-green-500/10 border-green-500/30'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-lg font-bold text-white">{stall.id}</div>
                        <div className="text-sm text-gray-400">{stall.size}</div>
                        {stall.pending && (
                          <div className="mt-2 flex items-center gap-1">
                            <span className="text-xs text-orange-400 font-semibold">⏳ Pending Approval</span>
                          </div>
                        )}
                        {stall.reserved && !stall.pending && (
                          <div className="mt-2 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            <span className="text-xs text-green-400 font-semibold">Approved</span>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Cancel ${stall.pending ? 'request' : 'reservation'} for ${stall.id}?`)) {
                            cancelReservation(stall.id);
                          }
                        }}
                        className="text-red-400 hover:text-red-300 transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Removed legacy confirm modal in favor of stepper */}
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div>
      {currentView === 'landing' && <LandingPage />}
      {currentView === 'vendor_auth' && <VendorAuth />}
      {currentView === 'vendor_home' && <VendorHome />}
    </div>
  );
};

export default VendorPortal;
