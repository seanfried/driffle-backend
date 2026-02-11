import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getCategories, getPlatforms } from '../store/slices/productsSlice';
import ProductCard from '../components/ProductCard';

const Products = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, categories, platforms, isLoading } = useSelector((state) => state.products);

  // Filters state
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    sort: '-createdAt',
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    platform: searchParams.get('platform') || '',
    minPrice: '',
    maxPrice: '',
    isOnSale: searchParams.get('isOnSale') === 'true',
  });

  // Fetch initial data
  useEffect(() => {
    dispatch(getCategories());
    dispatch(getPlatforms());
  }, [dispatch]);

  // Fetch products when filters change
  useEffect(() => {
    dispatch(getProducts(filters));
  }, [dispatch, filters]);

  // Update URL params when filters change
  useEffect(() => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.platform) params.platform = filters.platform;
    if (filters.isOnSale) params.isOnSale = 'true';
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page on filter change
    }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      sort: '-createdAt',
      search: '',
      category: '',
      platform: '',
      minPrice: '',
      maxPrice: '',
      isOnSale: false,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-24">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              <button 
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-800"
              >
                Clear All
              </button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search games..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Category</h3>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="capitalize">{cat}</option>
                ))}
              </select>
            </div>

            {/* Platforms */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Platform</h3>
              <select
                value={filters.platform}
                onChange={(e) => handleFilterChange('platform', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">All Platforms</option>
                {platforms.map((plat) => (
                  <option key={plat} value={plat} className="capitalize">{plat}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Price Range</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            {/* Other Filters */}
            <div className="mb-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.isOnSale}
                  onChange={(e) => handleFilterChange('isOnSale', e.target.checked)}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">On Sale Only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Games Catalog 
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({products?.length || 0} items)
              </span>
            </h1>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="-createdAt">Newest First</option>
              <option value="pricing.basePrice">Price: Low to High</option>
              <option value="-pricing.basePrice">Price: High to Low</option>
              <option value="-ratings.average">Top Rated</option>
            </select>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton h-80 rounded-lg"></div>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} showDiscount={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
              <button
                onClick={clearFilters}
                className="mt-4 btn btn-primary"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination (Simplified for now) */}
          <div className="mt-8 flex justify-center gap-2">
             <button
                onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                disabled={filters.page === 1}
                className="btn btn-outline btn-sm"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">Page {filters.page}</span>
              <button
                onClick={() => handleFilterChange('page', filters.page + 1)}
                disabled={products?.length < filters.limit}
                className="btn btn-outline btn-sm"
              >
                Next
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;