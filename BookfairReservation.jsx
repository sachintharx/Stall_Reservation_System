import React, { useState, useEffect } from 'react';
import { MapPin, User, CheckCircle, LayoutDashboard, X, Building, Mail, Lock, Plus, LogOut, Home, TrendingUp, Calendar, Clock, Users, Star, Award, Target, Eye, Trash2, BookOpen, Book, Library, Bookmark, BookMarked, GraduationCap, Feather, Sparkles, Info, Grid, Upload, Search, FileText, Phone } from 'lucide-react';

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
    
    // Row C (Middle section - left side)
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
    const reserved = Math.random() < 0.3; // 30% pre-reserved
    
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

const App = () => {
  // Check if we're on the admin route
  const isAdminRoute = window.location.pathname === '/admin' || window.location.pathname === '/admin/';
  
  const [currentView, setCurrentView] = useState(isAdminRoute ? 'admin_landing' : 'landing');
  const [stalls, setStalls] = useState(() => {
    const savedStalls = localStorage.getItem('tradeHallStalls');
    return savedStalls ? JSON.parse(savedStalls) : generateInitialStalls();
  });
  const [selectedStalls, setSelectedStalls] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [vendorInfo, setVendorInfo] = useState({ businessName: '', email: '', password: '' });
  const [genres, setGenres] = useState([]);
  const [genreInput, setGenreInput] = useState('');
  const [adminTab, setAdminTab] = useState('availability');
  const [fadeIn, setFadeIn] = useState(false);
  const [bookfairProgress, setBookfairProgress] = useState(68); // Simulated bookfair capacity
  const [isVendorAuthenticated, setIsVendorAuthenticated] = useState(false);
  const [registeredVendors, setRegisteredVendors] = useState([
    { email: 'vendor1@bookfair.com', password: 'vendor123', businessName: 'Demo Bookstore' }
  ]);
  // Store the uploaded Trade Hall floor plan image
  // Admin should upload the actual floor plan image, stall positions are pre-configured to match the layout
  const [stallMapImage, setStallMapImage] = useState(() => {
    const savedMap = localStorage.getItem('tradeHallMap');
    return savedMap || null;
  });
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [useMapView, setUseMapView] = useState(false);
  const [isPositioningMode, setIsPositioningMode] = useState(false);
  const [hoveredStall, setHoveredStall] = useState(null);
  const [showStallConfigModal, setShowStallConfigModal] = useState(false);
  const [stallConfig, setStallConfig] = useState({
    small: 15,
    medium: 20,
    large: 15,
    namingPattern: 'alphanumeric', // alphanumeric (A1, A2...) or numeric (1, 2, 3...)
    prefix: '' // optional prefix like 'STALL-', 'BOOTH-', etc.
  });

  // Save map image to localStorage whenever it changes
  useEffect(() => {
    if (stallMapImage) {
      localStorage.setItem('tradeHallMap', stallMapImage);
      console.log('🗺️ Map saved to localStorage');
    }
  }, [stallMapImage]);

  // Save stalls to localStorage whenever they change (positions or reservations)
  useEffect(() => {
    localStorage.setItem('tradeHallStalls', JSON.stringify(stalls));
    const positionedCount = stalls.filter(s => s.mapPosition && !s.isEmpty).length;
    console.log(`💾 Stalls saved to localStorage (${positionedCount} positioned)`);
  }, [stalls]);

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'tradeHallMap' && e.newValue) {
        console.log('🔄 Map updated from another tab');
        setStallMapImage(e.newValue);
      }
      if (e.key === 'tradeHallStalls' && e.newValue) {
        console.log('🔄 Stalls updated from another tab');
        setStalls(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Predefined admin credentials
  const adminCredentials = [
    { email: 'admin@bookfair.com', password: 'admin123', name: 'Admin User' },
    { email: 'employee@bookfair.com', password: 'employee123', name: 'Employee User' }
  ];

  useEffect(() => {
    setFadeIn(false);
    const timer = setTimeout(() => setFadeIn(true), 50);
    return () => clearTimeout(timer);
  }, [currentView]);

  const handleStallClick = (stall) => {
    if (stall.reserved) return;
    
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
          reserved: true,
          businessName: vendorInfo.businessName,
          email: vendorInfo.email
        };
      }
      return stall;
    });
    
    setStalls(updatedStalls);
    setShowConfirmModal(false);
    setCurrentView('vendor_home');
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
          businessName: null,
          email: null
        };
      }
      return stall;
    });
    
    setStalls(updatedStalls);
  };
  
  const handleVendorLogin = (email, password) => {
    // Accept any credentials for easy login during development
    if (email && password) {
      // Find existing vendor or create a temporary one
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
  
  const handleAdminLogin = (email, password) => {
    const admin = adminCredentials.find(a => a.email === email && a.password === password);
    if (admin) {
      setCurrentView('admin_dashboard');
      return true;
    }
    return false;
  };
  
  const handleVendorLogout = () => {
    setIsVendorAuthenticated(false);
    setVendorInfo({ businessName: '', email: '', password: '' });
    setSelectedStalls([]);
    setGenres([]);
    setCurrentView('landing');
  };
  
  const generateStallsFromConfig = () => {
    const { small, medium, large, namingPattern, prefix } = stallConfig;
    const totalStalls = small + medium + large;
    const newStalls = [];
    
    let stallNumber = 1;
    let columnNumber = 1;
    let rowLetter = 'A';
    
    // Helper function to generate ID
    const generateId = () => {
      let id;
      if (namingPattern === 'alphanumeric') {
        id = `${rowLetter}${columnNumber}`;
        columnNumber++;
        if (columnNumber > 10) {
          columnNumber = 1;
          rowLetter = String.fromCharCode(rowLetter.charCodeAt(0) + 1);
        }
      } else {
        id = `${stallNumber}`;
        stallNumber++;
      }
      return prefix ? `${prefix}${id}` : id;
    };
    
    // Generate small stalls
    for (let i = 0; i < small; i++) {
      newStalls.push({
        id: generateId(),
        size: 'Small',
        price: 100,
        reserved: false,
        businessName: null,
        email: null,
        mapPosition: null
      });
    }
    
    // Generate medium stalls
    for (let i = 0; i < medium; i++) {
      newStalls.push({
        id: generateId(),
        size: 'Medium',
        price: 150,
        reserved: false,
        businessName: null,
        email: null,
        mapPosition: null
      });
    }
    
    // Generate large stalls
    for (let i = 0; i < large; i++) {
      newStalls.push({
        id: generateId(),
        size: 'Large',
        price: 200,
        reserved: false,
        businessName: null,
        email: null,
        mapPosition: null
      });
    }
    
    // Update stalls and show confirmation
    setStalls(newStalls);
    const prefixText = prefix ? ` with prefix "${prefix}"` : '';
    alert(`✅ Generated ${totalStalls} stalls${prefixText}!\n\n${small} Small\n${medium} Medium\n${large} Large\n\nNext: Upload a map and position these stalls.`);
  };
  
  const deleteStall = (stallId) => {
    if (window.confirm(`Are you sure you want to delete stall ${stallId}?\n\nThis action cannot be undone.`)) {
      const updatedStalls = stalls.filter(stall => stall.id !== stallId);
      setStalls(updatedStalls);
      alert(`🗑️ Stall ${stallId} has been deleted successfully!`);
    }
  };
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStallMapImage(reader.result);
        setShowImageUploadModal(false);
        // Notify admin that map is now available to vendors
        setTimeout(() => {
          alert('✅ Trade Hall map uploaded successfully!\n\nNext steps:\n1. Click "Position Stalls" to place stall markers\n2. Click a stall ID, then click on the map\n3. Vendors will see your configured map with positioned stalls');
        }, 100);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleMapClick = (e) => {
    if (!stallMapImage) return;
    
    // Check if clicking on the image itself
    const isImage = e.target.tagName === 'IMG';
    if (!isImage && !isPositioningMode) return;
    
    const rect = isImage ? e.target.getBoundingClientRect() : e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    if (isPositioningMode) {
      // In positioning mode, assign position to hovered stall
      if (hoveredStall) {
        const updatedStalls = stalls.map(stall => 
          stall.id === hoveredStall 
            ? { ...stall, mapPosition: { x, y } }
            : stall
        );
        setStalls(updatedStalls);
        setHoveredStall(null);
        // Positions are automatically saved to localStorage via useEffect
      }
      return;
    }
    
    // Find nearest stall based on click position
    let nearestStall = null;
    let minDistance = 8; // 8% tolerance
    
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

  const reservations = stalls.filter(s => s.reserved && s.businessName);
  
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
  
  // Animated Stats Card
  const AnimatedStatCard = ({ icon: Icon, label, value, trend, color = 'blue' }) => {
    const colorMap = {
      blue: 'from-blue-500/20 to-cyan-600/20 border-blue-500/30',
      pink: 'from-pink-500/20 to-purple-600/20 border-pink-500/30',
      green: 'from-green-400/20 to-emerald-500/20 border-green-400/30',
      orange: 'from-orange-500/20 to-amber-600/20 border-orange-500/30'
    };
    
    return (
      <div className={`bg-gradient-to-br ${colorMap[color]} border backdrop-blur-sm p-6 rounded-2xl group hover:scale-105 transition-all duration-300`}>
        <div className="flex items-start justify-between mb-4">
          <div className={`bg-gradient-to-br ${color === 'blue' ? 'from-blue-500 to-cyan-600' : color === 'pink' ? 'from-pink-500 to-purple-600' : color === 'green' ? 'from-green-400 to-emerald-500' : 'from-orange-500 to-amber-600'} p-3 rounded-xl shadow-lg`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-green-400 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              {trend}
            </div>
          )}
        </div>
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        <div className="text-sm text-gray-300">{label}</div>
      </div>
    );
  };

  // Landing Page
  const LandingPage = () => (
    <div className={`min-h-screen bg-gradient-to-br from-[#1a1f37] via-[#2d1b4e] to-[#1a1f37] flex items-center justify-center p-8 transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'} relative overflow-hidden`}>
      {/* Animated Background Orbs */}
      <div className="background-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="orb orb-4"></div>
      </div>
      
      {/* Floating Particles */}
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
      
      {/* Floating Book Icons */}
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
        {/* Header Section with Stats */}
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
          
          {/* Quick Stats Bar */}
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
                  <div className="text-white font-bold">{reservations.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-1 gap-8">
          {/* Vendor Portal Card - Full Width */}
          <button
            onClick={() => setCurrentView('vendor_auth')}
            className="group relative bg-gradient-to-br from-[#2a2f4a]/80 to-[#1e2337]/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl hover:shadow-pink-500/30 transform hover:scale-105 transition-all duration-300 hover:border-pink-500/40 overflow-hidden"
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Book Page Effect */}
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
              
              {/* Feature Pills */}
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
              
              {/* Arrow indicator */}
              <div className="mt-4 text-pink-400 group-hover:translate-x-2 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </button>
        </div>
        
        {/* Bottom Info Banner */}
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

  // Admin Landing Page
  const AdminLandingPage = () => (
    <div className={`min-h-screen bg-gradient-to-br from-[#1a1f37] via-[#2d1b4e] to-[#1a1f37] flex items-center justify-center p-8 transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'} relative overflow-hidden`}>
      {/* Animated Background Orbs */}
      <div className="background-orbs">
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="orb orb-4"></div>
      </div>
      
      {/* Floating Book Icons */}
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
        {/* Header Section */}
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
        
        {/* Admin Portal Card */}
        <div className="grid md:grid-cols-1 gap-8">
          <button
            onClick={() => setCurrentView('admin_login')}
            className="group relative bg-gradient-to-br from-[#2a2f4a]/80 to-[#1e2337]/80 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-2xl hover:shadow-blue-500/30 transform hover:scale-105 transition-all duration-300 hover:border-blue-500/40 overflow-hidden"
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Book Stack Effect */}
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
              
              {/* Feature Pills */}
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
              
              {/* Arrow indicator */}
              <div className="mt-6 text-blue-400 group-hover:translate-x-2 transition-transform flex items-center gap-2">
                <span className="text-lg font-semibold">Access Dashboard</span>
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </button>
        </div>
        
        {/* Bottom Info Banner */}
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

  // Vendor Authentication (Login/Signup)
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
          setError('Invalid email or password');
        }
      } else {
        const result = handleVendorSignup(formData.businessName, formData.email, formData.password);
        if (!result.success) {
          setError(result.message);
        } else {
          setCurrentView('vendor_map');
        }
      }
    };

    return (
      <div className={`min-h-screen bg-gradient-to-br from-[#1a1f37] via-[#2d1b4e] to-[#1a1f37] flex items-center justify-center p-8 transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'} relative overflow-hidden`}>
        {/* Animated Background */}
        <div className="background-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
        
        {/* Floating Book Pages */}
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

  // Vendor Registration (Removed - integrated into VendorAuth)
  const VendorRegister = () => (
    <div className={`min-h-screen bg-gradient-to-br from-[#1a1f37] via-[#2d1b4e] to-[#1a1f37] flex items-center justify-center p-8 transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'} relative overflow-hidden`}>
      {/* Redirect to VendorAuth */}
      {setCurrentView('vendor_auth')}
    </div>
  );

  // Stall Map View
  const VendorMapView = () => (
    <div className={`min-h-screen bg-gradient-to-br from-[#1a1f37] via-[#2d1b4e] to-[#1a1f37] p-8 transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'} relative overflow-hidden`}>
      {/* Animated Background */}
      <div className="background-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-4"></div>
      </div>
      
      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <button
          onClick={() => { 
            if (isVendorAuthenticated) {
              setCurrentView('vendor_home'); 
            } else {
              setCurrentView('vendor_auth'); 
            }
            setSelectedStalls([]); 
          }}
          className="mb-4 text-pink-400 hover:text-pink-300 flex items-center gap-2 transition-colors group"
        >
          <Home className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Main Map Section - Takes 3 columns */}
          <div className="lg:col-span-3 bg-gradient-to-br from-[#2a2f4a]/80 to-[#1e2337]/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-3 rounded-xl shadow-lg shadow-pink-500/50 relative">
                  <Book className="w-6 h-6 text-white animate-page-flip" />
                  <Bookmark className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1 animate-bookmark-drop" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    Reserve Your Stalls
                    <Sparkles className="w-5 h-5 text-pink-400 animate-sparkle" />
                  </h2>
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <Feather className="w-3 h-3 text-purple-400" />
                    Select up to 3 exhibition spaces
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 px-4 py-2 rounded-xl border border-pink-500/30">
                <p className="text-sm text-gray-300">Selected: <span className="text-pink-400 font-bold text-lg">{selectedStalls.length}/3</span></p>
              </div>
            </div>
            
            {/* Vendor Info Badge */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg relative">
                  <BookOpen className="w-5 h-5 text-white" />
                  <Sparkles className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1 animate-sparkle" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <Feather className="w-3 h-3" />
                    Booking for
                  </div>
                  <div className="text-white font-semibold">{vendorInfo.businessName}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">Email</div>
                <div className="text-white text-sm">{vendorInfo.email}</div>
              </div>
            </div>
            
            {/* View Toggle and Legend */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setUseMapView(!useMapView)}
                  disabled={!stallMapImage && useMapView}
                  className={`bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-5 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-indigo-700 transition transform hover:scale-105 flex items-center gap-2 shadow-lg ${!stallMapImage && useMapView ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {useMapView ? <LayoutDashboard className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                  {useMapView ? 'Switch to Grid View' : 'Switch to Map View'}
                </button>
                {stallMapImage && useMapView && (
                  <div className="bg-green-500/20 border border-green-400/30 px-4 py-2 rounded-xl">
                    <span className="text-green-300 text-sm font-semibold">🗺️ Map View Active</span>
                  </div>
                )}
                {!useMapView && (
                  <div className="bg-blue-500/20 border border-blue-400/30 px-4 py-2 rounded-xl">
                    <span className="text-blue-300 text-sm font-semibold">📊 Grid View Active</span>
                  </div>
                )}
                {/* Debug Info */}
                <div className="bg-gray-500/10 border border-gray-400/20 px-3 py-1 rounded-lg">
                  <span className="text-gray-400 text-xs">
                    Map: {stallMapImage ? '✓' : '✗'} | Positioned: {stalls.filter(s => s.mapPosition && !s.isEmpty).length}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const savedMap = localStorage.getItem('tradeHallMap');
                    const savedStalls = localStorage.getItem('tradeHallStalls');
                    if (savedMap) setStallMapImage(savedMap);
                    if (savedStalls) setStalls(JSON.parse(savedStalls));
                    alert('🔄 Reloaded data from localStorage!');
                  }}
                  className="bg-cyan-500/20 border border-cyan-400/30 px-3 py-1 rounded-lg hover:bg-cyan-500/30 transition"
                  title="Reload map data"
                >
                  <span className="text-cyan-300 text-xs font-semibold">🔄 Sync</span>
                </button>
              </div>
            </div>

            {/* Interactive Map Banner */}
            {stallMapImage && useMapView && (
              <div className="mb-6 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-400/30 rounded-2xl p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-xl shadow-lg">
                      <MapPin className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-xl mb-1">📍 Interactive Trade Hall Map</h3>
                      <p className="text-gray-300 text-sm">
                        ✨ Click directly on any stall marker on the floor plan to select it
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <p className="text-blue-400 text-xs">
                          💾 {stalls.filter(s => s.mapPosition && !s.isEmpty).length} stalls positioned by admin
                        </p>
                        <span className="text-green-400 text-xs font-semibold">✓ Synced from admin</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{selectedStalls.length}</div>
                    <div className="text-xs text-gray-400">Selected</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* No Map Available Notice - Only when trying to use map view without uploaded map */}
            {!stallMapImage && useMapView && (
              <div className="mb-6 bg-orange-500/10 border border-orange-400/30 rounded-2xl p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-orange-500/20 p-3 rounded-xl">
                      <Info className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg mb-1">📍 Map View Not Available</h3>
                      <p className="text-gray-300 text-sm">
                        The admin hasn't uploaded the Trade Hall floor plan yet. Switch to Grid View to select stalls.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setUseMapView(false)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-700 transition flex items-center gap-2 shadow-lg"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Switch to Grid
                  </button>
                </div>
              </div>
            )}
            
            {/* Grid View Banner */}
            {!useMapView && (
              <div className="mb-6 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-400/30 rounded-2xl p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg">
                      <LayoutDashboard className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-xl mb-1">📊 Grid Layout View</h3>
                      <p className="text-gray-300 text-sm">
                        ✨ Click on any available stall card to select it
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{selectedStalls.length}</div>
                    <div className="text-xs text-gray-400">Selected</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Legend */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="flex items-center gap-2 bg-[#1a1f37]/50 rounded-xl p-3 border border-white/5">
                <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded shadow-lg shadow-green-500/30"></div>
                <span className="text-xs text-gray-300 font-medium">Available</span>
              </div>
              <div className="flex items-center gap-2 bg-[#1a1f37]/50 rounded-xl p-3 border border-white/5">
                <div className="w-6 h-6 bg-gradient-to-br from-gray-600 to-gray-700 rounded shadow-lg"></div>
                <span className="text-xs text-gray-300 font-medium">Reserved</span>
              </div>
              <div className="flex items-center gap-2 bg-[#1a1f37]/50 rounded-xl p-3 border border-white/5">
                <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-purple-600 rounded shadow-lg shadow-pink-500/50"></div>
                <span className="text-xs text-gray-300 font-medium">Selected</span>
              </div>
              <div className="flex items-center gap-2 bg-[#1a1f37]/50 rounded-xl p-3 border border-white/5">
                <div className="w-6 h-6 border-2 border-dashed border-gray-500 rounded"></div>
                <span className="text-xs text-gray-300 font-medium">Hallway</span>
              </div>
            </div>
            
            {/* Stall Grid or Map View */}
            {useMapView && stallMapImage ? (
              <div className="mb-6 bg-[#1a1f37]/50 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                {/* Map Header */}
                <div className="bg-gradient-to-r from-purple-600/40 to-blue-600/40 px-6 py-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-bold text-xl flex items-center gap-2">
                        <MapPin className="w-6 h-6 text-blue-400 animate-pulse" />
                        Trade Hall Floor Plan
                      </h3>
                      <p className="text-gray-300 text-sm mt-1">👆 Click on any green stall marker to select it</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/30"></div>
                        <span className="text-xs text-gray-300 font-medium">Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg shadow-pink-500/30"></div>
                        <span className="text-xs text-gray-300 font-medium">Selected</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-600 to-gray-700"></div>
                        <span className="text-xs text-gray-400 font-medium">Reserved</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Map Content */}
                <div className="p-6 bg-gradient-to-br from-[#1a1f37]/30 to-[#252b47]/30">
                  <div className="bg-black/30 rounded-xl p-2 mb-3">
                    <p className="text-xs text-center text-gray-400">
                      🖼️ Floor plan uploaded by admin • Click on circular stall markers to select
                    </p>
                  </div>
                <div className="relative group" onClick={handleMapClick}>
                  <img 
                    src={stallMapImage} 
                    alt="Stall Map" 
                    className="w-full h-auto rounded-xl shadow-2xl"
                    style={{ cursor: 'pointer' }}
                  />
                  
                  {/* Interactive overlay with stall markers */}
                  <div className="absolute inset-0 pointer-events-none">
                    {stalls.map((stall) => {
                      if (!stall.mapPosition || stall.isEmpty) return null;
                      const isSelected = selectedStalls.includes(stall.id);
                      const isReserved = stall.reserved;
                      
                      return (
                        <div
                          key={stall.id}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto group/stall"
                          style={{
                            left: `${stall.mapPosition.x}%`,
                            top: `${stall.mapPosition.y}%`
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isReserved) handleStallClick(stall);
                          }}
                        >
                          {/* Stall Marker */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                            isSelected
                              ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white ring-4 ring-pink-400/50 scale-125 shadow-lg shadow-pink-500/50 z-30'
                              : isReserved
                              ? 'bg-gradient-to-br from-gray-600 to-gray-700 text-gray-400 opacity-60 cursor-not-allowed z-10'
                              : 'bg-gradient-to-br from-green-400 to-emerald-500 text-white hover:scale-125 cursor-pointer hover:shadow-xl hover:shadow-green-500/50 hover:z-20 z-10'
                          }`}>
                            {stall.id}
                          </div>
                          
                          {/* Tooltip on hover */}
                          {!isReserved && (
                            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 opacity-0 group-hover/stall:opacity-100 transition-opacity pointer-events-none z-40">
                              <div className="bg-gradient-to-br from-[#2a2f4a] to-[#1e2337] border border-white/20 rounded-lg px-3 py-2 shadow-xl backdrop-blur-sm min-w-max">
                                <div className="text-xs font-bold text-white mb-1">{stall.id}</div>
                                <div className="text-[10px] text-gray-300 capitalize">Size: {stall.size}</div>
                                {isSelected && <div className="text-[10px] text-pink-400 font-semibold mt-1">✓ Selected</div>}
                              </div>
                              <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-[#2a2f4a] absolute left-1/2 -translate-x-1/2 -top-1"></div>
                            </div>
                          )}
                          
                          {/* Reserved Badge */}
                          {isReserved && (
                            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 opacity-0 group-hover/stall:opacity-100 transition-opacity pointer-events-none z-40">
                              <div className="bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 rounded-lg px-3 py-2 shadow-xl backdrop-blur-sm min-w-max">
                                <div className="text-xs font-bold text-gray-300 mb-1">{stall.id}</div>
                                <div className="text-[10px] text-gray-400">Reserved by:</div>
                                <div className="text-[10px] text-gray-300 font-semibold">{stall.businessName}</div>
                              </div>
                              <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-700 absolute left-1/2 -translate-x-1/2 -top-1"></div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-10 gap-2 mb-6 p-4 bg-[#1a1f37]/30 rounded-2xl">
                {stalls.map((stall, idx) => {
                  if (stall.isEmpty) {
                    return <div key={idx} className="aspect-square border-2 border-dashed border-gray-600 rounded-lg"></div>;
                  }
                  
                  const isSelected = selectedStalls.includes(stall.id);
                  const isReserved = stall.reserved;
                  
                  return (
                    <button
                      key={stall.id}
                      onClick={() => handleStallClick(stall)}
                      disabled={isReserved}
                      className={`aspect-square rounded-lg font-semibold text-sm flex flex-col items-center justify-center transition-all duration-200 relative group ${
                        isSelected
                          ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white ring-4 ring-pink-400/50 transform scale-105 shadow-lg shadow-pink-500/50'
                          : isReserved
                          ? 'bg-gradient-to-br from-gray-600 to-gray-700 text-gray-400 cursor-not-allowed opacity-50'
                          : 'bg-gradient-to-br from-green-400 to-emerald-500 text-white hover:scale-110 hover:shadow-xl hover:shadow-green-500/50 cursor-pointer hover:z-10'
                      }`}
                    >
                      <span className="text-xs font-bold">{stall.id}</span>
                      <span className="text-[10px] mt-0.5 opacity-75">{stall.size[0].toUpperCase()}</span>
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5">
                          <CheckCircle className="w-3 h-3 text-purple-900" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={selectedStalls.length === 0}
              className={`w-full py-4 rounded-xl font-semibold text-white transition-all transform hover:scale-105 flex items-center justify-center gap-2 ${
                selectedStalls.length > 0
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg shadow-pink-500/50'
                  : 'bg-gradient-to-r from-gray-600 to-gray-700 cursor-not-allowed opacity-50'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              Confirm Reservation ({selectedStalls.length} stall{selectedStalls.length !== 1 ? 's' : ''})
            </button>
          </div>
          
          {/* Sidebar Stats */}
          <div className="space-y-6">
            {/* Progress Circle */}
            <div className="bg-gradient-to-br from-[#2a2f4a]/80 to-[#1e2337]/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-6">
              <div className="text-center mb-4">
                <div className="text-sm text-gray-400 mb-2">Venue Capacity</div>
                <div className="flex justify-center">
                  <ProgressCircle percentage={Math.round((stats.reserved / stats.total) * 100)} color="pink" />
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="space-y-3">
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border border-blue-500/30 backdrop-blur-sm p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-blue-300 mb-1">Total Stalls</div>
                    <div className="text-2xl font-bold text-white">{stats.total}</div>
                  </div>
                  <Target className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-400/20 to-emerald-500/20 border border-green-400/30 backdrop-blur-sm p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-green-300 mb-1">Available</div>
                    <div className="text-2xl font-bold text-white">{stats.available}</div>
                  </div>
                  <Eye className="w-8 h-8 text-green-400" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 border border-pink-500/30 backdrop-blur-sm p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-pink-300 mb-1">Reserved</div>
                    <div className="text-2xl font-bold text-white">{stats.reserved}</div>
                  </div>
                  <Users className="w-8 h-8 text-pink-400" />
                </div>
              </div>
            </div>
            
            {/* Event Info */}
            <div className="bg-gradient-to-br from-orange-500/20 to-amber-600/20 border border-orange-500/30 backdrop-blur-sm p-4 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-orange-400" />
                <div className="text-sm font-semibold text-white">Event Timeline</div>
              </div>
              <div className="space-y-2 text-xs text-gray-300">
                <div className="flex justify-between">
                  <span>Opening</span>
                  <span className="text-orange-300 font-semibold">Dec 15</span>
                </div>
                <div className="flex justify-between">
                  <span>Closing</span>
                  <span className="text-orange-300 font-semibold">Dec 20</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration</span>
                  <span className="text-orange-300 font-semibold">6 Days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-gradient-to-br from-[#2a2f4a] to-[#1e2337] border border-white/10 rounded-3xl shadow-2xl max-w-md w-full p-8 transform animate-slideUp">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-2 rounded-xl shadow-lg shadow-pink-500/50">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Confirm Reservation</h3>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-400 hover:text-gray-200 transition hover:rotate-90 duration-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-300 mb-4">You are about to reserve the following stalls:</p>
              <div className="space-y-2">
                {selectedStalls.map((stallId, idx) => {
                  const stall = stalls.find(s => s.id === stallId);
                  return (
                    <div key={stallId} className="bg-gradient-to-r from-pink-500/20 to-purple-600/20 border border-pink-500/30 p-4 rounded-xl flex justify-between items-center group hover:scale-105 transition-transform">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-pink-500 to-purple-600 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-pink-500/30">
                          {idx + 1}
                        </div>
                        <div>
                          <span className="font-semibold text-white text-lg">{stallId}</span>
                          <div className="text-xs text-pink-300 capitalize">Size: {stall.size}</div>
                        </div>
                      </div>
                      <Star className="w-5 h-5 text-yellow-400" />
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-2">
                <div className="text-blue-400 mt-1">ℹ️</div>
                <div className="text-xs text-gray-300">
                  Your reservation will be confirmed immediately. You can manage your stalls and add literary genres on the next page.
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 border-2 border-gray-500 text-gray-300 rounded-xl font-semibold hover:bg-gray-700/30 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmReservation}
                className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition transform hover:scale-105 shadow-lg shadow-pink-500/50"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Vendor Home (Post-Confirmation)
  const VendorHome = () => (
    <div className={`min-h-screen bg-gradient-to-br from-[#1a1f37] via-[#2d1b4e] to-[#1a1f37] flex items-center justify-center p-8 transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'} relative overflow-hidden`}>
      {/* Animated Success Background */}
      <div className="background-orbs">
        <div className="orb orb-4"></div>
        <div className="orb orb-3"></div>
      </div>
      
      {/* Sparkle Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-green-400/60 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 5}s`,
              boxShadow: '0 0 10px rgba(74, 222, 128, 0.8)'
            }}
          ></div>
        ))}
      </div>
      
      <div className="max-w-2xl w-full relative z-10">
        <button
          onClick={handleVendorLogout}
          className="mb-4 text-green-400 hover:text-green-300 flex items-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
        
        <div className="bg-gradient-to-br from-[#2a2f4a]/80 to-[#1e2337]/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8 animate-book-open">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/50 relative">
              <BookMarked className="w-12 h-12 text-white animate-bookmark-drop" />
              <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-2 -right-2 animate-sparkle" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              <Book className="w-8 h-8 text-green-400 animate-floating-book" />
              Reservation Confirmed!
            </h2>
            <p className="text-gray-300 flex items-center justify-center gap-2">
              <Feather className="w-4 h-4 text-emerald-400" />
              Your stalls have been successfully reserved
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 border border-pink-500/30 p-6 rounded-2xl mb-8">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Library className="w-5 h-5 text-pink-400 animate-floating-book" />
              Your Reserved Stalls:
            </h3>
            <div className="space-y-2">
              {stalls.filter(s => s.businessName === vendorInfo.businessName).map(stall => (
                <div key={stall.id} className="flex items-center justify-between bg-gradient-to-r from-pink-500/10 to-purple-600/10 border border-pink-500/20 p-3 rounded-xl group hover:from-pink-500/20 hover:to-purple-600/20 transition-all">
                  <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg shadow-pink-500/30 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {stall.id}
                  </span>
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to cancel the reservation for stall ${stall.id}?`)) {
                        cancelReservation(stall.id);
                      }
                    }}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-red-500/30"
                  >
                    <Trash2 className="w-4 h-4" />
                    Cancel Booking
                  </button>
                </div>
              ))}
            </div>
            {stalls.filter(s => s.businessName === vendorInfo.businessName).length === 0 && (
              <div className="text-center py-8">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-page-flip" />
                <p className="text-gray-400 mb-4">You don't have any active reservations</p>
                <button
                  onClick={() => setCurrentView('vendor_map')}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-pink-500/30 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  Reserve New Stalls
                </button>
              </div>
            )}
          </div>
          
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Book className="w-6 h-6 text-green-400 animate-page-flip" />
              Add Literary Genres You Will Display
            </h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={genreInput}
                onChange={(e) => setGenreInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGenre())}
                className="flex-1 px-4 py-3 bg-[#1a1f37]/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500/50 transition text-white placeholder-gray-500"
                placeholder="e.g., Fiction, Science, History..."
              />
              <button
                onClick={addGenre}
                className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-500 hover:to-emerald-600 transition transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-green-500/30"
              >
                <BookMarked className="w-5 h-5" />
                Add
              </button>
            </div>
            
            {genres.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Library className="w-4 h-4 text-green-400" />
                  Your Genres:
                </p>
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre, idx) => (
                    <span key={idx} className="bg-gradient-to-r from-green-400/20 to-emerald-500/20 border border-green-400/30 text-green-300 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Bookmark className="w-3 h-3" />
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Admin Login
  const AdminLogin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      setError('');
      
      const success = handleAdminLogin(formData.email, formData.password);
      if (!success) {
        setError('Invalid email or password. Please check your credentials.');
      }
    };

    return (
      <div className={`min-h-screen bg-gradient-to-br from-[#1a1f37] via-[#2d1b4e] to-[#1a1f37] flex items-center justify-center p-8 transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'} relative overflow-hidden`}>
      {/* Animated Background */}
      <div className="background-orbs">
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>
      
      {/* Hexagon Pattern Overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 0l12.5 7.2v14.4L25 28.9 12.5 21.6V7.2L25 0z' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      {/* Floating Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute border-2 border-blue-400/20 rounded-full animate-float-slow"
            style={{
              width: `${100 + Math.random() * 200}px`,
              height: `${100 + Math.random() * 200}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${15 + Math.random() * 15}s`
            }}
          ></div>
        ))}
      </div>
      
        <div className="max-w-md w-full relative z-10">
          <button
            onClick={() => {
              if (isAdminRoute) {
                window.location.href = '/';
              } else {
                setCurrentView('landing');
              }
            }}
            className="mb-4 text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-colors group"
          >
            <Home className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {isAdminRoute ? 'Go to Vendor Portal' : 'Back to Home'}
          </button>        <div className="bg-gradient-to-br from-[#2a2f4a]/80 to-[#1e2337]/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8 animate-book-open">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/50 relative">
              <GraduationCap className="w-8 h-8 text-white" />
              <Library className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1 animate-floating-book" />
            </div>
            <h2 className="text-3xl font-bold text-white">Employee Login</h2>
            <p className="text-gray-300 mt-2 flex items-center justify-center gap-2">
              <BookMarked className="w-4 h-4 text-blue-400" />
              Access the admin dashboard
            </p>
          </div>
          
          {error && (
            <div className="mb-4 bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <X className="w-4 h-4" />
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
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
          
          <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <p className="text-xs text-gray-300 text-center mb-2 font-semibold">Demo Credentials:</p>
            <div className="space-y-1 text-xs text-gray-400">
              <p className="text-center">admin@bookfair.com / admin123</p>
              <p className="text-center">employee@bookfair.com / employee123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

  // Admin Dashboard
  const AdminDashboard = () => (
    <div className={`min-h-screen bg-gradient-to-br from-[#1a1f37] via-[#2d1b4e] to-[#1a1f37] p-8 transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'} relative overflow-hidden`}>
      {/* Animated Dashboard Background */}
      <div className="background-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="orb orb-4"></div>
      </div>
      
      {/* Tech Grid Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 2px, transparent 2px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 2px, transparent 2px)`,
          backgroundSize: '100px 100px'
        }}></div>
      </div>
      
      {/* Animated Corner Accents */}
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
                <BookMarked className="w-6 h-6 text-blue-400 animate-bookmark-drop" />
              </h2>
              <p className="text-sm text-gray-400 flex items-center gap-1">
                <Feather className="w-3 h-3 text-cyan-400" />
                Manage and monitor bookfair reservations
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('landing')}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-pink-600 hover:to-purple-700 transition flex items-center gap-2 shadow-lg shadow-pink-500/30 transform hover:scale-105"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
        
        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <AnimatedStatCard 
            icon={Target} 
            label="Total Stalls" 
            value={stats.total} 
            trend="+5%"
            color="blue"
          />
          <AnimatedStatCard 
            icon={Eye} 
            label="Available" 
            value={stats.available} 
            color="green"
          />
          <AnimatedStatCard 
            icon={CheckCircle} 
            label="Reserved" 
            value={stats.reserved} 
            trend="+12%"
            color="pink"
          />
          <AnimatedStatCard 
            icon={Users} 
            label="Vendors" 
            value={reservations.length} 
            trend="+8%"
            color="orange"
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area - 3 columns */}
          <div className="lg:col-span-3 bg-gradient-to-br from-[#2a2f4a]/80 to-[#1e2337]/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-white/10">
              <button
                onClick={() => setAdminTab('availability')}
                className={`px-6 py-3 font-semibold transition-all rounded-t-xl relative ${
                  adminTab === 'availability'
                    ? 'text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Stall Availability
                </div>
                {adminTab === 'availability' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"></div>
                )}
              </button>
              <button
                onClick={() => setAdminTab('reservations')}
                className={`px-6 py-3 font-semibold transition-all rounded-t-xl relative ${
                  adminTab === 'reservations'
                    ? 'text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  All Reservations
                </div>
                {adminTab === 'reservations' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"></div>
                )}
              </button>
              <button
                onClick={() => setAdminTab('stallconfig')}
                className={`px-6 py-3 font-semibold transition-all rounded-t-xl relative ${
                  adminTab === 'stallconfig'
                    ? 'text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Stall Configuration
                </div>
                {adminTab === 'stallconfig' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"></div>
                )}
              </button>
              <button
                onClick={() => setAdminTab('mapupload')}
                className={`px-6 py-3 font-semibold transition-all rounded-t-xl relative ${
                  adminTab === 'mapupload'
                    ? 'text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Map Management
                </div>
                {adminTab === 'mapupload' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"></div>
                )}
              </button>
            </div>
            
            {adminTab === 'availability' && (
              <div>
                {/* Map Legend */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="flex items-center gap-2 bg-[#1a1f37]/50 rounded-xl p-3 border border-white/5">
                    <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded shadow-lg shadow-green-500/30"></div>
                    <span className="text-xs text-gray-300 font-medium">Available</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#1a1f37]/50 rounded-xl p-3 border border-white/5">
                    <div className="w-6 h-6 bg-gradient-to-br from-gray-600 to-gray-700 rounded shadow-lg"></div>
                    <span className="text-xs text-gray-300 font-medium">Reserved</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#1a1f37]/50 rounded-xl p-3 border border-white/5">
                    <div className="w-6 h-6 border-2 border-dashed border-gray-500 rounded"></div>
                    <span className="text-xs text-gray-300 font-medium">Hallway</span>
                  </div>
                </div>
                
                {/* Stall Grid */}
                <div className="grid grid-cols-10 gap-2 p-4 bg-[#1a1f37]/30 rounded-2xl">
                  {stalls.map((stall, idx) => {
                    if (stall.isEmpty) {
                      return <div key={idx} className="aspect-square border-2 border-dashed border-gray-600 rounded-lg"></div>;
                    }
                    
                    return (
                      <div
                        key={stall.id}
                        className={`aspect-square rounded-lg font-semibold text-sm flex flex-col items-center justify-center shadow-lg transition-all hover:scale-110 relative group ${
                          stall.reserved
                            ? 'bg-gradient-to-br from-gray-600 to-gray-700 text-gray-300'
                            : 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-green-500/30'
                        }`}
                      >
                        <span className="text-xs font-bold">{stall.id}</span>
                        <span className="text-[10px] mt-0.5 opacity-75">{stall.size[0].toUpperCase()}</span>
                        <button
                          onClick={() => deleteStall(stall.id)}
                          className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          title="Delete stall"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {adminTab === 'reservations' && (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-pink-500/10 to-purple-600/10 border-b border-white/10">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                            Stall ID
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Size</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Business Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {reservations.map((stall, idx) => (
                        <tr key={stall.id} className="hover:bg-white/5 transition group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-lg shadow-pink-500/30">
                                {idx + 1}
                              </div>
                              <span className="text-sm font-medium text-white">{stall.id}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-blue-500/20 border border-blue-500/30 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold capitalize">
                              {stall.size}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-white font-medium">{stall.businessName}</td>
                          <td className="px-6 py-4 text-sm text-gray-300">{stall.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {reservations.length === 0 && (
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
            
            {adminTab === 'stallconfig' && (
              <div>
                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-indigo-500/20 rounded-2xl p-8 mb-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">Configure Stalls</h3>
                      <p className="text-gray-300 text-sm">Set the number of stalls by size and choose naming pattern. This will generate all stalls for the event.</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    {/* Small Stalls */}
                    <div className="bg-[#1a1f37]/50 rounded-xl p-5 border border-white/10">
                      <label className="block text-sm font-semibold text-gray-300 mb-3">Small Stalls</label>
                      <input
                        type="number"
                        min="0"
                        value={stallConfig.small}
                        onChange={(e) => setStallConfig({...stallConfig, small: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-3 bg-[#0d1229] border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500 transition"
                      />
                      <p className="text-xs text-gray-400 mt-2">Compact spaces for small vendors</p>
                    </div>
                    
                    {/* Medium Stalls */}
                    <div className="bg-[#1a1f37]/50 rounded-xl p-5 border border-white/10">
                      <label className="block text-sm font-semibold text-gray-300 mb-3">Medium Stalls</label>
                      <input
                        type="number"
                        min="0"
                        value={stallConfig.medium}
                        onChange={(e) => setStallConfig({...stallConfig, medium: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-3 bg-[#0d1229] border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                      />
                      <p className="text-xs text-gray-400 mt-2">Standard size stalls</p>
                    </div>
                    
                    {/* Large Stalls */}
                    <div className="bg-[#1a1f37]/50 rounded-xl p-5 border border-white/10">
                      <label className="block text-sm font-semibold text-gray-300 mb-3">Large Stalls</label>
                      <input
                        type="number"
                        min="0"
                        value={stallConfig.large}
                        onChange={(e) => setStallConfig({...stallConfig, large: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-3 bg-[#0d1229] border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition"
                      />
                      <p className="text-xs text-gray-400 mt-2">Premium large spaces</p>
                    </div>
                  </div>
                  
                  {/* Stall Name Prefix */}
                  <div className="bg-[#1a1f37]/50 rounded-xl p-5 border border-white/10 mb-6">
                    <label className="block text-sm font-semibold text-gray-300 mb-3">Stall Name Prefix (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., STALL-, BOOTH-, etc."
                      value={stallConfig.prefix}
                      onChange={(e) => setStallConfig({...stallConfig, prefix: e.target.value})}
                      className="w-full px-4 py-3 bg-[#0d1229] border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition placeholder-gray-500"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      Leave empty for no prefix, or add text like "STALL-" to create names like STALL-A1, STALL-A2...
                    </p>
                  </div>
                  
                  {/* Naming Pattern */}
                  <div className="bg-[#1a1f37]/50 rounded-xl p-5 border border-white/10 mb-6">
                    <label className="block text-sm font-semibold text-gray-300 mb-3">Stall Naming Pattern</label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setStallConfig({...stallConfig, namingPattern: 'alphanumeric'})}
                        className={`flex-1 px-6 py-4 rounded-xl font-semibold transition ${
                          stallConfig.namingPattern === 'alphanumeric'
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                            : 'bg-[#0d1229] text-gray-400 border border-white/10 hover:border-blue-500/50'
                        }`}
                      >
                        <div className="text-lg mb-1">{stallConfig.prefix || ''}A1, A2, B1, B2...</div>
                        <div className="text-xs opacity-75">Alphanumeric (Rows & Columns)</div>
                      </button>
                      <button
                        onClick={() => setStallConfig({...stallConfig, namingPattern: 'numeric'})}
                        className={`flex-1 px-6 py-4 rounded-xl font-semibold transition ${
                          stallConfig.namingPattern === 'numeric'
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                            : 'bg-[#0d1229] text-gray-400 border border-white/10 hover:border-blue-500/50'
                        }`}
                      >
                        <div className="text-lg mb-1">{stallConfig.prefix || ''}1, 2, 3, 4...</div>
                        <div className="text-xs opacity-75">Simple Numeric</div>
                      </button>
                    </div>
                  </div>
                  
                  {/* Summary */}
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-5 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-bold text-lg mb-1">Total Stalls: {stallConfig.small + stallConfig.medium + stallConfig.large}</p>
                        <p className="text-gray-300 text-sm">
                          {stallConfig.small} Small • {stallConfig.medium} Medium • {stallConfig.large} Large
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-400 text-sm font-semibold">Naming: {stallConfig.namingPattern === 'alphanumeric' ? 'A1, A2...' : '1, 2, 3...'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={generateStallsFromConfig}
                    className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-600 hover:to-purple-700 transition transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Generate Stalls
                  </button>
                  
                  <p className="text-xs text-gray-400 text-center mt-4">
                    ⚠️ This will replace existing stall configuration. Make sure to position stalls on the map after generation.
                  </p>
                </div>
              </div>
            )}
            
            {adminTab === 'mapupload' && (
              <div>
                <div className="bg-gradient-to-br from-purple-500/10 to-indigo-600/10 border border-purple-500/20 rounded-2xl p-8 mb-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-xl">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">Upload Trade Hall Floor Plan</h3>
                      <p className="text-gray-300 text-sm">Upload the Trade Hall floor plan image. Stall positions (A1-E10) are pre-configured to match the layout. Vendors will see clickable markers on each stall location.</p>
                      <div className="mt-2 bg-blue-500/10 border border-blue-400/20 rounded-lg p-3">
                        <p className="text-blue-300 text-xs">💡 Tip: The system already knows where stalls A1-A10, B1-B10, C1-C10, D1-D10, and E1-E10 are located on the map.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="block">
                      <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-8 text-center hover:border-purple-500/50 transition cursor-pointer bg-[#1a1f37]/30">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="map-upload"
                        />
                        <label htmlFor="map-upload" className="cursor-pointer">
                          <div className="flex flex-col items-center gap-3">
                            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-4 rounded-full">
                              <Building className="w-8 h-8 text-white" />
                            </div>
                            <div>
                              <p className="text-white font-semibold mb-1">Click to upload map image</p>
                              <p className="text-gray-400 text-sm">PNG, JPG, or SVG (Max 10MB)</p>
                            </div>
                          </div>
                        </label>
                      </div>
                    </label>
                    
                    {stallMapImage && (
                      <div className="bg-[#1a1f37]/50 rounded-xl p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-white font-semibold">Map Uploaded Successfully</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="bg-green-500/20 px-3 py-1 rounded-full">
                              <span className="text-green-300 text-xs font-semibold">💾 Saved to localStorage</span>
                            </div>
                            <button
                              onClick={() => setIsPositioningMode(!isPositioningMode)}
                              className={`px-4 py-2 rounded-lg font-semibold text-sm transition flex items-center gap-2 ${
                                isPositioningMode
                                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30'
                                  : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700'
                              }`}
                            >
                              <MapPin className="w-4 h-4" />
                              {isPositioningMode ? 'Exit Positioning' : 'Position Stalls'}
                            </button>
                            <button
                              onClick={() => setStallMapImage(null)}
                              className="text-red-400 hover:text-red-300 transition"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        
                        {isPositioningMode && (
                          <div className="bg-orange-500/20 border border-orange-500/40 rounded-lg p-3 mb-4">
                            <div className="flex items-start gap-2">
                              <MapPin className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm text-white font-semibold mb-1">Positioning Mode Active</p>
                                <p className="text-xs text-gray-300 mb-2">Click on a stall below, then click on the map where it should appear. Positions are automatically saved for vendors to see.</p>
                              </div>
                            </div>
                            
                            {/* Stall selector */}
                            <div className="mt-3 grid grid-cols-10 gap-2">
                              {stalls.filter(s => !s.isEmpty).map(stall => (
                                <button
                                  key={stall.id}
                                  onClick={() => setHoveredStall(stall.id)}
                                  className={`px-2 py-1 rounded text-xs font-bold transition ${
                                    hoveredStall === stall.id
                                      ? 'bg-orange-500 text-white ring-2 ring-orange-400'
                                      : 'bg-[#2a2f4a] text-gray-300 hover:bg-[#3a3f5a]'
                                  }`}
                                >
                                  {stall.id}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="relative" onClick={handleMapClick}>
                          <img 
                            src={stallMapImage} 
                            alt="Stall Map Preview" 
                            className="w-full h-auto rounded-lg" 
                            style={{ cursor: isPositioningMode ? 'crosshair' : 'default' }}
                          />
                          
                          {/* Show all positioned stalls */}
                          {stalls.map((stall) => {
                            if (!stall.mapPosition || stall.isEmpty) return null;
                            const isActive = hoveredStall === stall.id;
                            
                            return (
                              <div
                                key={stall.id}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                style={{
                                  left: `${stall.mapPosition.x}%`,
                                  top: `${stall.mapPosition.y}%`
                                }}
                              >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                  isActive
                                    ? 'bg-orange-500 text-white ring-4 ring-orange-400/50 scale-125'
                                    : 'bg-blue-500 text-white opacity-70'
                                }`}>
                                  {stall.id}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-xs text-gray-400">Vendors can now select stalls by clicking on this map</p>
                          <div className="flex items-center gap-4">
                            <p className="text-xs text-green-400 font-semibold">{stalls.filter(s => s.mapPosition && !s.isEmpty).length} stalls positioned</p>
                            <p className="text-xs text-blue-400 font-semibold">✓ Visible to all vendors</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-blue-400 mt-1">ℹ️</div>
                    <div className="text-sm text-gray-300">
                      <p className="font-semibold text-white mb-1">How it works:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Upload a clear floor plan or map showing all stall locations</li>
                        <li>Vendors will see a toggle to switch between Grid View and Map View</li>
                        <li>They can click directly on stalls in the map to select them</li>
                        <li>Selected stalls will be highlighted in pink, reserved in gray, and available in green</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Capacity Progress */}
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
            
            {/* Size Distribution */}
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
            
            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-[#2a2f4a]/80 to-[#1e2337]/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-6">
              <div className="text-sm text-gray-400 mb-4">Quick Actions</div>
              <div className="space-y-2">
                <button className="w-full bg-gradient-to-r from-blue-500/20 to-cyan-600/20 border border-blue-500/30 text-blue-300 px-4 py-3 rounded-xl hover:from-blue-500/30 hover:to-cyan-600/30 transition text-sm font-semibold flex items-center justify-between group">
                  <span>Export Report</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button className="w-full bg-gradient-to-r from-pink-500/20 to-purple-600/20 border border-pink-500/30 text-pink-300 px-4 py-3 rounded-xl hover:from-pink-500/30 hover:to-purple-600/30 transition text-sm font-semibold flex items-center justify-between group">
                  <span>Send Notifications</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="font-['Inter',sans-serif] antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(5deg);
          }
          66% {
            transform: translateY(10px) rotate(-5deg);
          }
        }
        
        @keyframes floatSlow {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          50% {
            transform: translate(30px, -30px) rotate(180deg);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes moveInCircle {
          0% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(180deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        @keyframes pageFlip {
          0%, 100% {
            transform: rotateY(0deg);
          }
          50% {
            transform: rotateY(180deg);
          }
        }
        
        @keyframes bookOpen {
          0% {
            transform: scaleX(0) rotateY(-90deg);
            opacity: 0;
          }
          50% {
            transform: scaleX(0.5) rotateY(-45deg);
            opacity: 0.5;
          }
          100% {
            transform: scaleX(1) rotateY(0deg);
            opacity: 1;
          }
        }
        
        @keyframes bookClose {
          0% {
            transform: scaleX(1) rotateY(0deg);
          }
          100% {
            transform: scaleX(0) rotateY(90deg);
          }
        }
        
        @keyframes readingProgress {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        @keyframes bookmarkDrop {
          0%, 100% {
            transform: translateY(-10px);
            opacity: 0.6;
          }
          50% {
            transform: translateY(0px);
            opacity: 1;
          }
        }
        
        @keyframes floatingBook {
          0%, 100% {
            transform: translateY(0px) rotateZ(-5deg);
          }
          50% {
            transform: translateY(-20px) rotateZ(5deg);
          }
        }
        
        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1) rotate(180deg);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradientShift 8s ease infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: floatSlow 20s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse 4s ease-in-out infinite;
        }
        
        .animate-rotate {
          animation: rotate 30s linear infinite;
        }
        
        .animate-page-flip {
          animation: pageFlip 3s ease-in-out infinite;
        }
        
        .animate-book-open {
          animation: bookOpen 0.6s ease-out forwards;
        }
        
        .animate-floating-book {
          animation: floatingBook 4s ease-in-out infinite;
        }
        
        .animate-bookmark-drop {
          animation: bookmarkDrop 2s ease-in-out infinite;
        }
        
        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }
        
        .background-orbs {
          position: fixed;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }
        
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.5;
          animation: floatSlow 20s ease-in-out infinite;
        }
        
        .orb-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, rgba(139, 92, 246, 0.2) 50%, transparent 100%);
          top: -10%;
          left: -10%;
          animation-delay: 0s;
        }
        
        .orb-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(6, 182, 212, 0.2) 50%, transparent 100%);
          top: 50%;
          right: -5%;
          animation-delay: -5s;
        }
        
        .orb-3 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(236, 72, 153, 0.15) 50%, transparent 100%);
          bottom: -15%;
          left: 30%;
          animation-delay: -10s;
        }
        
        .orb-4 {
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(132, 204, 22, 0.15) 50%, transparent 100%);
          top: 20%;
          left: 50%;
          animation-delay: -15s;
        }
      `}</style>
      
      {currentView === 'landing' && <LandingPage />}
      {currentView === 'admin_landing' && <AdminLandingPage />}
      {currentView === 'vendor_auth' && <VendorAuth />}
      {currentView === 'vendor_register' && <VendorRegister />}
      {currentView === 'vendor_map' && <VendorMapView />}
      {currentView === 'vendor_home' && <VendorHome />}
      {currentView === 'admin_login' && <AdminLogin />}
      {currentView === 'admin_dashboard' && <AdminDashboard />}
    </div>
  );
};

export default App;
