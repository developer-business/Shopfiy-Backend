import { Request, Response } from 'express';
import UserService from '../services/user.service';
import { transferNFTToUser } from '../utils/solana';
import { ProductService } from '../services/product.service';

export const UserController = {
    addUser: async (req: Request, res: Response) => {
        try {
            const { email, walletAddress, privateKey } = req.body;
            const existUSer = await UserService.getUserByEmail(email);
            if (!existUSer || existUSer.length === 0) {
                const result = await UserService.addUser(email, walletAddress, privateKey);
                result === null ? res.status(400).json({ message: 'User Add failed' })
                    : res.status(200).json({ message: 'User added successfully' });
            } else {
                res.status(200).json({ message: 'User already exists' });
            }
        } catch (error) {
            console.error('❌ Error adding user:', error);
            res.status(500).json({ error: 'Failed to add user' });
        }
    },
    transferNFT: async (req: Request, res: Response) => {
        try {
            const { transferAddress, NFTAddress, userEmail } = req.body;
        
            const getUserInfo = await UserService.getUserByEmail(userEmail);
            if (!getUserInfo || getUserInfo.length === 0 || getUserInfo[0].privatekey === null || getUserInfo[0].privatekey === undefined || getUserInfo[0].privatekey === '' || getUserInfo[0].privatekey === 'null' || getUserInfo[0].privatekey === 'undefined' || getUserInfo[0].privatekey === 'null' || getUserInfo[0].privatekey === 'undefined') {
                throw new Error('User not found');
            }
            const userWalletPrivateKey = getUserInfo[0].privatekey;
            console.log("‼️userWalletPrivateKey:", userWalletPrivateKey)
            const transferNFT = await transferNFTToUser(NFTAddress, transferAddress, userWalletPrivateKey);
            console.log("transferNFT:", transferNFT)
            if (transferNFT === false) {
                return res.status(400).json({ message: 'NFT transfer failed' });
            }
            const netUserNft = await ProductService.deleteUserProductHistory(userEmail, NFTAddress);
            return res.status(200).json({
                message: 'NFT transferred successfully',
                status: transferNFT,
                result: netUserNft
            });
        } catch (error) {
            console.error('❌ Error fetching users:', error);
            res.status(500).json({ error: 'Failed to fetch users', status: false });
        }
    },
    getUserNFTs: async (req: Request, res: Response) => {
        try {
            const { email } = req.body;
            const result = await UserService.getUserByEmail(email);
            if (!result || result.length === 0) {
                return res.status(400).json({ message: 'User fetch failed' });
            }
            const history = result[0].history || [];
            return res.status(200).json({
                message: 'User fetched successfully',
                result: history
            });
        } catch (error) {
            console.error('❌ Error fetching user by email:', error);
            res.status(500).json({ error: 'Failed to fetch user by email' });
        }
    },
    getAllUsers: async (req: Request, res: Response) => {
        try {
            const result = await UserService.getAllUsers();
            return res.status(200).json({
                message: 'Users fetched successfully',
                result: result
            });
        } catch (error) {
            console.error('❌ Error fetching all users:', error);
            res.status(500).json({ error: 'Failed to fetch all users' });
        }
    },
    updateUser: async (req: Request, res: Response) => {
        try {
            const { id, email, fullname, password } = req.body;
            const result = await UserService.updateUser(id, email, fullname, password);
            if (result === false) {
                res.status(500).json({ error: 'Failed to update user' });
            }
            return res.status(200).json({ message: 'User updated successfully', result: result });
        } catch (error) {
            console.error('❌ Error updating user:', error);
            res.status(500).json({ error: 'Failed to update user' });
        }
    },
    getUserWallet: async (req: Request, res: Response) => {
        try {
            const { id } = req.body;
            const result = await UserService.getUserWallet(id);
            return res.status(200).json({ message: 'User wallet fetched successfully', result: result });
        } catch (error) {
            console.error('❌ Error fetching user wallet:', error);
            res.status(500).json({ error: 'Failed to fetch user wallet' });
        }
    }
}