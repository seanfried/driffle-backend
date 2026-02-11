import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/profile');
  }, [navigate]);

  return null;
};

export default Orders;