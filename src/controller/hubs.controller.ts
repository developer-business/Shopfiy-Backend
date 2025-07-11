import { Request, Response } from 'express';
import HubsService from '../services/hubs.service';
import { createWallet } from '../utils/solana';

export const HubsAIController = {
    signUp: async (req: Request, res: Response) => {
        try {
            const { fullname, email, password } = req.body;
            const existUSer = await HubsService.getUserByEmail(email);
            if (!existUSer || existUSer.length === 0) {
                const wallet = await createWallet();
                const walletaddress = wallet.publicKey;
                const privateKey = wallet.privateKey;
                const result = await HubsService.addUser(fullname, email, password, walletaddress, privateKey);
                result === null ? res.status(400).json({ message: 'User Add failed', success: false })
                    : res.status(200).json({ message: 'User added successfully', result: Array.isArray(result) ? result[0] : result, success: true });
            } else {
                const result = await HubsService.updateUser(email, fullname, password);
                result === false ? res.status(400).json({ message: 'User Update failed', success: false })
                    : res.status(200).json({ message: 'User updated successfully', result: Array.isArray(result) ? result[0] : result, success: true });
            }
        } catch (error) {
            console.error('❌ Error adding user:', error);
            res.status(500).json({ error: 'Failed to add user' });
        }
    },
    signIn: async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const result = await HubsService.getUserByEmail(email);
            if (result === null || result.length === 0) {
                res.status(400).json({ error: 'User not found', success: false });
            } else if (result[0].password !== password) {
                res.status(400).json({ error: 'Invalid password', success: false });
            } else {
                return res.status(200).json({ message: 'User sign in successfully', result: result[0], success: true });
            }
        } catch (error) {
            console.error('❌ Error sign in user:', error);
            res.status(500).json({ error: 'Failed to sign in user', success: false });
        }
    },
    claimWalletAddress: async (req: Request, res: Response) => {
        try {
            const { email } = req.body;
            const result = await HubsService.getUserByEmailAndWalletAddress(email);
            if (result === false || !Array.isArray(result)) {
                res.status(400).json({ error: 'User not found', success: false });
            } else {
                return res.status(200).json({ message: 'User found', result: result[0], success: true });
            }
        } catch (error) {
            console.error('❌ Error claiming wallet address:', error);
            res.status(500).json({ error: 'Failed to claim wallet address', success: false });
        }
    },
    setupProfile: async (req: Request, res: Response) => {
        try {

            const { username, country, interests, emailCommunications, hubsStakingInterest, email } = req.body;
            const emailComms = emailCommunications === 'true' || emailCommunications === true;
            const hubsStaking = hubsStakingInterest === 'true' || hubsStakingInterest === true;

            const result = await HubsService.updateUserProfileSetup(
                email,
                username,
                country,
                interests,
                emailComms,
                hubsStaking,
            );

            if (result === false || result === null) {
                res.status(500).json({
                    error: 'Failed to save profile data',
                    success: false
                });
            }

            res.send({
                message: 'Profile setup completed successfully',
                success: true,
                result: Array.isArray(result) ? result[0] : result
            });

        } catch (error) {
            console.error('❌ Error setting up profile:', error);
            res.status(500).json({ error: 'Failed to set up profile', success: false });
        }
    },
    updateProfile: async (req: Request, res: Response) => {
        try {
            const { email, username, country, fullname } = req.body;
            const result = await HubsService.updateUserProfile(email, username, country, fullname);
            if (result === false || result === null) {
                res.status(500).json({ error: 'Failed to update profile', success: false });
            }
            res.status(200).json({ message: 'Profile updated successfully', result: result, success: true });
        } catch (error) {
            console.error('❌ Error updating profile:', error);
            res.status(500).json({ error: 'Failed to update profile', success: false });
        }
    }
}