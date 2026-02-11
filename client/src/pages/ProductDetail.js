import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProduct, clearCurrentProduct } from '../store/slices/productsSlice';
import { addToCart } from '../store/slices/cartSlice';
import { toast } from 'react-toastify';
import ProductCard from '../components/ProductCard';
import Reviews from '../components/Reviews';

const ProductDetail = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { currentProduct: product, isLoading, isError, message } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);
  
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    dispatch(getProduct(slug));
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, slug]);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await dispatch(addToCart({ productId: product._id, quantity })).unwrap();
      toast.success(`${product.title} added to cart!`);
    } catch (error) {
      toast.error(error || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    setAddingToCart(true);
    try {
      await dispatch(addToCart({ productId: product._id, quantity })).unwrap();
      navigate('/cart');
    } catch (error) {
      toast.error(error || 'Failed to add to cart');
      setAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 skeleton h-96 rounded-lg"></div>
          <div className="w-full md:w-1/2 space-y-4">
            <div className="skeleton h-10 w-3/4 rounded"></div>
            <div className="skeleton h-6 w-1/4 rounded"></div>
            <div className="skeleton h-32 w-full rounded"></div>
            <div className="skeleton h-12 w-1/3 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-red-600 mb-6">{message}</p>
          <Link to="/products" className="btn btn-primary">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const finalPrice = product.pricing.salePrice || product.pricing.basePrice;
  const userPrice = user?.isPlusMember 
    ? (product.pricing.plusPrice || finalPrice * 0.9)
    : finalPrice;
    
  const discountPercentage = product.pricing.discountPercentage;
  const isInStock = product.inventory.type === 'unlimited' || product.inventory.quantity > 0;

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-8 text-sm text-gray-500">
          <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-primary-600 transition-colors">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium truncate max-w-xs">{product.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Column: Images */}
          <div className="w-full lg:w-3/5">
            <div className="rounded-xl overflow-hidden shadow-xl bg-white mb-6 border border-gray-100">
              <img
                src={product.images[0]?.url || '/placeholder-game.jpg'}
                alt={product.title}
                className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-500"
              />
            </div>
            
            {/* Features Icons */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
                <div className="text-primary-600 mb-2 flex justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-900 block">Instant Delivery</span>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
                <div className="text-primary-600 mb-2 flex justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-900 block">Secure Payment</span>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
                <div className="text-primary-600 mb-2 flex justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-900 block">Global Support</span>
              </div>
            </div>

            {/* Description Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab('description')}
                    className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'description'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Description
                  </button>
                  <button
                    onClick={() => setActiveTab('requirements')}
                    className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'requirements'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    System Requirements
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'reviews'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Reviews ({product.ratings?.count || 0})
                  </button>
                </nav>
              </div>
              <div className="p-6">
                {activeTab === 'description' ? (
                  <div className="prose max-w-none text-gray-600 leading-relaxed">
                    <p className="whitespace-pre-line">{product.description}</p>
                  </div>
                ) : activeTab === 'requirements' ? (
                  <div className="text-gray-600">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">Minimum</h4>
                        <ul className="space-y-2 text-sm">
                          <li><strong>OS:</strong> Windows 10 (64-bit)</li>
                          <li><strong>Processor:</strong> Intel Core i5 / AMD Ryzen 5</li>
                          <li><strong>Memory:</strong> 8 GB RAM</li>
                          <li><strong>Graphics:</strong> NVIDIA GTX 1060 / AMD RX 580</li>
                          <li><strong>Storage:</strong> 50 GB available space</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">Recommended</h4>
                        <ul className="space-y-2 text-sm">
                          <li><strong>OS:</strong> Windows 10/11 (64-bit)</li>
                          <li><strong>Processor:</strong> Intel Core i7 / AMD Ryzen 7</li>
                          <li><strong>Memory:</strong> 16 GB RAM</li>
                          <li><strong>Graphics:</strong> NVIDIA RTX 3060 / AMD RX 6600</li>
                          <li><strong>Storage:</strong> SSD recommended</li>
                        </ul>
                      </div>
                    </div>
                    <p className="mt-4 text-xs text-gray-400 italic">* System requirements are estimates. Please check official developer site for latest specs.</p>
                  </div>
                ) : (
                  <Reviews product={product} />
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Buy Box */}
          <div className="w-full lg:w-2/5">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 lg:p-8 sticky top-24">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">{product.title}</h1>
              
              {/* Star Rating Header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-5 h-5 ${i < Math.round(product.ratings?.average || 0) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-500">({product.ratings?.count || 0} reviews)</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-gray-900 text-white uppercase tracking-wide">
                  {product.platform}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 uppercase tracking-wide">
                  {product.type}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-800 uppercase tracking-wide">
                  Global Key
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
                <div className="flex items-end gap-3 mb-1">
                  {discountPercentage > 0 ? (
                    <>
                      <span className="text-4xl font-extrabold text-primary-600">€{userPrice.toFixed(2)}</span>
                      <div className="flex flex-col mb-1">
                        <span className="text-sm text-gray-500 line-through">€{product.pricing.basePrice.toFixed(2)}</span>
                        <span className="text-xs font-bold text-error-600">SAVE {discountPercentage}%</span>
                      </div>
                    </>
                  ) : (
                    <span className="text-4xl font-extrabold text-gray-900">€{userPrice.toFixed(2)}</span>
                  )}
                </div>
                {user?.isPlusMember && (
                  <p className="text-xs text-secondary-600 font-bold flex items-center gap-1 mt-1">
                    <span className="w-4 h-4 bg-secondary-100 rounded-full flex items-center justify-center">✓</span>
                    Driffle Plus Price Applied
                  </p>
                )}
              </div>

              <div className="space-y-6">
                {isInStock ? (
                  <>
                    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                      <label className="text-sm font-medium text-gray-700">Quantity</label>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-semibold text-lg">{quantity}</span>
                        <button
                          onClick={() => setQuantity(Math.min(10, quantity + 1))}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={handleBuyNow}
                        disabled={addingToCart}
                        className="w-full btn btn-primary btn-xl text-lg py-4 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                      >
                        {addingToCart ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Processing...
                          </span>
                        ) : (
                          'Buy Now'
                        )}
                      </button>
                      <button
                        onClick={handleAddToCart}
                        disabled={addingToCart}
                        className="w-full btn btn-outline btn-lg py-3 border-2 hover:bg-gray-50"
                      >
                        Add to Cart
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-4">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        In Stock
                      </span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Instant Delivery
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center font-bold border border-red-100">
                    Currently Out of Stock
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">You might also like</h2>
              <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium">View All</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {product.relatedProducts.map((related) => (
                <ProductCard key={related._id} product={related} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;