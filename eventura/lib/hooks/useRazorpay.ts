'use client';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function useRazorpay() {
  const loadScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const openCheckout = async (options: {
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
    eventTitle: string;
    registrationId: string;
    userName: string;
    userEmail: string;
    onSuccess: (data: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    }) => void;
    onFailure: (error: any) => void;
  }) => {
    const loaded = await loadScript();
    if (!loaded) {
      options.onFailure(new Error('Razorpay SDK failed to load'));
      return;
    }

    const rzp = new window.Razorpay({
      key: options.keyId,
      amount: options.amount,
      currency: options.currency,
      order_id: options.orderId,
      name: 'Eventura',
      description: options.eventTitle,
      image: '/logo.png',
      prefill: {
        name: options.userName,
        email: options.userEmail,
      },
      theme: { color: '#2E3192' },
      handler: (response: any) => {
        options.onSuccess({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: () => {
          options.onFailure(new Error('Payment cancelled by user'));
        },
      },
    });

    rzp.open();
  };

  return { openCheckout };
}
