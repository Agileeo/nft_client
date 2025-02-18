import React from 'react';
import { Link } from 'react-router-dom';

const Navigation: React.FC<{ isConnected: boolean }> = ({ isConnected }) => {
  if (!isConnected) return null;

  return (
    <nav className="bg-gray-800 text-white p-4">
      <ul className="flex space-x-4">
        <li>
          <Link to="/mint" className="hover:text-gray-300">Mint NFT</Link>
        </li>
        <li>
          <Link to="/marketplace" className="hover:text-gray-300">Marketplace</Link>
        </li>
        <li>
          <Link to="/monitor" className="hover:text-gray-300">Monitor</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
