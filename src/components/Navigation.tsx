import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';

const Navigation: React.FC<{ isConnected: boolean }> = ({ isConnected }) => {
  if (!isConnected) return null;

  return (
    <nav className="bg-gray-800 text-white p-4">
      <ul className="flex space-x-4">
        <li>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Button color="inherit">Home</Button>
          </Link>
        </li>
        <li>
          <Link to="/mint" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Button color="inherit">Mint NFT</Button>
          </Link>
        </li>
        <li>
          <Link to="/marketplace" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Button color="inherit">Marketplace</Button>
          </Link>
        </li>
        <li>
          <Link to="/monitor" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Button color="inherit">Monitor</Button>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
