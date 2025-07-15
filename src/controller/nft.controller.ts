import { Request, Response } from 'express';
import { createWallet, mintNFT, transferNFT } from '../utils/solana';
import { sendMessagetoEmail } from '../utils/gmailNotify';
import { ProductService } from '../services/product.service';
import UserService from '../services/user.service';
import { getAllProducts } from '../utils/getAllproduct';
import dotenv from 'dotenv';
dotenv.config();

export const buyProductController = async (req: Request) => {
    try {
        const { note_attributes, contact_email, line_items, id } = req.body;
        for (let i = 0; i < line_items.length; i++) {
            try {
                const getProductImage = await getAllProducts('image', line_items[i].title);
                const productMetadata = {
                    id: line_items[i].id,
                    title: line_items[i].title.substring(0, 10),
                    description: line_items[i].name,
                    image: getProductImage,
                    symbol: "USD",
                    price: line_items[i].price,
                    quantity: line_items[i].quantity,
                };

                const userInfo = await UserService.getUserByEmail(contact_email);
                let walletaddress = '';
                let privateKey = '';
                if (userInfo && userInfo.length > 0) {
                    walletaddress = userInfo[0].walletaddress;
                    privateKey = userInfo[0].privatekey;
                } else {
                    if (note_attributes.length > 0 && note_attributes[0].name == 'walletAddress' && note_attributes[0].value !== '') {
                        walletaddress = note_attributes[0].value;
                        privateKey = '';
                    }
                    else {
                        const wallet = await createWallet();
                        walletaddress = wallet.publicKey;
                        privateKey = wallet.privateKey;
                    }
                    await UserService.addUser(contact_email, walletaddress, privateKey);
                }

                await new Promise(resolve => setTimeout(resolve, 1000));
                const mintAddress = await mintNFT(productMetadata);

                if (!mintAddress) {
                    throw new Error('Failed to mint NFT');
                }

                console.log("walletaddress:", walletaddress)
                console.log("privateKey:", privateKey)
                await ProductService.saveUserProductHistory(contact_email, { ...productMetadata, mintAddress }, id);
                await new Promise(resolve => setTimeout(resolve, 15000));
                const transfer = await transferNFT(mintAddress, walletaddress);
                if (!transfer) {
                    throw new Error('Failed to transfer NFT');
                }

                try {
                    await sendMessagetoEmail(
                        contact_email,
                        `https://explorer.solana.com/address/${mintAddress}?cluster=devnet`,
                        walletaddress,
                        privateKey,
                        `${process.env.USER_SITE_URL}?id=${id}`
                    );
                } catch (emailError) {
                    console.error('Email sending failed:', emailError);
                }

                console.log(`✔️ NFT ${i + 1} of ${line_items.length} processed successfully`);
            } catch (error) {
                console.error(`❌ Error processing item ${i + 1}:`, error);
                throw error;
            }
        }

    } catch (error) {
        console.error('❌ Error in buyProductController:', error);
    }
};

export const getAllProductsController = async (req: Request, res: Response) => {
    try {
        const products = await getAllProducts('all', 'all');
        res.status(200).json(products);
    } catch (error) {
        console.error('❌ Error in getAllProductsController:', error);
    }
};