import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import subscriptionService from '../services/subscriptionService';
import { getProfile, logout } from '../store/slices/authSlice';

const Subscription = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      toast.info('Please log in to subscribe');
      navigate('/login');
      return;
    }

    if (user.isPlusMember) {
      toast.info('You are already a Driffle Plus member!');
      return;
    }

    setLoading(true);
    try {
      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await subscriptionService.createSubscription('plus-yearly');
      toast.success('Welcome to Driffle Plus! 🎉');
      await dispatch(getProfile()).unwrap();
      navigate('/profile');
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || 'Subscription failed';
      toast.error(errorMsg);
      
      if (errorMsg === 'Invalid token' || errorMsg === 'Token expired') {
        dispatch(logout());
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Upgrade to Driffle Plus
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Get exclusive discounts, early access, and premium support.
          </p>
        </div>

        <div className="mt-16 bg-white rounded-lg shadow-lg overflow-hidden lg:grid lg:grid-cols-2 lg:gap-4">
          <div className="pt-10 pb-12 px-6 sm:pt-16 sm:px-16 lg:py-16 lg:pr-0 xl:py-20 xl:px-20">
            <div className="lg:self-center">
              <h3 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
                <span className="block">Ready to save more?</span>
                <span className="block text-primary-600">Start your membership today.</span>
              </h3>
              <p className="mt-4 text-lg leading-6 text-gray-500">
                Driffle Plus members save an average of €150 per year on games. Join the club and start saving on every purchase.
              </p>
              <ul className="mt-6 space-y-4">
                {[
                  'Extra 10% off on all games',
                  'Early access to sales',
                  'Priority customer support',
                  'Exclusive member-only deals',
                ].map((item) => (
                  <li key={item} className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-10 pb-12 px-6 sm:pt-16 sm:px-16 lg:py-16 lg:pl-0 xl:py-20 xl:px-20 bg-gray-50 lg:bg-transparent">
            <div className="max-w-lg mx-auto lg:max-w-none">
              <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="px-6 py-8 bg-primary-600 sm:p-10 sm:pb-6">
                  <div className="flex justify-center">
                    <span className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-primary-100 text-primary-700">
                      Annual Plan
                    </span>
                  </div>
                  <div className="mt-4 flex justify-center text-6xl font-extrabold text-white">
                    €29.99
                    <span className="ml-1 text-2xl font-medium text-primary-200 self-end">/year</span>
                  </div>
                </div>
                <div className="px-6 pt-6 pb-8 bg-gray-50 sm:p-10 sm:pt-6">
                  <div className="mt-6">
                    <div className="rounded-md shadow">
                      <button
                        className="flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleSubscribe}
                        disabled={loading || user?.isPlusMember}
                      >
                        {loading ? 'Processing...' : user?.isPlusMember ? 'Active Member' : 'Subscribe Now'}
                      </button>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                      Auto-renews annually. Cancel anytime.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;