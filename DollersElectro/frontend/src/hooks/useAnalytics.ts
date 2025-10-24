import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Analytics event types
export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

// E-commerce specific events
export interface EcommerceEvent {
  event: 'purchase' | 'add_to_cart' | 'remove_from_cart' | 'view_item' | 'begin_checkout';
  currency: string;
  value: number;
  items: Array<{
    item_id: string;
    item_name: string;
    category: string;
    quantity: number;
    price: number;
  }>;
}

// User behavior events
export interface UserBehaviorEvent {
  event: 'page_view' | 'scroll' | 'click' | 'search' | 'sign_up' | 'login';
  page_title: string;
  page_location: string;
  custom_parameters?: Record<string, any>;
}

export const useAnalytics = () => {
  const location = useLocation();

  // Track page views
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  // Initialize analytics
  useEffect(() => {
    initializeAnalytics();
  }, []);

  const initializeAnalytics = () => {
    // Initialize Google Analytics (if available)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.REACT_APP_GA_MEASUREMENT_ID || 'GA_MEASUREMENT_ID', {
        page_title: document.title,
        page_location: window.location.href,
      });
    }
  };

  const trackPageView = (path: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.origin + path,
        page_path: path,
      });
    }
  };

  const trackEvent = (event: AnalyticsEvent) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
      });
    }
  };

  const trackEcommerceEvent = (event: EcommerceEvent) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.event, {
        currency: event.currency,
        value: event.value,
        items: event.items,
      });
    }
  };

  const trackUserBehavior = (event: UserBehaviorEvent) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.event, {
        page_title: event.page_title,
        page_location: event.page_location,
        ...event.custom_parameters,
      });
    }
  };

  // E-commerce specific tracking functions
  const trackProductView = (product: any) => {
    trackEcommerceEvent({
      event: 'view_item',
      currency: 'LKR',
      value: product.price,
      items: [{
        item_id: product._id,
        item_name: product.name,
        category: product.category,
        quantity: 1,
        price: product.price,
      }],
    });
  };

  const trackAddToCart = (product: any, quantity: number = 1) => {
    trackEcommerceEvent({
      event: 'add_to_cart',
      currency: 'LKR',
      value: product.price * quantity,
      items: [{
        item_id: product._id,
        item_name: product.name,
        category: product.category,
        quantity,
        price: product.price,
      }],
    });
  };

  const trackPurchase = (order: any) => {
    const items = order.items.map((item: any) => ({
      item_id: item.product._id,
      item_name: item.product.name,
      category: item.product.category,
      quantity: item.quantity,
      price: item.product.price,
    }));

    trackEcommerceEvent({
      event: 'purchase',
      currency: 'LKR',
      value: order.total,
      items,
    });
  };

  const trackSearch = (searchTerm: string, resultsCount: number) => {
    trackEvent({
      action: 'search',
      category: 'engagement',
      label: searchTerm,
      value: resultsCount,
    });
  };

  const trackUserAction = (action: string, category: string, label?: string) => {
    trackEvent({
      action,
      category,
      label,
    });
  };

  return {
    trackPageView,
    trackEvent,
    trackEcommerceEvent,
    trackUserBehavior,
    trackProductView,
    trackAddToCart,
    trackPurchase,
    trackSearch,
    trackUserAction,
  };
};

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

