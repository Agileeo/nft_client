import React, { useState } from 'react';
import { Contract } from 'ethers';
import { useWallet } from '../context';
import { Box, Button, TextField, Typography, Container, CircularProgress, Switch, FormControlLabel } from '@mui/material';
import NFTCoreABI from '../contracts/NFTCore.json';

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

const MintNFT: React.FC = () => {
  const { provider, account } = useWallet();
  const [metadata, setMetadata] = useState<NFTMetadata>({
    name: '',
    description: '',
    image: '',
    attributes: []
  });
  const [specificTokenId, setSpecificTokenId] = useState(false);
  const [tokenId, setTokenId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateMetadata = () => {
    if (!metadata.name || !metadata.description || !metadata.image) {
      setError('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const uploadToIPFS = async (metadata: NFTMetadata): Promise<string> => {
    // In a real application, you would upload to IPFS here
    // For now, we'll just return a mock URI
    return `ipfs://QmX.../${Date.now()}`; 
  };

  const handleMint = async () => {
    if (!provider || !account) {
      setError('Please connect your wallet first');
      return;
    }

    if (!validateMetadata()) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const tokenURI = await uploadToIPFS(metadata);
      const signer = await provider.getSigner();
      const contract = new Contract(
        process.env.REACT_APP_NFTCORE_CONTRACT_ADDRESS || '',
        NFTCoreABI.abi,
        signer
      );

      let mintTx;
      if (specificTokenId) {
        mintTx = await contract.mintWithTokenId(account, tokenId, tokenURI);
      } else {
        mintTx = await contract.mint(account, tokenURI);
      }
      
      await mintTx.wait();
      setSuccess('NFT minted successfully!');
      
      // Reset form
      setMetadata({
        name: '',
        description: '',
        image: '',
        attributes: []
      });
      setTokenId('');
    } catch (err: any) {
      setError(err.message || 'Error minting NFT');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mint New NFT
        </Typography>

        <Box component="form" noValidate sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Name"
            value={metadata.name}
            onChange={(e) => setMetadata({...metadata, name: e.target.value})}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Description"
            value={metadata.description}
            onChange={(e) => setMetadata({...metadata, description: e.target.value})}
            margin="normal"
            required
            multiline
            rows={3}
          />

          <TextField
            fullWidth
            label="Image URL"
            value={metadata.image}
            onChange={(e) => setMetadata({...metadata, image: e.target.value})}
            margin="normal"
            required
            helperText="Enter the URL for your NFT image"
          />

          <FormControlLabel
            control={
              <Switch
                checked={specificTokenId}
                onChange={(e) => setSpecificTokenId(e.target.checked)}
              />
            }
            label="Use specific Token ID"
          />

          {specificTokenId && (
            <TextField
              fullWidth
              label="Token ID"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              margin="normal"
              required
              type="number"
            />
          )}

          <Button
            fullWidth
            variant="contained"
            onClick={handleMint}
            disabled={loading || !metadata.name || !metadata.description || !metadata.image}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Mint NFT'}
          </Button>

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          {success && (
            <Typography color="success.main" sx={{ mt: 2 }}>
              {success}
            </Typography>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default MintNFT;
