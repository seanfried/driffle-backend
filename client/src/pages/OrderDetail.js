import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { getOrder } from '../store/slices/ordersSlice';
import { format } from 'date-fns';

const OrderDetail = () => {
  const { orderNumber } = useParams();
  const dispatch = useDispatch();
  const { currentOrder: order, isLoading, isError, message } = useSelector((state) => state.orders);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    dispatch(getOrder(orderNumber));
  }, [dispatch, orderNumber]);

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
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
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="loading-spinner mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {message}</span>
          <div className="mt-4">
            <Link to="/profile" className="text-red-800 underline">
              Return to My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/profile" className="text-primary-600 hover:text-primary-800 flex items-center">
          ← Back to My Orders
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Order #{order.orderNumber}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Placed on {order.createdAt ? format(new Date(order.createdAt), 'PPP p') : 'Unknown Date'}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)} capitalize`}>
            {order.status}
          </span>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">
                {order.payment.method} ({order.payment.status})
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {order.user?.email}
              </dd>
            </div>
            {order.shipping && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Shipping Address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {order.shipping.address}, {order.shipping.city}, {order.shipping.postalCode}, {order.shipping.country}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4">Items</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <ul className="divide-y divide-gray-200">
          {order.items.map((item, index) => (
            <li key={index} className="p-4 sm:p-6">
              <div className="flex items-center sm:items-start">
                <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg overflow-hidden sm:w-40 sm:h-40">
                  <img
                    src={item.product?.images[0]?.url || '/placeholder-game.jpg'}
                    alt={item.product?.title}
                    className="w-full h-full object-center object-cover"
                  />
                </div>
                <div className="ml-6 flex-1 text-sm">
                  <div className="font-medium text-gray-900 sm:flex sm:justify-between">
                    <h5>{item.product?.title}</h5>
                    <p className="mt-2 sm:mt-0">€{item.finalPrice.toFixed(2)}</p>
                  </div>
                  <p className="hidden text-gray-500 sm:block sm:mt-2 capitalize">
                    {item.product?.platform} • {item.product?.type}
                  </p>
                  <p className="mt-2 text-gray-500">Quantity: {item.quantity}</p>
                  
                  {/* Digital Codes */}
                  {item.codeDelivered && item.codes && item.codes.length > 0 && (
                    <div className="mt-4 bg-gray-50 p-4 rounded-md border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Activation Codes:</h4>
                      <div className="space-y-2">
                        {item.codes.map((codeObj, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                            <code className="text-primary-700 font-mono font-bold tracking-wider">
                              {codeObj.code}
                            </code>
                            <button
                              onClick={() => copyToClipboard(codeObj.code)}
                              className="text-xs text-gray-500 hover:text-primary-600"
                            >
                              {copiedCode === codeObj.code ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        Instructions: Redeem this code on {item.product?.platform}.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
          <div className="flex justify-between text-base font-medium text-gray-900">
            <p>Subtotal</p>
            <p>€{order.pricing.subtotal.toFixed(2)}</p>
          </div>
          <div className="flex justify-between text-base font-medium text-gray-900 mt-2">
            <p>Tax</p>
            <p>€{order.pricing.tax.toFixed(2)}</p>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-900 mt-4 pt-4 border-t border-gray-200">
            <p>Total</p>
            <p>€{order.pricing.total.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;