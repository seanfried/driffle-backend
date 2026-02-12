import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts } from '../store/slices/productsSlice';
import ProductCard from '../components/ProductCard';
import Meta from '../components/SEO/Meta';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.products);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fetch featured products
    dispatch(getProducts({ isFeatured: true, limit: 8 }))
      .unwrap()
      .then((data) => setFeaturedProducts(data?.products || []))
      .catch((error) => console.error('Failed to fetch featured products:', error));

    // Fetch sale products
    dispatch(getProducts({ isOnSale: true, limit: 8 }))
      .unwrap()
      .then((data) => setSaleProducts(data?.products || []))
      .catch((error) => console.error('Failed to fetch sale products:', error));
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Meta 
        title="Accueil" 
        description="Bienvenue sur Driffle Marketplace. Découvrez les meilleures offres sur les jeux vidéo, cartes cadeaux et DLC."
      />
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-900 via-purple-900 to-gray-900"></div>
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-600 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute top-1/2 right-0 w-64 h-64 bg-secondary-600 rounded-full blur-3xl opacity-20"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block py-1 px-3 rounded-full bg-primary-900 text-primary-300 text-sm font-semibold mb-6 border border-primary-700">
              New: Driffle Plus is now live!
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
              Unlock Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">Next Adventure</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-gray-300 font-light">
              Instant digital keys for Steam, Xbox, PlayStation, and more at unbeatable prices.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-10 relative">
              <input
                type="text"
                placeholder="Search for games (e.g. Elden Ring, FIFA...)"
                className="w-full px-6 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-primary-500 shadow-xl text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-medium transition-colors"
              >
                Search
              </button>
            </form>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" className="btn btn-primary btn-lg px-8 py-3 text-lg">
                Browse All Games
              </Link>
              <Link to="/subscription" className="btn bg-gray-800 hover:bg-gray-700 text-white btn-lg px-8 py-3 text-lg border border-gray-700">
                Get Driffle Plus
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-white border-b border-gray-200 py-8 shadow-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900">Instant Delivery</h3>
                <p className="text-sm text-gray-500">Get your code immediately</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900">Secure Payment</h3>
                <p className="text-sm text-gray-500">Encrypted transactions</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900">24/7 Support</h3>
                <p className="text-sm text-gray-500">We're here to help</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Games</h2>
              <p className="text-gray-500 mt-1">Curated selection just for you</p>
            </div>
            <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View All <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton h-80 rounded-xl"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts?.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Hot Deals */}
      <section className="py-16 bg-gradient-to-b from-gray-100 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-bold text-gray-900">Hot Deals</h2>
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full uppercase">Limited Time</span>
              </div>
              <p className="text-gray-500 mt-1">Don't miss out on these discounts</p>
            </div>
            <Link to="/products?isOnSale=true" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View All Deals <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {saleProducts?.map((product) => (
              <ProductCard key={product._id} product={product} showDiscount={true} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary-900 relative overflow-hidden">
         <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-secondary-700 rounded-full opacity-20 blur-3xl"></div>
         <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-primary-700 rounded-full opacity-20 blur-3xl"></div>
         
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Join Driffle Plus Today</h2>
          <p className="text-xl mb-10 text-secondary-200 max-w-2xl mx-auto">
            Get exclusive discounts, early access to new releases, and priority support for just €4.99/month.
          </p>
          <Link to="/subscription" className="btn btn-secondary btn-xl px-10 py-4 text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all">
            Start Free Trial
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;