import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getCart } from '../store/slices/cartSlice';
import { createOrder } from '../store/slices/ordersSlice';
import { toast } from 'react-toastify';

const AddressForm = ({ formData, handleChange }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
    <h2 className="text-xl font-bold text-gray-900 mb-4">Billing Details</h2>
    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-gray-700">Address</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-2 border"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">City</label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-2 border"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Postal Code</label>
        <input
          type="text"
          name="postalCode"
          value={formData.postalCode}
          onChange={handleChange}
          required
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-2 border"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-gray-700">Country (Code)</label>
        <input
          type="text"
          name="country"
          value={formData.country}
          onChange={handleChange}
          placeholder="US, FR, GB..."
          required
          maxLength={2}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-2 border"
        />
      </div>
    </div>
  </div>
);

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, subtotal, isLoading } = useSelector((state) => state.cart);
  
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.address || !formData.city || !formData.postalCode || !formData.country) {
      toast.error('Please fill in all billing details');
      return;
    }

    try {
      const orderData = {
        paymentMethodId: 'mock_payment',
        shippingAddress: formData,
        billingAddress: formData,
        items: items.map(item => ({
          product: item.product._id,
          quantity: item.quantity
        }))
      };

      const result = await dispatch(createOrder(orderData)).unwrap();
      toast.success('Order placed successfully (Mock Payment)!');
      navigate(`/orders/${result.data.order.orderNumber}`);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Payment failed.');
    }
  };

  if (isLoading && !items.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <div className="loading-spinner mx-auto"></div>
        <p className="mt-4">Loading checkout...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">Add some games to your cart to proceed to checkout.</p>
        <a href="/products" className="btn btn-primary">Browse Games</a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout (Test Mode)</h1>
      
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        {/* Order Summary */}
        <div className="lg:col-span-5 mb-8 lg:mb-0 lg:order-2">
          <div className="bg-gray-50 p-6 rounded-lg sticky top-24">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
            <ul className="divide-y divide-gray-200">
              {items.map((item) => (
                <li key={item._id} className="py-4 flex">
                  <img
                    src={item.product.images[0]?.url || '/placeholder-game.jpg'}
                    alt={item.product.title}
                    className="flex-none w-16 h-16 rounded-md object-cover bg-gray-200"
                  />
                  <div className="ml-4 flex-auto">
                    <h3 className="font-medium text-gray-900">{item.product.title}</h3>
                    <p className="text-gray-500 text-sm">{item.quantity} x €{item.userPrice.toFixed(2)}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>Subtotal</p>
                <p>€{subtotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-base font-medium text-gray-900 mt-2">
                <p>Total</p>
                <p>€{subtotal.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="lg:col-span-7 lg:order-1">
          <form onSubmit={handleSubmit}>
            <AddressForm formData={formData} handleChange={handleChange} />
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                You are in Test Mode. No real payment will be processed. Click "Pay" to simulate a successful transaction.
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : `Simulate Payment (€${subtotal.toFixed(2)})`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;