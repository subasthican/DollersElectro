import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { fetchWishlist } from '../../store/slices/wishlistSlice';
import AdminNav from '../AdminNav';
import { useCart } from '../../contexts/CartContext';
import NotificationCenter from '../notifications/NotificationCenter';
import QuizButton from '../QuizButton';
import AIChatbox from '../chat/AIChatbox';
import GameModal from '../GameModal';
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserIcon, 
  ShoppingCartIcon, 
  HeartIcon, 
  BellIcon, 
  MagnifyingGlassIcon,
  ChevronDownIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  ShoppingBagIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [isFloatingButtonsVisible, setIsFloatingButtonsVisible] = useState(() => {
    const saved = localStorage.getItem('floatingButtonsVisible');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { wishlist } = useAppSelector((state) => state.wishlist);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { state: cartState, logoutCleanup } = useCart();

  // Determine if user should have admin access
  const hasAdminAccess = isAuthenticated && user?.role === 'admin';
  const currentUser = user;
  
  // Ensure we only show authenticated features when we're certain the user is logged in
  const isDefinitelyAuthenticated = isAuthenticated && user;

  // Fetch wishlist when user is authenticated
  useEffect(() => {
    if (isDefinitelyAuthenticated && user?.role === 'customer') {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isDefinitelyAuthenticated, user?.role]);

  // Refresh wishlist if count doesn't match items (orphaned items)
  useEffect(() => {
    if (wishlist && wishlist.itemCount > 0 && (!wishlist.items || wishlist.items.length === 0)) {

      dispatch(fetchWishlist());
    }
  }, [wishlist, dispatch]);

  // Save floating buttons visibility state to localStorage
  useEffect(() => {
    localStorage.setItem('floatingButtonsVisible', JSON.stringify(isFloatingButtonsVisible));
  }, [isFloatingButtonsVisible]);

  // Force re-render when wishlist changes
  const wishlistCount = wishlist && wishlist.items && Array.isArray(wishlist.items) ? wishlist.items.length : 0;
  
  // Debug wishlist state
  useEffect(() => {
    if (isDefinitelyAuthenticated && user?.role === 'customer') {
      console.log('📊 Wishlist State:', { wishlist, wishlistCount, itemsLength: wishlist?.items?.length });
    }
  }, [wishlist, wishlistCount, isDefinitelyAuthenticated, user?.role]);

  const navigation = [
    { name: 'Home', href: '/', current: location.pathname === '/' },
    // Products and Categories should be available to all users
    { name: 'Products', href: '/products', current: location.pathname === '/products' },
    { name: 'Categories', href: '/categories', current: location.pathname === '/categories' },
    { name: 'About', href: '/about', current: location.pathname === '/about' },
    { name: 'Contact', href: '/contact', current: location.pathname === '/contact' },
    // Admin page - only show for admin users
    ...(hasAdminAccess ? [
      { name: 'Admin', href: '/admin', current: location.pathname === '/admin' }
    ] : []),
    // Employee page - only show for employee users
    ...(isDefinitelyAuthenticated && currentUser?.role === 'employee' ? [
      { name: 'Employee', href: '/employee', current: location.pathname === '/employee' }
    ] : []),
  ];

  const handleLogout = async () => {
    try {
          // Regular user logout
    await dispatch(logout());
      
      // Additional cleanup for all users
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Clear cart data
      logoutCleanup();
      
      // Close mobile menu if open
      setIsMobileMenuOpen(false);
      
      // Redirect to home page
      navigate('/');

    } catch (error) {

      // Even if logout fails, clear local data and redirect
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      logoutCleanup();
      navigate('/');
    }
  };

  const userMenuItems = [
    // Only show customer-specific items for customers
    ...(isDefinitelyAuthenticated && currentUser?.role === 'customer' ? [
      { name: 'Profile', href: '/profile', icon: UserIcon },
      { name: 'Wishlist', href: '/wishlist', icon: HeartIcon },
      { name: 'Notifications', href: '/notifications', icon: BellIcon },
      { name: 'Orders', href: '/orders', icon: ShoppingBagIcon },
      { name: 'Settings', href: '/settings', icon: CogIcon },
    ] : []),
    
    // Admin link - only show for admin users
    ...(hasAdminAccess ? [
      { name: 'Admin Dashboard', href: '/admin', icon: CogIcon }
    ] : []),
    
    // Employee link - only show for employee users
    ...(isDefinitelyAuthenticated && currentUser?.role === 'employee' ? [
      { name: 'Employee Dashboard', href: '/employee', icon: CogIcon }
    ] : []),
    
    { name: 'Sign Out', onClick: handleLogout, icon: ArrowRightOnRectangleIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Admin Navigation - Only show for admin users */}
      {hasAdminAccess && <AdminNav />}
      
      {/* Header - iOS 16+ Ultra Glassy Style */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/70 border-b border-white/60 shadow-lg shadow-gray-200/50 relative">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                  <span className="text-white font-bold text-lg">D</span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-xl font-bold text-gray-900 tracking-tight">DollersElectro</span>
                  <p className="text-xs text-gray-500 -mt-0.5 font-light">Electrical Solutions</p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation - iOS Style */}
            <nav className="hidden md:flex items-center space-x-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 relative overflow-hidden group ${
                    item.current
                      ? 'text-blue-600 backdrop-blur-2xl bg-blue-50/80 border border-blue-200/60 shadow-lg shadow-blue-500/20'
                      : 'text-gray-700 hover:text-gray-900 backdrop-blur-2xl bg-white/40 hover:bg-white/60 border border-white/50 hover:border-gray-200/60 shadow-sm hover:shadow-md'
                  }`}
                >
                  {/* Shimmer effect on hover */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                  <span className="relative">{item.name}</span>
                  {/* Active indicator dot */}
                  {item.current && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></span>
                  )}
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
              {/* Search Button */}
              <button 
                onClick={() => navigate('/products?search=')}
                className="p-3 text-gray-700 hover:text-gray-900 rounded-xl backdrop-blur-2xl bg-white/40 hover:bg-white/60 border border-white/50 hover:border-gray-200/60 shadow-sm hover:shadow-lg transition-all duration-300 group"
                title="Search Products"
              >
                <MagnifyingGlassIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </button>

              {/* Wishlist - Only show for customers */}
              {isDefinitelyAuthenticated && user?.role === 'customer' && (
                <Link to="/wishlist" className="p-3 text-gray-700 hover:text-gray-900 rounded-xl backdrop-blur-2xl bg-white/40 hover:bg-white/60 border border-white/50 hover:border-gray-200/60 shadow-sm hover:shadow-lg transition-all duration-300 relative group">
                  <HeartIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px] shadow-lg shadow-red-500/50 ring-2 ring-white">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Notifications - Show for all authenticated users */}
              {isDefinitelyAuthenticated && (
                <NotificationCenter />
              )}

              {/* Cart - Only show for customers */}
              {isDefinitelyAuthenticated && currentUser?.role === 'customer' && (
                <Link to="/cart" className="p-3 text-gray-700 hover:text-gray-900 rounded-xl backdrop-blur-2xl bg-white/40 hover:bg-white/60 border border-white/50 hover:border-gray-200/60 shadow-sm hover:shadow-lg transition-all duration-300 relative group">
                  <ShoppingCartIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  {cartState.itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px] shadow-lg shadow-blue-500/50 ring-2 ring-white">
                      {cartState.itemCount}
                    </span>
                  )}
                </Link>
              )}
              
              {/* View Cart Button - Only show for customers and items exist */}
              {isDefinitelyAuthenticated && currentUser?.role === 'customer' && cartState.itemCount > 0 && (
                <Link 
                  to="/cart"
                  className="hidden sm:inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-600/95 hover:to-blue-700/95 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 border-2 border-white/30 hover:border-white/50 hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <ShoppingCartIcon className="w-4 h-4 mr-2 relative z-10" />
                  <span className="relative z-10">Cart ({cartState.itemCount})</span>
                </Link>
              )}

              {/* User Profile / Auth */}
              {isDefinitelyAuthenticated && currentUser ? (
                <div className="relative group">
                  <button 
                    className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 hover:text-gray-900 rounded-2xl backdrop-blur-2xl bg-white/40 hover:bg-white/60 border border-white/50 hover:border-gray-200/60 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 ring-2 ring-white/50">
                      <span className="text-white text-sm font-bold">
                        {currentUser?.firstName?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="hidden lg:block">
                      <span className="text-sm font-semibold">
                        {currentUser?.firstName}
                      </span>
                    </div>
                    <ChevronDownIcon className="w-4 h-4 hidden lg:block" />
                  </button>

                  {/* Dropdown Menu - iOS Glassy Style */}
                  <div className="absolute right-0 mt-3 w-64 backdrop-blur-2xl bg-white/80 rounded-2xl shadow-2xl shadow-gray-900/10 border border-white/60 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-transparent">
                      <p className="text-sm font-bold text-gray-900 truncate">{currentUser?.firstName} {currentUser?.lastName}</p>
                      <p className="text-xs text-gray-600 truncate">{currentUser?.email}</p>
                      {currentUser?.role === 'admin' && (
                        <span className="inline-block mt-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">Admin User</span>
                      )}
                      {currentUser?.role === 'employee' && (
                        <span className="inline-block mt-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">Employee User</span>
                      )}
                      {currentUser?.role === 'customer' && (
                        <span className="inline-block mt-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">Customer User</span>
                      )}
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-1">
                      {userMenuItems.map((item) => (
                        <div key={item.name}>
                          {item.onClick ? (
                            <button
                              onClick={() => {
                                item.onClick();
                                setIsMobileMenuOpen(false);
                              }}
                              className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-white/60 hover:text-blue-600 transition-all duration-200 group/item"
                            >
                              <item.icon className="w-5 h-5 mr-3 text-gray-500 group-hover/item:text-blue-600 transition-colors" />
                              {item.name}
                            </button>
                          ) : (
                            <Link to={item.href!} onClick={() => setIsMobileMenuOpen(false)} className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-white/60 hover:text-blue-600 transition-all duration-200 group/item">
                              <item.icon className="w-5 h-5 mr-3 text-gray-500 group-hover/item:text-blue-600 transition-colors" />
                              {item.name}
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <Link to="/login" className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900 rounded-2xl backdrop-blur-2xl bg-white/40 hover:bg-white/60 border border-white/50 hover:border-gray-200/60 shadow-sm hover:shadow-lg transition-all duration-300">
                    Sign In
                  </Link>
                  <Link to="/register" className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105 transition-all duration-300 border border-blue-400/50">
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Auth Buttons - Always visible on mobile */}
              {!isDefinitelyAuthenticated && (
                <div className="flex items-center space-x-2 md:hidden">
                  <Link 
                    to="/login" 
                    className="px-4 py-2.5 text-sm font-semibold text-gray-700 backdrop-blur-2xl bg-white/40 border border-white/50 rounded-xl hover:bg-white/60 hover:border-gray-200/60 shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/30 border border-blue-400/50 hover:shadow-xl transition-all duration-300"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="block md:hidden p-3 text-gray-700 hover:text-gray-900 rounded-xl backdrop-blur-2xl bg-white/40 hover:bg-white/60 border border-white/50 hover:border-gray-200/60 shadow-sm hover:shadow-lg transition-all duration-300 z-50"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - iOS Glassy Style */}
        {isMobileMenuOpen && (
          <div className="md:hidden backdrop-blur-2xl bg-white/90 border-t border-white/60 absolute top-16 left-0 right-0 z-40 shadow-2xl min-h-screen overflow-y-auto">
            <div className="px-4 py-6 space-y-6">
              {/* Mobile Navigation - Only Main Pages */}
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-5 py-3.5 rounded-2xl text-base font-semibold transition-all duration-300 ${
                      item.current
                        ? 'bg-blue-50/80 text-blue-600 border-2 border-blue-200/60 shadow-lg shadow-blue-500/10'
                        : 'text-gray-700 hover:text-gray-900 backdrop-blur-xl bg-white/40 hover:bg-white/60 border-2 border-white/50 hover:border-gray-200/60'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* User Profile Section - iOS Glassy Style */}
              {isDefinitelyAuthenticated && currentUser && (
                <div className="space-y-3">
                  {/* User Info Card */}
                  <div className="px-5 py-4 backdrop-blur-xl bg-gradient-to-br from-white/60 to-white/40 rounded-2xl border-2 border-white/60 shadow-lg">
                    <p className="text-base font-bold text-gray-900">{currentUser?.firstName} {currentUser?.lastName}</p>
                    <p className="text-sm text-gray-600 mt-1">{currentUser?.email}</p>
                    {currentUser?.role === 'admin' && (
                      <span className="inline-block mt-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">Admin User</span>
                    )}
                    {currentUser?.role === 'employee' && (
                      <span className="inline-block mt-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">Employee User</span>
                    )}
                    {currentUser?.role === 'customer' && (
                      <span className="inline-block mt-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">Customer User</span>
                    )}
                  </div>
                  {/* Menu Items - iOS Glassy Style */}
                  <div className="space-y-2">
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center px-4 py-3 text-left text-gray-700 hover:text-gray-900 backdrop-blur-xl bg-white/40 hover:bg-white/60 rounded-xl border border-white/50 hover:border-gray-200/60 transition-all duration-300 group"
                    >
                      <UserIcon className="w-5 h-5 mr-3 text-gray-500 group-hover:text-gray-900" />
                      <span className="font-medium">Profile</span>
                    </Link>
                    
                    {/* Customer-specific menu items */}
                    {currentUser?.role === 'customer' && (
                      <>
                        <Link
                          to="/orders"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center px-4 py-3 text-left text-gray-700 hover:text-gray-900 backdrop-blur-xl bg-white/40 hover:bg-white/60 rounded-xl border border-white/50 hover:border-gray-200/60 transition-all duration-300 group"
                        >
                          <ShoppingBagIcon className="w-5 h-5 mr-3 text-gray-500 group-hover:text-gray-900" />
                          <span className="font-medium">Orders</span>
                        </Link>
                        <Link
                          to="/wishlist"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center px-4 py-3 text-left text-gray-700 hover:text-gray-900 backdrop-blur-xl bg-white/40 hover:bg-white/60 rounded-xl border border-white/50 hover:border-gray-200/60 transition-all duration-300 group"
                        >
                          <HeartIcon className="w-5 h-5 mr-3 text-gray-500 group-hover:text-gray-900" />
                          <span className="font-medium">Wishlist</span>
                        </Link>
                        <Link
                          to="/notifications"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center px-4 py-3 text-left text-gray-700 hover:text-gray-900 backdrop-blur-xl bg-white/40 hover:bg-white/60 rounded-xl border border-white/50 hover:border-gray-200/60 transition-all duration-300 group"
                        >
                          <BellIcon className="w-5 h-5 mr-3 text-gray-500 group-hover:text-gray-900" />
                          <span className="font-medium">Notifications</span>
                        </Link>
                      </>
                    )}
                    
                    <Link
                      to="/settings"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center px-4 py-3 text-left text-gray-700 hover:text-gray-900 backdrop-blur-xl bg-white/40 hover:bg-white/60 rounded-xl border border-white/50 hover:border-gray-200/60 transition-all duration-300 group"
                    >
                      <CogIcon className="w-5 h-5 mr-3 text-gray-500 group-hover:text-gray-900" />
                      <span className="font-medium">Settings</span>
                    </Link>
                    
                    {hasAdminAccess && (
                      <Link
                        to="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center px-4 py-3 text-left text-red-600 hover:text-red-700 backdrop-blur-xl bg-red-50/60 hover:bg-red-50/80 rounded-xl border border-red-200/50 hover:border-red-300/60 transition-all duration-300 group shadow-sm"
                      >
                        <CogIcon className="w-5 h-5 mr-3" />
                        <span className="font-semibold">Admin Dashboard</span>
                      </Link>
                    )}
                    
                    {/* Employee-specific menu items */}
                    {currentUser?.role === 'employee' && (
                      <Link
                        to="/employee"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center px-4 py-3 text-left text-blue-600 hover:text-blue-700 backdrop-blur-xl bg-blue-50/60 hover:bg-blue-50/80 rounded-xl border border-blue-200/50 hover:border-blue-300/60 transition-all duration-300 group shadow-sm"
                      >
                        <CogIcon className="w-5 h-5 mr-3" />
                        <span className="font-semibold">Employee Dashboard</span>
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:text-red-600 backdrop-blur-xl bg-white/40 hover:bg-red-50/60 rounded-xl border border-white/50 hover:border-red-200/60 transition-all duration-300 group"
                    >
                      <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3 text-gray-500 group-hover:text-red-600" />
                      <span className="font-medium group-hover:font-semibold">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer - Apple iOS Style */}
      <footer className="bg-gray-50 border-t border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">D</span>
                </div>
                <span className="text-2xl font-bold text-gray-900 tracking-tight">DollersElectro</span>
              </div>
              <p className="text-gray-600 mb-6 max-w-md font-light leading-relaxed">
                Your trusted source for premium electrical components and smart home solutions since 2008.
              </p>
              <div className="flex space-x-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-200 hover:bg-blue-100 flex items-center justify-center text-gray-600 hover:text-blue-600 transition-all duration-300">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-200 hover:bg-blue-100 flex items-center justify-center text-gray-600 hover:text-blue-600 transition-all duration-300">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.665 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-200 hover:bg-blue-100 flex items-center justify-center text-gray-600 hover:text-blue-600 transition-all duration-300">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.047-1.852-3.047-1.853 0-2.136 1.445-2.136 2.939v5.677H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-tight mb-4">Shop</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/products" className="text-gray-600 hover:text-gray-900 transition-colors font-light">
                    Products
                  </Link>
                </li>
                <li>
                  <Link to="/categories" className="text-gray-600 hover:text-gray-900 transition-colors font-light">
                    Categories
                  </Link>
                </li>
                <li>
                  <Link to="/order-tracking" className="text-gray-600 hover:text-gray-900 transition-colors font-light">
                    Track Order
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-600 hover:text-gray-900 transition-colors font-light">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-600 hover:text-gray-900 transition-colors font-light">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-tight mb-4">Support</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/help" className="text-gray-600 hover:text-gray-900 transition-colors font-light">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/shipping" className="text-gray-600 hover:text-gray-900 transition-colors font-light">
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link to="/returns" className="text-gray-600 hover:text-gray-900 transition-colors font-light">
                    Returns
                  </Link>
                </li>
                <li>
                  <Link to="/warranty" className="text-gray-600 hover:text-gray-900 transition-colors font-light">
                    Warranty
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-gray-200/50">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-sm text-gray-500 font-light">
                © 2024 DollersElectro. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <Link to="/privacy" className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-light">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-light">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Floating Action Buttons - iOS 26 Glassy Style */}
      <div className="fixed bottom-6 left-6 z-50">
        {/* Toggle Button - iOS Glassy */}
        <div className="relative group mb-4">
          <button
            onClick={() => setIsFloatingButtonsVisible(!isFloatingButtonsVisible)}
            className="w-14 h-14 backdrop-blur-2xl bg-white/80 hover:bg-white/90 text-gray-800 rounded-2xl shadow-2xl shadow-gray-900/20 hover:shadow-gray-900/30 border-2 border-white/60 hover:border-gray-200/60 transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
            title={isFloatingButtonsVisible ? "Hide Buttons" : "Show Buttons"}
          >
            {isFloatingButtonsVisible ? (
              <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          {/* iOS Tooltip */}
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-4 py-2 backdrop-blur-2xl bg-gray-900/95 text-white text-sm font-medium rounded-xl shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/10 pointer-events-none">
            {isFloatingButtonsVisible ? "Hide Menu" : "Show Menu"}
          </div>
        </div>

        {/* Action Buttons - Only show when visible */}
        {isFloatingButtonsVisible && (
          <div className="flex flex-col space-y-4">
            {/* Quiz Button */}
            <QuizButton />
            
            {/* AI Chat Button - iOS 26 Glassy */}
            {isDefinitelyAuthenticated && user?.role === 'customer' && (
              <div className="relative group">
                <button
                  onClick={() => setIsAIChatOpen(true)}
                  className="w-16 h-16 backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-purple-600/90 hover:from-blue-600/95 hover:to-purple-700/95 text-white rounded-2xl shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-110 flex items-center justify-center relative overflow-hidden"
                  title="AI Electrical Advisor"
                >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <SparklesIcon className="w-8 h-8 animate-pulse group-hover:animate-none relative z-10" />
                </button>
                {/* iOS Tooltip */}
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-4 py-2 backdrop-blur-2xl bg-gray-900/95 text-white text-sm font-medium rounded-xl shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/10 pointer-events-none">
                  AI Electrical Advisor
                </div>
              </div>
            )}
            
            {/* Game Button - iOS 26 Glassy */}
            <div className="relative group">
              <button
                onClick={() => setIsGameOpen(true)}
                className="w-16 h-16 backdrop-blur-2xl bg-gradient-to-br from-green-500/90 to-emerald-600/90 hover:from-green-600/95 hover:to-emerald-700/95 text-white rounded-2xl shadow-2xl shadow-green-500/40 hover:shadow-green-500/60 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-110 flex items-center justify-center relative overflow-hidden"
                title="Play Snake Game"
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <svg className="w-8 h-8 group-hover:rotate-12 transition-transform duration-300 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              {/* iOS Tooltip */}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-4 py-2 backdrop-blur-2xl bg-gray-900/95 text-white text-sm font-medium rounded-xl shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/10 pointer-events-none">
                Play Snake Game
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Chatbox */}
      {isDefinitelyAuthenticated && user?.role === 'customer' && (
        <AIChatbox
          isOpen={isAIChatOpen}
          onClose={() => setIsAIChatOpen(false)}
        />
      )}

      {/* Game Modal */}
      <GameModal
        isOpen={isGameOpen}
        onClose={() => setIsGameOpen(false)}
      />
    </div>
  );
};

export default Layout;
