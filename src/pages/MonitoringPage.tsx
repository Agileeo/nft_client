import React, { useState, useEffect } from 'react';

export const MonitoringPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const contractAddress = process.env.REACT_APP_NFTCORE_CONTRACT_ADDRESS;
    if (!contractAddress) {
      setError('Failed to fetch contract information');
      console.error('Contract address is missing from environment variables');
    }
  }, []);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div>
      {/* Your component content */}
    </div>
  );
};

export default MonitoringPage;