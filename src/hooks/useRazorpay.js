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
      script.onload = () => {
        setIsLoaded(true);
        resolve(true);
      };
      script.onerror = () => resolve(false);
      
      document.body.appendChild(script);
    });
  }, []);

  const openCheckout = useCallback(async (options) => {
    const res = await loadScript();
    if (!res) {
      alert('Razorpay SDK failed to load. Are you offline?');
      return;
    }
    
    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      
      // Override default modal dismissal behavior if provided
      if (options.modal && options.modal.ondismiss) {
          rzp.on('payment.failed', function (response) {
             // Handle generic failures that aren't user closure
             console.error("Payment failed", response.error);
          });
      }

      rzp.open();
    }
  }, [loadScript]);

  return { openCheckout, isLoaded, loadScript };
};
