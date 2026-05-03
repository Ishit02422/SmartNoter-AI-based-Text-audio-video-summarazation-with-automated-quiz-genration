import React, { useState } from 'react';
import axios from 'axios';
import { CreditCard, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const loadScript = (src: string) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Pricing = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePayment = async (amount: number, planName: string) => {
    setLoading(true);
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      setLoading(false);
      return;
    }

    try {
      // 1. Create Order on your backend
      // Replace with your actual backend URL or use the axios instance from your project
      const token = localStorage.getItem('token'); // or however you store auth
      
      const { data } = await axios.post(
        'http://localhost:6001/payment/create-order',
        { amount, currency: 'INR' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!data.success) {
        alert('Server error. Are you sure backend is running?');
        setLoading(false);
        return;
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SkvGWcOe0AOBbG', // Should ideally come from backend or env
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'VideoToText AI',
        description: `Upgrade to ${planName}`,
        order_id: data.order.id,
        handler: async function (response: any) {
          // 3. Verify Payment on Backend
          try {
            const verifyData = await axios.post(
              'http://localhost:6001/payment/verify',
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyData.data.success) {
              alert('Payment Successful! You are now a Premium user.');
              navigate('/dashboard');
            }
          } catch (err) {
            alert('Payment Verification Failed!');
            console.error(err);
          }
        },
        prefill: {
          name: 'Test User',
          email: 'test@example.com',
          contact: '9999999999',
        },
        theme: {
          color: '#4f46e5',
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: 'Pay via UPI / QR Code',
                instruments: [
                  { method: 'upi' }
                ]
              }
            },
            sequence: ['block.upi'],
            preferences: {
              show_default_blocks: true
            }
          }
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error(error);
      alert('Something went wrong during payment initialization.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Upgrade your experience
        </h2>
        <p className="mt-4 text-xl text-gray-600">
          Choose the plan that's right for you and unlock premium AI features.
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-center items-center gap-8">
        
        {/* Free Plan */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 w-full max-w-sm">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Basic Plan</h3>
          <div className="text-4xl font-extrabold text-gray-900 mb-6">₹0 <span className="text-lg font-normal text-gray-500">/forever</span></div>
          <ul className="space-y-4 mb-8">
            <li className="flex items-center text-gray-600"><CheckCircle className="h-5 w-5 text-indigo-500 mr-2" /> 5 Summaries / day</li>
            <li className="flex items-center text-gray-600"><CheckCircle className="h-5 w-5 text-indigo-500 mr-2" /> Short Videos only</li>
            <li className="flex items-center text-gray-600"><CheckCircle className="h-5 w-5 text-indigo-500 mr-2" /> Basic Q&A</li>
          </ul>
          <button disabled className="w-full bg-gray-100 text-gray-500 py-3 px-4 rounded-lg font-medium cursor-not-allowed">
            Current Plan
          </button>
        </div>

        {/* Pro Plan */}
        <div className="bg-gradient-to-b from-indigo-50 to-white rounded-2xl shadow-xl border-2 border-indigo-500 p-8 w-full max-w-sm relative transform scale-105">
          <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg uppercase tracking-wide">
            Most Popular
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Pro Plan</h3>
          <div className="text-4xl font-extrabold text-gray-900 mb-6">₹499 <span className="text-lg font-normal text-gray-500">/month</span></div>
          <ul className="space-y-4 mb-8">
            <li className="flex items-center text-gray-600"><CheckCircle className="h-5 w-5 text-indigo-500 mr-2" /> Unlimited Summaries</li>
            <li className="flex items-center text-gray-600"><CheckCircle className="h-5 w-5 text-indigo-500 mr-2" /> Long Videos & Podcasts</li>
            <li className="flex items-center text-gray-600"><CheckCircle className="h-5 w-5 text-indigo-500 mr-2" /> Flashcards & Mindmaps</li>
            <li className="flex items-center text-gray-600"><CheckCircle className="h-5 w-5 text-indigo-500 mr-2" /> Export to PDF/Word</li>
          </ul>
          <button 
            onClick={() => handlePayment(499, 'Pro Plan')}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition flex justify-center items-center"
          >
            {loading ? 'Processing...' : <><CreditCard className="mr-2 h-5 w-5" /> Buy Pro</>}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Pricing;
