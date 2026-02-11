import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, showDiscount = false }) => {
  const discountPercentage = product.pricing.discountPercentage;
  const finalPrice = product.pricing.salePrice || product.pricing.basePrice;
  
  return (
    <div className="card hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        {showDiscount && discountPercentage > 0 && (
          <div className="absolute top-2 right-2 bg-error-500 text-white px-2 py-1 rounded text-xs font-semibold">
            -{discountPercentage}%
          </div>
        )}
        <Link to={`/products/${product.slug}`}>
          <img
            src={product.images[0]?.url || '/placeholder-game.jpg'}
            alt={product.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        </Link>
      </div>
      <div className="card-body">
        <Link to={`/products/${product.slug}`} className="hover:text-primary-600 transition-colors">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.title}</h3>
        </Link>
        <p className="text-sm text-gray-600 mb-3 capitalize">{product.platform}</p>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {discountPercentage > 0 ? (
              <>
                <span className="text-sm text-gray-500 line-through">
                  €{product.pricing.basePrice.toFixed(2)}
                </span>
                <span className="text-lg font-bold text-error-600">
                  €{finalPrice.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                €{finalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <Link
            to={`/products/${product.slug}`}
            className="btn btn-primary btn-sm"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;