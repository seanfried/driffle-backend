import React from 'react';
import { Helmet } from 'react-helmet-async';

const Meta = ({ title, description, keywords, image, url }) => {
  const siteTitle = 'Driffle Marketplace';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const siteUrl = window.location.origin;
  const currentUrl = url ? `${siteUrl}${url}` : window.location.href;
  const defaultImage = `${siteUrl}/logo192.png`; // Fallback image

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image || defaultImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={currentUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image || defaultImage} />
      
      {/* Canonical */}
      <link rel="canonical" href={currentUrl} />
    </Helmet>
  );
};

Meta.defaultProps = {
  title: '',
  description: 'Achetez vos jeux vidéo, cartes cadeaux et DLC au meilleur prix sur Driffle Marketplace. Livraison instantanée et sécurisée.',
  keywords: 'jeux vidéo, clés steam, cartes cadeaux, marketplace gaming, pas cher',
  image: null,
  url: null,
};

export default Meta;
