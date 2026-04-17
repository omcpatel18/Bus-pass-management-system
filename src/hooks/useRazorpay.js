import { useState, useCallback } from 'react';

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

export const useRazorpay = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  const loadScript = useCallback(() => {
    return new Promise((resolve) => {
      if (document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`)) {
        setIsLoaded(true);
        resolve(true);
        return;
      }
      
      const script = document.createElement('script');
      script.src = RAZORPAY_SCRIPT;
      script.async = true;
      script.onload = () => {
        console.log('Razorpay SDK loaded successfully');
        setIsLoaded(true);
        resolve(true);
      };
      script.onerror = (e) => {
        console.error('Razorpay SDK failed to load', e);
        resolve(false);
      };
      
      document.body.appendChild(script);
    });
  }, []);

  const openCheckout = useCallback(async (options) => {
    const res = await loadScript();
    if (!res) {
      if (typeof options?.onPaymentFailed === 'function') {
        options.onPaymentFailed({
          error: {
            code: 'SDK_LOAD_FAILED',
            description: 'Razorpay SDK failed to load. Please check your internet connection.',
          },
        });
      }
      return false;
    }
    
    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response) {
        console.error('Payment failed', response?.error || response);
        if (typeof options?.onPaymentFailed === 'function') {
          options.onPaymentFailed(response);
        }
      });

      try {
        rzp.open();
        return true;
      } catch (e) {
        if (typeof options?.onPaymentFailed === 'function') {
          options.onPaymentFailed({
            error: {
              code: 'CHECKOUT_OPEN_FAILED',
              description: e?.message || 'Unable to open Razorpay checkout.',
            },
          });
        }
        return false;
      }
    }

    if (typeof options?.onPaymentFailed === 'function') {
      options.onPaymentFailed({
        error: {
          code: 'RAZORPAY_UNAVAILABLE',
          description: 'Razorpay is unavailable in this browser context.',
        },
      });
    }
    return false;
  }, [loadScript]);

  return { openCheckout, isLoaded, loadScript };
};
