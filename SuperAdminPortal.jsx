import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle, Building, Mail, Lock, Plus, LogOut, Home, Users, Target, Award, Trash2, FileText, X, Sparkles } from 'lucide-react';

const SuperAdminPortal = () => {
  const [currentView, setCurrentView] = useState('superadmin_landing');
  const [stalls, setStalls] = useState(() => {
    const savedStalls = localStorage.getItem('tradeHallStalls');
    return savedStalls ? JSON.parse(savedStalls) : [];
  });
  const [superAdminTab, setSuperAdminTab] = useState('admins');
  const [fadeIn, setFadeIn] = useState(false);
  const [adminList, setAdminList] = useState(() => {
    const savedAdmins = localStorage.getItem('bookfairAdmins');
    return savedAdmins ? JSON.parse(savedAdmins) : [
      { id: 1, email: 'admin@bookfair.com', password: 'admin123', name: 'Admin User', role: 'admin' },
      { id: 2, email: 'employee@bookfair.com', password: 'employee123', name: 'Employee User', role: 'admin' }
    ];
  });
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showEditAdminModal, setShowEditAdminModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [newAdminData, setNewAdminData] = useState({ name: '', email: '', password: '' });
  const [stallMapImage, setStallMapImage] = useState(() => {
    const savedMap = localStorage.getItem('tradeHallMap');
    return savedMap || null;
  });
  const [isPositioningMode, setIsPositioningMode] = useState(false);
  const [hoveredStall, setHoveredStall] = useState(null);
  const [stallConfig, setStallConfig] = useState({
    small: 15,
    medium: 20,
    large: 15,
    namingPattern: 'alphanumeric',
    prefix: ''
  });

  // Save admin list to localStorage
  useEffect(() => {
    localStorage.setItem('bookfairAdmins', JSON.stringify(adminList));
  }, [adminList]);

  // Save map image to localStorage
  useEffect(() => {
    if (stallMapImage) {
      localStorage.setItem('tradeHallMap', stallMapImage);
    }
  }, [stallMapImage]);

  // Save stalls to localStorage
  useEffect(() => {
    localStorage.setItem('tradeHallStalls', JSON.stringify(stalls));
  }, [stalls]);

  // Listen for storage changes
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

  // Admin management functions
  const addAdmin = (adminData) => {
    const newAdmin = {
      id: Date.now(),
      ...adminData,
      role: 'admin'
    };
    setAdminList([...adminList, newAdmin]);
    alert(`✅ Admin ${adminData.name} added successfully!`);
  };

  const editAdmin = (adminId, updatedData) => {
    const updatedAdmins = adminList.map(admin => {
      if (admin.id === adminId) {
        const updated = { ...admin, name: updatedData.name, email: updatedData.email };
        if (updatedData.password) {
          updated.password = updatedData.password;
        }
        return updated;
      }
      return admin;
    });
    setAdminList(updatedAdmins);
    alert(`✅ Admin updated successfully!`);
  };

  const deleteAdmin = (adminId) => {
    if (window.confirm('Are you sure you want to delete this admin?\n\nThis action cannot be undone.')) {
      const updatedAdmins = adminList.filter(admin => admin.id !== adminId);
      setAdminList(updatedAdmins);
      alert(`🗑️ Admin deleted successfully!`);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStallMapImage(reader.result);
        setTimeout(() => {
          alert('✅ Trade Hall map uploaded successfully!\n\nNext steps:\n1. Click "Position Stalls" to place stall markers\n2. Click a stall ID, then click on the map\n3. Vendors will see your configured map with positioned stalls');
        }, 100);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMapClick = (e) => {
    if (!stallMapImage || !isPositioningMode) return;
    
    const isImage = e.target.tagName === 'IMG';
    if (!isImage) return;
    
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    if (hoveredStall) {
      const updatedStalls = stalls.map(stall => 
        stall.id === hoveredStall 
          ? { ...stall, mapPosition: { x, y } }
          : stall
      );
      setStalls(updatedStalls);
      setHoveredStall(null);
    }
  };

  const generateStallsFromConfig = () => {
    const { small, medium, large, namingPattern, prefix } = stallConfig;
    const totalStalls = small + medium + large;
    
    if (totalStalls === 0) {
      alert('⚠️ Please configure at least one stall.');
      return;
    }
    
    if (stalls.length > 0 && stalls.some(s => s.reserved)) {
      if (!window.confirm('⚠️ Warning: Some stalls are already reserved.\n\nGenerating new stalls will RESET ALL bookings.\n\nAre you sure you want to continue?')) {
        return;
      }
    }
    const newStalls = [];
    
    let stallNumber = 1;
    let columnNumber = 1;
    let rowLetter = 'A';
    
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
    
    setStalls(newStalls);
    const prefixText = prefix ? ` with prefix "${prefix}"` : '';
    alert(`✅ Generated ${totalStalls} stalls${prefixText}!\n\n${small} Small\n${medium} Medium\n${large} Large\n\nNext: Upload a map and position these stalls.`);
  };

  const handleAddAdmin = () => {
    if (!newAdminData.name || !newAdminData.email || !newAdminData.password) {
      alert('⚠️ Please fill in all fields.');
      return;
    }
    if (adminList.some(admin => admin.email === newAdminData.email)) {
      alert('⚠️ An admin with this email already exists.');
      return;
    }
    addAdmin(newAdminData);
    setNewAdminData({ name: '', email: '', password: '' });
    setShowAddAdminModal(false);
  };

  const handleEditAdmin = () => {
    if (!newAdminData.name || !newAdminData.email) {
      alert('⚠️ Name and email are required.');
      return;
    }
    const emailExists = adminList.some(admin => 
      admin.email === newAdminData.email && admin.id !== editingAdmin.id
    );
    if (emailExists) {
      alert('⚠️ An admin with this email already exists.');
      return;
    }
    editAdmin(editingAdmin.id, newAdminData);
    setEditingAdmin(null);
    setNewAdminData({ name: '', email: '', password: '' });
    setShowEditAdminModal(false);
  };

  const openEditModal = (admin) => {
    setEditingAdmin(admin);
    setNewAdminData({ name: admin.name, email: admin.email, password: '' });
    setShowEditAdminModal(true);
  };

  // Super Admin Landing Page
  const SuperAdminLandingPage = () => (
    <div className={`min-h-screen bg-gradient-to-br from-[#1a1f37] via-[#4a1b2d] to-[#1a1f37] flex items-center justify-center p-8 transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'} relative overflow-hidden`}>
      <div className="background-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-3"></div>
      </div>
      
      <div className="max-w-4xl w-full relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-600/20 border border-purple-500/30 px-4 py-2 rounded-full mb-6">
            <Award className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-semibold">Super Admin Access</span>
          </div>
          <h1 className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent flex items-center justify-center gap-4">
            <Target className="w-16 h-16 text-purple-400" />
            Super Admin Portal
          </h1>
          <p className="text-xl text-gray-300 mb-8">Master Control & Admin Management</p>
        </div>
        
        <button
          onClick={() => setCurrentView('superadmin_login')}
          className="group relative bg-gradient-to-br from-[#2a2f4a]/80 to-[#1e2337]/80 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-2xl hover:shadow-purple-500/30 transform hover:scale-105 transition-all duration-300 hover:border-purple-500/40 w-full"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-purple-500 to-pink-600 p-8 rounded-full group-hover:scale-110 transition-transform shadow-lg">
                <Award className="w-16 h-16 text-white" />
              </div>
            </div>
            
            <div>
              <h2 className="text-4xl font-bold text-white mb-3">Super Admin Login</h2>
              <p className="text-gray-300 text-center mb-6 text-lg">Full system control & admin management</p>
            </div>
            
            <div className="flex flex-wrap gap-3 justify-center">
              <span className="bg-purple-500/20 border border-purple-500/30 text-purple-300 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                <Users className="w-4 h-4" />
                Manage Admins
              </span>
              <span className="bg-pink-500/20 border border-pink-500/30 text-pink-300 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                <Building className="w-4 h-4" />
                Full Dashboard Access
              </span>
            </div>
            
            <div className="mt-6 text-purple-400 group-hover:translate-x-2 transition-transform flex items-center gap-2">
              <span className="text-lg font-semibold">Access Super Admin</span>
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => window.location.href = '/'}
          className="mt-6 text-purple-400 hover:text-purple-300 flex items-center gap-2 transition-colors mx-auto"
        >
          <Home className="w-4 h-4" /> Go to Vendor Portal
        </button>
      </div>
    </div>
  );

  // Super Admin Login
  const SuperAdminLogin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      setError('');
      
      if (formData.email && formData.password) {
        setCurrentView('superadmin_dashboard');
      } else {
        setError('Please enter email and password.');
      }
    };

    return (
      <div className={`min-h-screen bg-gradient-to-br from-[#1a1f37] via-[#4a1b2d] to-[#1a1f37] flex items-center justify-center p-8 transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'} relative overflow-hidden`}>
        <div className="background-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-3"></div>
        </div>
        
        <div className="max-w-md w-full relative z-10">
          <button
            onClick={() => setCurrentView('superadmin_landing')}
            className="mb-4 text-purple-400 hover:text-purple-300 flex items-center gap-2 transition-colors group"
          >
            <Home className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
          </button>
          
          <div className="bg-gradient-to-br from-[#2a2f4a]/80 to-[#1e2337]/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Super Admin Login</h2>
              <p className="text-gray-300 mt-2">Master control access</p>
            </div>
            
            {error && (
              <div className="mb-4 bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <X className="w-4 h-4" />
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-[#0d1229] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-[#0d1229] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold hover:from-purple-600 hover:to-pink-700 transition transform hover:scale-105 shadow-lg shadow-purple-500/50 flex items-center justify-center gap-2"
              >
                <Award className="w-5 h-5" />
                Access Super Admin
              </button>
            </form>
            
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-gray-300 text-center mb-2 font-semibold">Demo Credentials:</p>
              <p className="text-xs text-gray-400 text-center">superadmin@bookfair.com / super123</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Super Admin Dashboard
  const SuperAdminDashboard = () => {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-[#1a1f37] via-[#4a1b2d] to-[#1a1f37] p-8 transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'} relative overflow-hidden`}>
        <div className="background-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl shadow-lg relative">
                <Award className="w-8 h-8 text-white" />
                <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1 animate-sparkle" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Super Admin Dashboard</h2>
                <p className="text-gray-300 text-sm">Master control panel</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (window.location.pathname.startsWith('/adminx')) {
                  window.location.href = '/';
                } else {
                  setCurrentView('superadmin_landing');
                }
              }}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold hover:from-red-600 hover:to-pink-700 transition shadow-lg flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>

          <div className="bg-gradient-to-br from-[#2a2f4a]/80 to-[#1e2337]/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
            <div className="flex gap-4 mb-6 border-b border-white/10 overflow-x-auto">
              <button
                type="button"
                onClick={() => setSuperAdminTab('admins')}
                className={`px-6 py-3 font-semibold transition-all rounded-t-xl relative whitespace-nowrap ${
                  superAdminTab === 'admins' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Manage Admins
                </div>
                {superAdminTab === 'admins' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"></div>
                )}
              </button>
              <button
                type="button"
                onClick={() => setSuperAdminTab('stallconfig')}
                className={`px-6 py-3 font-semibold transition-all rounded-t-xl relative whitespace-nowrap ${
                  superAdminTab === 'stallconfig' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Stall Configuration
                </div>
                {superAdminTab === 'stallconfig' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"></div>
                )}
              </button>
              <button
                type="button"
                onClick={() => setSuperAdminTab('mapupload')}
                className={`px-6 py-3 font-semibold transition-all rounded-t-xl relative whitespace-nowrap ${
                  superAdminTab === 'mapupload' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Map Management
                </div>
                {superAdminTab === 'mapupload' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"></div>
                )}
              </button>
            </div>

            {/* Manage Admins Tab */}
            {superAdminTab === 'admins' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Admin Accounts</h2>
                  <button
                    type="button"
                    onClick={() => setShowAddAdminModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add New Admin
                  </button>
                </div>

                <div className="grid gap-4">
                  {adminList.map(admin => (
                    <div key={admin.id} className="bg-[#1a1f37]/50 border border-white/10 rounded-xl p-6 hover:border-purple-500/30 transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">{admin.name}</h3>
                          <p className="text-gray-400 text-sm mb-1">
                            <Mail className="w-4 h-4 inline mr-2" />
                            {admin.email}
                          </p>
                          <span className="inline-block bg-blue-500/20 border border-blue-500/30 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold">
                            Admin
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(admin)}
                            className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteAdmin(admin.id)}
                            className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/30 transition flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stall Configuration Tab */}
            {superAdminTab === 'stallconfig' && (
              <div>
                <div className="bg-gradient-to-br from-green-500/10 to-blue-600/10 border border-green-500/20 rounded-2xl p-8 mb-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-br from-green-500 to-blue-600 p-3 rounded-xl">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">Configure Stalls</h3>
                      <p className="text-gray-300 text-sm">Set the number of stalls by size and choose naming pattern.</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-[#1a1f37]/50 rounded-xl p-5 border border-white/10">
                      <label className="block text-sm font-semibold text-gray-300 mb-3">Small Stalls</label>
                      <input
                        type="number"
                        min="0"
                        value={stallConfig.small}
                        onChange={(e) => setStallConfig({...stallConfig, small: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-3 bg-[#0d1229] border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500 transition"
                      />
                      <p className="text-xs text-gray-400 mt-2">Compact spaces</p>
                    </div>
                    
                    <div className="bg-[#1a1f37]/50 rounded-xl p-5 border border-white/10">
                      <label className="block text-sm font-semibold text-gray-300 mb-3">Medium Stalls</label>
                      <input
                        type="number"
                        min="0"
                        value={stallConfig.medium}
                        onChange={(e) => setStallConfig({...stallConfig, medium: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-3 bg-[#0d1229] border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                      />
                      <p className="text-xs text-gray-400 mt-2">Standard size</p>
                    </div>
                    
                    <div className="bg-[#1a1f37]/50 rounded-xl p-5 border border-white/10">
                      <label className="block text-sm font-semibold text-gray-300 mb-3">Large Stalls</label>
                      <input
                        type="number"
                        min="0"
                        value={stallConfig.large}
                        onChange={(e) => setStallConfig({...stallConfig, large: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-3 bg-[#0d1229] border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition"
                      />
                      <p className="text-xs text-gray-400 mt-2">Premium large</p>
                    </div>
                  </div>
                  
                  <div className="bg-[#1a1f37]/50 rounded-xl p-5 border border-white/10 mb-6">
                    <label className="block text-sm font-semibold text-gray-300 mb-3">Stall Name Prefix (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., STALL-, BOOTH-, etc."
                      value={stallConfig.prefix}
                      onChange={(e) => setStallConfig({...stallConfig, prefix: e.target.value})}
                      className="w-full px-4 py-3 bg-[#0d1229] border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition placeholder-gray-500"
                    />
                  </div>
                  
                  <div className="bg-[#1a1f37]/50 rounded-xl p-5 border border-white/10 mb-6">
                    <label className="block text-sm font-semibold text-gray-300 mb-3">Stall Naming Pattern</label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setStallConfig({...stallConfig, namingPattern: 'alphanumeric'})}
                        className={`flex-1 px-6 py-4 rounded-xl font-semibold transition ${
                          stallConfig.namingPattern === 'alphanumeric'
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                            : 'bg-[#0d1229] text-gray-400 border border-white/10'
                        }`}
                      >
                        <div className="text-lg mb-1">{stallConfig.prefix || ''}A1, A2...</div>
                        <div className="text-xs opacity-75">Alphanumeric</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setStallConfig({...stallConfig, namingPattern: 'numeric'})}
                        className={`flex-1 px-6 py-4 rounded-xl font-semibold transition ${
                          stallConfig.namingPattern === 'numeric'
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                            : 'bg-[#0d1229] text-gray-400 border border-white/10'
                        }`}
                      >
                        <div className="text-lg mb-1">{stallConfig.prefix || ''}1, 2, 3...</div>
                        <div className="text-xs opacity-75">Numeric</div>
                      </button>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={generateStallsFromConfig}
                    className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-600 hover:to-purple-700 transition transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Generate Stalls
                  </button>
                </div>
              </div>
            )}

            {/* Map Management Tab */}
            {superAdminTab === 'mapupload' && (
              <div>
                <div className="bg-gradient-to-br from-purple-500/10 to-indigo-600/10 border border-purple-500/20 rounded-2xl p-8 mb-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-xl">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">Upload Trade Hall Floor Plan</h3>
                      <p className="text-gray-300 text-sm">Upload the floor plan image and position stalls.</p>
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
                          id="super-map-upload"
                        />
                        <label htmlFor="super-map-upload" className="cursor-pointer">
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
                            <span className="text-white font-semibold">Map Uploaded</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (stalls.length === 0) {
                                  alert('⚠️ Please generate stalls first before positioning.');
                                  return;
                                }
                                setIsPositioningMode(!isPositioningMode);
                              }}
                              className={`px-4 py-2 rounded-lg font-semibold text-sm transition flex items-center gap-2 ${
                                isPositioningMode
                                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                                  : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                              }`}
                            >
                              <MapPin className="w-4 h-4" />
                              {isPositioningMode ? 'Exit Positioning' : 'Position Stalls'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete the map?\n\nThis will also remove all stall positions.')) {
                                  setStallMapImage(null);
                                  localStorage.removeItem('tradeHallMap');
                                  const updatedStalls = stalls.map(stall => ({ ...stall, mapPosition: null }));
                                  setStalls(updatedStalls);
                                  setIsPositioningMode(false);
                                  setHoveredStall(null);
                                }
                              }}
                              className="text-red-400 hover:text-red-300 transition"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        
                        {isPositioningMode && (
                          <div className="bg-orange-500/20 border border-orange-500/40 rounded-lg p-3 mb-4">
                            <p className="text-sm text-white font-semibold mb-2">Positioning Mode Active</p>
                            <div className="mt-3 grid grid-cols-10 gap-2">
                              {stalls.filter(s => !s.isEmpty).map(stall => (
                                <button
                                  type="button"
                                  key={stall.id}
                                  onClick={() => setHoveredStall(stall.id)}
                                  className={`px-2 py-2 rounded text-xs font-bold transition ${
                                    hoveredStall === stall.id
                                      ? 'bg-orange-500 text-white'
                                      : 'bg-[#2a2f4a] text-gray-300'
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
                            alt="Trade Hall Map" 
                            className="w-full h-auto rounded-lg" 
                            style={{ cursor: isPositioningMode ? 'crosshair' : 'default' }}
                          />
                          
                          {stalls.map((stall) => {
                            if (!stall.mapPosition || stall.isEmpty) return null;
                            
                            return (
                              <div
                                key={stall.id}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                style={{
                                  left: `${stall.mapPosition.x}%`,
                                  top: `${stall.mapPosition.y}%`
                                }}
                              >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                                  hoveredStall === stall.id
                                    ? 'bg-orange-500 text-white scale-125'
                                    : 'bg-blue-500 text-white opacity-70'
                                }`}>
                                  {stall.id}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Add Admin Modal */}
          {showAddAdminModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-gradient-to-br from-[#2a2f4a] to-[#1e2337] rounded-2xl border border-white/10 p-8 max-w-md w-full">
                <h3 className="text-2xl font-bold text-white mb-6">Add New Admin</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      value={newAdminData.name}
                      onChange={(e) => setNewAdminData({...newAdminData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-[#0d1229] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={newAdminData.email}
                      onChange={(e) => setNewAdminData({...newAdminData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-[#0d1229] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Password</label>
                    <input
                      type="password"
                      value={newAdminData.password}
                      onChange={(e) => setNewAdminData({...newAdminData, password: e.target.value})}
                      className="w-full px-4 py-3 bg-[#0d1229] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleAddAdmin}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold hover:from-purple-600 hover:to-pink-700 transition"
                  >
                    Add Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddAdminModal(false);
                      setNewAdminData({ name: '', email: '', password: '' });
                    }}
                    className="flex-1 py-3 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Admin Modal */}
          {showEditAdminModal && editingAdmin && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-gradient-to-br from-[#2a2f4a] to-[#1e2337] rounded-2xl border border-white/10 p-8 max-w-md w-full">
                <h3 className="text-2xl font-bold text-white mb-6">Edit Admin</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      value={newAdminData.name}
                      onChange={(e) => setNewAdminData({...newAdminData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-[#0d1229] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={newAdminData.email}
                      onChange={(e) => setNewAdminData({...newAdminData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-[#0d1229] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">New Password (optional)</label>
                    <input
                      type="password"
                      value={newAdminData.password}
                      onChange={(e) => setNewAdminData({...newAdminData, password: e.target.value})}
                      placeholder="Leave blank to keep current"
                      className="w-full px-4 py-3 bg-[#0d1229] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleEditAdmin}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold hover:from-purple-600 hover:to-pink-700 transition"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditAdminModal(false);
                      setEditingAdmin(null);
                      setNewAdminData({ name: '', email: '', password: '' });
                    }}
                    className="flex-1 py-3 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div>
      {currentView === 'superadmin_landing' && <SuperAdminLandingPage />}
      {currentView === 'superadmin_login' && <SuperAdminLogin />}
      {currentView === 'superadmin_dashboard' && <SuperAdminDashboard />}
    </div>
  );
};

export default SuperAdminPortal;
