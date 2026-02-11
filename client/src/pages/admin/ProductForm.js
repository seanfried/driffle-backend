import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createProduct, updateProduct, getProduct, reset } from '../../store/slices/productsSlice';
import { toast } from 'react-toastify';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEditMode = !!id;

  const { currentProduct, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.products
  );

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    basePrice: '',
    discountPercentage: 0,
    platform: '',
    type: 'game',
    inventoryType: 'unlimited',
    quantity: 0,
    publisher: '',
    developer: '',
    releaseDate: '',
  });

  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

  useEffect(() => {
    if (isEditMode) {
      dispatch(getProduct(id));
    } else {
      dispatch(reset());
    }
  }, [dispatch, id, isEditMode]);

  const [newKeys, setNewKeys] = useState('');

  useEffect(() => {
    if (isEditMode && currentProduct) {
      setFormData({
        title: currentProduct.title,
        description: currentProduct.description,
        basePrice: currentProduct.pricing.basePrice,
        discountPercentage: currentProduct.pricing.discountPercentage,
        platform: currentProduct.platform,
        type: currentProduct.type,
        inventoryType: currentProduct.inventory.type,
        quantity: currentProduct.inventory.quantity,
        publisher: currentProduct.publisher,
        developer: currentProduct.developer,
        releaseDate: currentProduct.releaseDate ? currentProduct.releaseDate.split('T')[0] : '',
      });
    }
  }, [currentProduct, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const productData = {
      title: formData.title,
      description: formData.description,
      pricing: {
        basePrice: Number(formData.basePrice),
        discountPercentage: Number(formData.discountPercentage),
      },
      platform: formData.platform,
      type: formData.type,
      inventory: {
        type: formData.inventoryType,
        // Quantity is managed by backend for limited stock based on codes count
        // For unlimited, it doesn't matter
        quantity: formData.inventoryType === 'unlimited' ? 999999 : Number(formData.quantity),
      },
      // Pass new keys to backend
      addedKeys: newKeys ? newKeys.split('\n').filter(k => k.trim()) : [],
      publisher: formData.publisher,
      developer: formData.developer,
      releaseDate: formData.releaseDate,
    };

    try {
      if (isEditMode) {
        await dispatch(updateProduct({ id, productData })).unwrap();
        toast.success('Product updated successfully');
      } else {
        await dispatch(createProduct(productData)).unwrap();
        toast.success('Product created successfully');
      }
      navigate('/admin/products');
    } catch (error) {
      toast.error(error || 'Something went wrong');
    }
  };

  if (isLoading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </h1>
        <Link to="/admin/products" className="btn btn-outline">
          Cancel
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
            <select
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">Select Platform</option>
              <option value="steam">Steam</option>
              <option value="xbox">Xbox</option>
              <option value="playstation">PlayStation</option>
              <option value="nintendo">Nintendo</option>
              <option value="uplay">Uplay</option>
              <option value="origin">Origin</option>
              <option value="battle.net">Battle.net</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="game">Game</option>
              <option value="software">Software</option>
              <option value="gift_card">Gift Card</option>
              <option value="dlc">DLC</option>
            </select>
          </div>
        </div>

        {/* Pricing */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (€)</label>
              <input
                type="number"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
              <input
                type="number"
                name="discountPercentage"
                value={formData.discountPercentage}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inventory Type</label>
              <select
                name="inventoryType"
                value={formData.inventoryType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="unlimited">Unlimited (Mocked/Pre-order)</option>
                <option value="limited">Limited (Real Keys)</option>
              </select>
            </div>
            {formData.inventoryType === 'limited' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add Activation Keys <span className="text-gray-500 font-normal">(One per line)</span>
                </label>
                <textarea
                  value={newKeys}
                  onChange={(e) => setNewKeys(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX&#10;YYYY-YYYY-YYYY"
                  rows="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono text-sm"
                ></textarea>
                <p className="mt-1 text-sm text-gray-500">
                  Current Stock: {formData.quantity} keys available.
                  {newKeys && <span className="ml-2 text-green-600">Adding {newKeys.split('\n').filter(k => k.trim()).length} new keys.</span>}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
              <input
                type="text"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Developer</label>
              <input
                type="text"
                name="developer"
                value={formData.developer}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Release Date</label>
              <input
                type="date"
                name="releaseDate"
                value={formData.releaseDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <Link to="/admin/products" className="btn btn-outline">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary">
            {isEditMode ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;