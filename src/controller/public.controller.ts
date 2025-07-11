import { Request, Response } from 'express';
import { createWallet, mintNFT, transferNFT } from '../utils/publicFeatures';

export const PublicController = {
    mintNFT: async (req: Request, res: Response) => {
        try {
            const { privateKey, metadata } = req.body;
            const result = await mintNFT(privateKey, metadata);
            res.status(200).json({ message: 'NFT minted successfully', result });
        } catch (error) {
            console.error('❌ Error minting NFT:', error);
            res.status(500).json({ error: 'Failed to mint NFT' });
        }
    },
    createWallet: async (req: Request, res: Response) => {
        try {
            const result = await createWallet();
            res.status(200).json({ message: 'Wallet created successfully', result });
        } catch (error) {
            console.error('❌ Error creating wallet:', error);
            res.status(500).json({ error: 'Failed to create wallet' });
        }
    },
    transferNFT: async (req: Request, res: Response) => {
        try {
            const { privateKey, mintAddress, toAddress } = req.body;
            const result = await transferNFT(privateKey, mintAddress, toAddress);
            res.status(200).json({ message: 'NFT transferred successfully', result });
        } catch (error) {
            console.error('❌ Error transferring NFT:', error);
            res.status(500).json({ error: 'Failed to transfer NFT' });
        }
    }
}