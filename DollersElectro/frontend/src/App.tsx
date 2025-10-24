import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { useAppDispatch, useAppSelector } from './store';
import { getCurrentUser, initializeAuth } from './store/slices/authSlice';

// Layout Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import CustomerOnlyRoute from './components/auth/CustomerOnlyRoute';
import PasswordChangeGuard from './components/auth/PasswordChangeGuard';

// Context and other imports
import { CartProvider } from './contexts/CartContext';
import { RecentlyViewedProvider } from './contexts/RecentlyViewedContext';
import { ProductComparisonProvider } from './contexts/ProductComparisonContext';
import ErrorBoundary from './components/ErrorBoundary';
import { HelmetProvider } from 'react-helmet-async';
import { usePerformanceMonitoring } from './hooks/usePerformanceMonitoring';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const OTPVerificationPage = lazy(() => import('./pages/OTPVerificationPage'));
const ChangePasswordPage = lazy(() => import('./pages/ChangePasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CategoriesListPage = lazy(() => import('./pages/categories/CategoriesListPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const AdminPage = lazy(() => import('./pages/admin/AdminPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));
const AdminNotificationsPage = lazy(() => import('./pages/admin/AdminNotificationsPage'));
const EmployeeNotificationsPage = lazy(() => import('./pages/admin/EmployeeNotificationsPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminCustomersPage = lazy(() => import('./pages/admin/AdminCustomersPage'));
const AdminEmployeesPage = lazy(() => import('./pages/admin/AdminEmployeesPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage'));
const AdminMessagesPage = lazy(() => import('./pages/admin/AdminMessagesPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminDeliveryManagement = lazy(() => import('./pages/admin/AdminDeliveryManagement'));
const QuizManagementPage = lazy(() => import('./pages/admin/QuizManagementPage'));
const LowStockAlertsPage = lazy(() => import('./pages/admin/LowStockAlertsPage'));
const PickupVerificationPage = lazy(() => import('./pages/admin/PickupVerificationPage'));
const PromoCodeManagement = lazy(() => import('./components/admin/PromoCodeManagement'));
const EmployeeDashboard = lazy(() => import('./pages/admin/EmployeeDashboard'));
const EmployeeSettingsPage = lazy(() => import('./pages/admin/EmployeeSettingsPage'));
const EmployeeOrdersPage = lazy(() => import('./pages/admin/EmployeeOrdersPage'));
const EmployeeSupportPage = lazy(() => import('./pages/admin/EmployeeSupportPage'));
const EmployeeProductsPage = lazy(() => import('./pages/admin/EmployeeProductsPage'));
const EmployeeChatPage = lazy(() => import('./pages/admin/EmployeeChatPage'));
const EmployeeTasksPage = lazy(() => import('./pages/admin/EmployeeTasksPage'));
const EmployeeMessagesPage = lazy(() => import('./pages/admin/EmployeeMessagesPage'));
const EmployeePromoCodePage = lazy(() => import('./pages/admin/EmployeePromoCodePage'));
const EmployeeDeliveryManagement = lazy(() => import('./pages/admin/EmployeeDeliveryManagement'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const MyMessagesPage = lazy(() => import('./pages/MyMessagesPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const CartTestPage = lazy(() => import('./pages/CartTestPage'));
const DeliveryInfoPage = lazy(() => import('./pages/DeliveryInfoPage'));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage'));
const OrderHistoryPage = lazy(() => import('./pages/orders/OrderHistoryPage'));
const CustomerOrderTracking = lazy(() => import('./pages/CustomerOrderTracking'));
const CategoryPage = lazy(() => import('./pages/categories/CategoryPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const ShippingPage = lazy(() => import('./pages/ShippingPage'));
const ReturnsPage = lazy(() => import('./pages/ReturnsPage'));
const WarrantyPage = lazy(() => import('./pages/WarrantyPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const QuizPage = lazy(() => import('./pages/QuizPage'));
const QuizTakingPage = lazy(() => import('./pages/QuizTakingPage'));
const QuizResultsPage = lazy(() => import('./pages/QuizResultsPage'));
const QuizHistoryPage = lazy(() => import('./pages/QuizHistoryPage'));
const GamePage = lazy(() => import('./pages/GamePage'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// App Content Component
const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  
  // Initialize performance monitoring
  usePerformanceMonitoring();

  useEffect(() => {
    // Initialize auth state from localStorage first
    dispatch(initializeAuth());
    
    // Then validate with server if we have stored data
    const hasToken = localStorage.getItem('accessToken');
    const hasUser = localStorage.getItem('user');
    
    if (hasToken && hasUser && !isAuthenticated) {
      // We have stored data, try to validate it with server
      dispatch(getCurrentUser());
    }
  }, [dispatch, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <PasswordChangeGuard>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
      {/* Standalone Dashboard Routes (No Layout) */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin">
          <AdminPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute requiredRole="admin">
          <AdminSettingsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/notifications" element={
        <ProtectedRoute requiredRole="admin">
          <AdminNotificationsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/products" element={
        <ProtectedRoute requiredRole="admin">
          <AdminProductsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/customers" element={
        <ProtectedRoute requiredRole="admin">
          <AdminCustomersPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/employees" element={
        <ProtectedRoute requiredRole="admin">
          <AdminEmployeesPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/analytics" element={
        <ProtectedRoute requiredRole="admin">
          <AdminAnalyticsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/orders" element={
        <ProtectedRoute requiredRole="admin">
          <AdminOrdersPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/messages" element={
        <ProtectedRoute requiredRole="admin">
          <AdminMessagesPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/delivery" element={
        <ProtectedRoute requiredRole="admin">
          <AdminDeliveryManagement />
        </ProtectedRoute>
      } />
      <Route path="/admin/promo-codes" element={
        <ProtectedRoute requiredRole="admin">
          <PromoCodeManagement />
        </ProtectedRoute>
      } />
      <Route path="/admin/quiz-management" element={
        <ProtectedRoute requiredRole="admin">
          <QuizManagementPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/low-stock-alerts" element={
        <ProtectedRoute requiredRole="admin">
          <LowStockAlertsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/pickup-verification" element={
        <ProtectedRoute requiredRole="admin">
          <PickupVerificationPage />
        </ProtectedRoute>
      } />
      
      {/* Employee Dashboard Routes (No Layout) */}
      <Route path="/employee" element={
        <ProtectedRoute requiredRole="employee">
          <EmployeeDashboard />
        </ProtectedRoute>
      } />
      <Route path="/employee/settings" element={
        <ProtectedRoute requiredRole="employee">
          <EmployeeSettingsPage />
        </ProtectedRoute>
      } />
      <Route path="/employee/notifications" element={
        <ProtectedRoute requiredRole="employee">
          <EmployeeNotificationsPage />
        </ProtectedRoute>
      } />
      <Route path="/employee/orders" element={
        <ProtectedRoute requiredRole="employee">
          <AdminOrdersPage />
        </ProtectedRoute>
      } />
      <Route path="/employee/support" element={
        <ProtectedRoute requiredRole="employee">
          <EmployeeSupportPage />
        </ProtectedRoute>
      } />
      <Route path="/employee/products" element={
        <ProtectedRoute requiredRole="employee">
          <AdminProductsPage />
        </ProtectedRoute>
      } />
      <Route path="/employee/chat" element={
        <ProtectedRoute requiredRole="employee">
          <EmployeeChatPage />
        </ProtectedRoute>
      } />
      <Route path="/employee/tasks" element={
        <ProtectedRoute requiredRole="employee">
          <EmployeeTasksPage />
        </ProtectedRoute>
      } />
      <Route path="/employee/messages" element={
        <ProtectedRoute requiredRole="employee">
          <AdminMessagesPage />
        </ProtectedRoute>
      } />
      <Route path="/employee/promo-codes" element={
        <ProtectedRoute requiredRole="employee">
          <PromoCodeManagement />
        </ProtectedRoute>
      } />
      <Route path="/employee/delivery" element={
        <ProtectedRoute requiredRole="employee">
          <AdminDeliveryManagement />
        </ProtectedRoute>
      } />
      <Route path="/employee/quiz-management" element={
        <ProtectedRoute requiredRole="employee">
          <QuizManagementPage />
        </ProtectedRoute>
      } />
      <Route path="/employee/low-stock-alerts" element={
        <ProtectedRoute requiredRole="employee">
          <LowStockAlertsPage />
        </ProtectedRoute>
      } />
      <Route path="/employee/pickup-verification" element={
        <ProtectedRoute requiredRole="employee">
          <PickupVerificationPage />
        </ProtectedRoute>
      } />

      {/* Standalone Auth Pages (No Layout) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-otp" element={<OTPVerificationPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/change-password" element={<ChangePasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      
      {/* Main App Routes with Layout */}
      <Route path="/*" element={
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={
              <ErrorBoundary>
                <ProductDetailPage />
              </ErrorBoundary>
            } />
            <Route path="/categories" element={<CategoriesListPage />} />
            <Route path="/categories/:categoryId" element={<CategoryPage />} />
            <Route path="/cart" element={
              <CustomerOnlyRoute>
                <CartPage />
              </CustomerOnlyRoute>
            } />
            <Route path="/cart-test" element={
              <CustomerOnlyRoute>
                <CartTestPage />
              </CustomerOnlyRoute>
            } />
            <Route path="/delivery-info" element={
              <CustomerOnlyRoute>
                <DeliveryInfoPage />
              </CustomerOnlyRoute>
            } />
            <Route path="/order-tracking" element={
              <CustomerOnlyRoute>
                <OrderTrackingPage />
              </CustomerOnlyRoute>
            } />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/quiz/history" element={
              <CustomerOnlyRoute>
                <QuizHistoryPage />
              </CustomerOnlyRoute>
            } />
            <Route path="/quiz/:id" element={
              <CustomerOnlyRoute>
                <QuizTakingPage />
              </CustomerOnlyRoute>
            } />
            <Route path="/game" element={<GamePage />} />
            <Route path="/quiz/:id/results" element={
              <CustomerOnlyRoute>
                <QuizResultsPage />
              </CustomerOnlyRoute>
            } />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/my-messages" element={
              <ProtectedRoute>
                <MyMessagesPage />
              </ProtectedRoute>
            } />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/shipping" element={<ShippingPage />} />
            <Route path="/returns" element={<ReturnsPage />} />
            <Route path="/warranty" element={<WarrantyPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />

            {/* Customer-Only Routes */}
            <Route path="profile" element={
              <CustomerOnlyRoute>
                <ProfilePage />
              </CustomerOnlyRoute>
            } />
            <Route path="orders" element={
              <CustomerOnlyRoute>
                <OrderHistoryPage />
              </CustomerOnlyRoute>
            } />
            <Route path="order-tracking" element={
              <CustomerOnlyRoute>
                <CustomerOrderTracking />
              </CustomerOnlyRoute>
            } />
            <Route path="wishlist" element={
              <CustomerOnlyRoute>
                <WishlistPage />
              </CustomerOnlyRoute>
            } />
            <Route path="notifications" element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            } />
            <Route path="settings" element={
              <CustomerOnlyRoute>
                <SettingsPage />
              </CustomerOnlyRoute>
            } />
            <Route path="payment" element={
              <CustomerOnlyRoute>
                <PaymentPage />
              </CustomerOnlyRoute>
            } />
            <Route path="payment-success" element={
              <CustomerOnlyRoute>
                <PaymentSuccessPage />
              </CustomerOnlyRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/orders" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDeliveryManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/delivery" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDeliveryManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/promo-codes" element={
              <ProtectedRoute requiredRole="admin">
                <PromoCodeManagement />
              </ProtectedRoute>
            } />
            
            {/* Employee Routes */}
            <Route path="/employee" element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeDashboard />
              </ProtectedRoute>
            } />
            <Route path="/employee/notifications" element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeNotificationsPage />
              </ProtectedRoute>
            } />
            <Route path="/employee/orders" element={
              <ProtectedRoute requiredRole="employee">
                <AdminOrdersPage />
              </ProtectedRoute>
            } />
            <Route path="/employee/support" element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeSupportPage />
              </ProtectedRoute>
            } />
            <Route path="/employee/products" element={
              <ProtectedRoute requiredRole="employee">
                <AdminProductsPage />
              </ProtectedRoute>
            } />
            <Route path="/employee/chat" element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeChatPage />
              </ProtectedRoute>
            } />
            <Route path="/employee/tasks" element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeTasksPage />
              </ProtectedRoute>
            } />
            <Route path="/employee/messages" element={
              <ProtectedRoute requiredRole="employee">
                <AdminMessagesPage />
              </ProtectedRoute>
            } />
            <Route path="/employee/promo-codes" element={
              <ProtectedRoute requiredRole="employee">
                <PromoCodeManagement />
              </ProtectedRoute>
            } />
            <Route path="/employee/delivery" element={
              <ProtectedRoute requiredRole="employee">
                <AdminDeliveryManagement />
              </ProtectedRoute>
            } />
            <Route path="/employee/quiz-management" element={
              <ProtectedRoute requiredRole="employee">
                <QuizManagementPage />
              </ProtectedRoute>
            } />
            <Route path="/employee/low-stock-alerts" element={
              <ProtectedRoute requiredRole="employee">
                <LowStockAlertsPage />
              </ProtectedRoute>
            } />
            <Route path="/employee/pickup-verification" element={
              <ProtectedRoute requiredRole="employee">
                <PickupVerificationPage />
              </ProtectedRoute>
            } />
      
      {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      } />
      </Routes>
      </Suspense>
    </PasswordChangeGuard>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <HelmetProvider>
        <Router>
          <ErrorBoundary>
            <CartProvider>
              <RecentlyViewedProvider>
                <ProductComparisonProvider>
                  <AppContent />
                </ProductComparisonProvider>
              </RecentlyViewedProvider>
            </CartProvider>
          </ErrorBoundary>
        </Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 2000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 2000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 2000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
            loading: {
              duration: 2000,
            },
          }}
        />
      </HelmetProvider>
    </Provider>
  );
};

export default App;
