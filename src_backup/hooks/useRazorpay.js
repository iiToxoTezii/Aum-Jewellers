import { useEffect, useState } from 'react';

export const useRazorpay = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const openCheckout = (options) => {
    if (!isLoaded) {
      alert('Razorpay SDK not loaded yet.');
      return;
    }
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return { isLoaded, openCheckout };
};
