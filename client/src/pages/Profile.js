import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getOrders } from '../store/slices/ordersSlice';
import { format } from 'date-fns';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orders, isLoading } = useSelector((state) => state.orders);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    dispatch(getOrders());
  }, [dispatch]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 mb-6 md:mb-0">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xl">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <div>
                <h2 className="font-bold text-gray-900">{user?.firstName} {user?.lastName}</h2>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
            
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'orders'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                My Orders
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'settings'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'orders' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Order History</h3>
              </div>
              
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="skeleton h-20 rounded"></div>
                  ))}
                </div>
              ) : orders && orders.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <div key={order._id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Order #{order.orderNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(order.createdAt), 'PPP')}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)} capitalize`}>
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-gray-600">
                              <span className="font-medium text-gray-900 mr-2">{item.quantity}x</span>
                              {item.product?.title || 'Unknown Product'}
                            </div>
                            <span className="text-gray-900">€{item.finalPrice.toFixed(2)}</span>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-sm text-gray-500">
                            + {order.items.length - 2} more items
                          </p>
                        )}
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
                        <p className="font-bold text-gray-900">
                          Total: €{order.pricing.total.toFixed(2)}
                        </p>
                        <Link
                          to={`/orders/${order.orderNumber}`}
                          className="text-primary-600 hover:text-primary-800 font-medium text-sm"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                  <Link to="/products" className="btn btn-primary">
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h3>
              <p className="text-gray-500">Account settings functionality coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;