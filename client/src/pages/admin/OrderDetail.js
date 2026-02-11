import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrder, updateOrderStatus } from '../../store/slices/ordersSlice';
import AdminLayout from '../../components/Admin/AdminLayout';
import { toast } from 'react-toastify';

const AdminOrderDetail = () => {
  const { orderNumber } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentOrder: order, isLoading, isError, message } = useSelector((state) => state.orders);
  
  const [status, setStatus] = useState('');

  useEffect(() => {
    dispatch(getOrder(orderNumber));
  }, [dispatch, orderNumber]);

  useEffect(() => {
    if (order) {
      setStatus(order.status);
    }
  }, [order]);

  const handleStatusUpdate = async () => {
    try {
      await dispatch(updateOrderStatus({ orderNumber, status })).unwrap();
      toast.success(`Order status updated to ${status}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-indigo-100 text-indigo-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="loading-spinner w-12 h-12"></div>
        </div>
      </AdminLayout>
    );
  }

  if (isError) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {message}</span>
        </div>
        <Link to="/admin/orders" className="text-primary-600 hover:text-primary-800">
          ← Back to Orders
        </Link>
      </AdminLayout>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Link to="/admin/orders" className="text-primary-600 hover:text-primary-800 flex items-center mb-2">
            ← Back to Orders
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
        </div>
        
        <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase">Current Status</label>
            <span className={`mt-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)} capitalize block text-center`}>
              {order.status}
            </span>
          </div>
          <div className="border-l border-gray-200 pl-4">
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Update Status</label>
            <div className="flex space-x-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="form-select text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={status === order.status}
                className="btn btn-primary btn-sm disabled:opacity-50"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {order.items.map((item, index) => (
                <li key={index} className="p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={item.product?.images[0]?.url || '/placeholder.png'}
                        alt={item.product?.title}
                        className="w-full h-full object-center object-cover"
                      />
                    </div>
                    <div className="ml-6 flex-1 text-sm">
                      <div className="font-medium text-gray-900 flex justify-between">
                        <h5>{item.product?.title}</h5>
                        <p>€{item.finalPrice.toFixed(2)}</p>
                      </div>
                      <p className="text-gray-500 capitalize mt-1">
                        {item.product?.platform} • {item.product?.type}
                      </p>
                      <p className="text-gray-500 mt-1">Quantity: {item.quantity}</p>
                      
                      {/* Admin view of codes */}
                      {item.codes && item.codes.length > 0 && (
                        <div className="mt-4 bg-gray-50 p-3 rounded border border-gray-200">
                          <p className="text-xs font-medium text-gray-500 uppercase mb-2">Issued Codes</p>
                          <div className="space-y-1">
                            {item.codes.map((codeObj, idx) => (
                              <div key={idx} className="font-mono text-xs text-gray-700 bg-white p-1 rounded border border-gray-100 inline-block mr-2">
                                {codeObj.code}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Customer</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
                  {order.user?.firstName?.charAt(0) || 'G'}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">
                    {order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest User'}
                  </p>
                  <p className="text-sm text-gray-500">{order.user?.email}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">Contact</p>
                <p className="text-sm text-gray-900">{order.user?.email}</p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Payment & Totals</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-900">€{order.pricing.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="font-medium text-gray-900">€{order.pricing.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount</span>
                <span className="font-medium text-green-600">-€{order.pricing.discount.toFixed(2)}</span>
              </div>
              <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="text-base font-bold text-gray-900">Total</span>
                <span className="text-xl font-bold text-primary-600">€{order.pricing.total.toFixed(2)}</span>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Method</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">{order.payment.method}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    order.payment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.payment.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Shipping Info (if applicable) */}
          {order.shipping && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Shipping Address</h3>
              </div>
              <div className="p-6">
                <address className="not-italic text-sm text-gray-500">
                  <span className="block text-gray-900 font-medium mb-1">
                    {order.shipping.firstName} {order.shipping.lastName}
                  </span>
                  {order.shipping.address}<br />
                  {order.shipping.city}, {order.shipping.postalCode}<br />
                  {order.shipping.country}
                </address>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrderDetail;