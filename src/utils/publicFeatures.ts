import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplTokenMetadata, createNft, burnV1, TokenStandard, transferV1 } from "@metaplex-foundation/mpl-token-metadata";
import { keypairIdentity, percentAmount, generateSigner, publicKey } from "@metaplex-foundation/umi";
import bs58 from "bs58";
import { mockStorage } from "@metaplex-foundation/umi-storage-mock";
import NFTEventService from "../services/event.service";
import dotenv from "dotenv";
dotenv.config();

const solanaRpcUrl = process.env.SOLANA_RPC_URL;
const umi = createUmi(solanaRpcUrl || "");

export const createWallet = async () => {
    const wallet = generateSigner(umi);
    return { publicKey: wallet.publicKey.toString(), privateKey: bs58.encode(wallet.secretKey) };
}

const pinataApiKey = process.env.PINATA_API_KEY;
const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;

async function uploadMetadataToPinata(metadata: any): Promise<string> {
    try {
        const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'pinata_api_key': pinataApiKey || '',
                'pinata_secret_api_key': pinataSecretApiKey || '',
            },
            body: JSON.stringify(metadata)
        });
        const data = await res.json();
        const ipfsHash = data.IpfsHash;
        return ipfsHash;
    } catch (error) {
        console.error("ERROR------> NFT minting failed:", error);
        return "false";
    }
}

export const mintNFT = async (privateKey: string, metadata: any): Promise<string> => {
    try {
        const umiKeypair = umi.eddsa.createKeypairFromSecretKey(bs58.decode(privateKey || ""));
        umi.use(keypairIdentity(umiKeypair))
            .use(mplTokenMetadata())
            .use(mockStorage());

        const mint = generateSigner(umi);
        const minimalMetadata = {
            name: metadata.title,
            description: metadata.description,
            symbol: metadata.symbol,
            price: metadata.price,
            image: metadata.image,
            attributes: [
                {
                    trait_type: "quantity",
                    value: metadata.quantity
                },

            ],
        };

        const metadataHash = await uploadMetadataToPinata(minimalMetadata);
        let metadataUrl = `https://ipfs.io/ipfs/${metadataHash}`;

        await createNft(umi, {
            mint,
            name: metadata.title,
            symbol: metadata.symbol,
            uri: metadataUrl,
            sellerFeeBasisPoints: percentAmount(0),
            isMutable: true,
            creators: [{
                address: umi.identity.publicKey,
                verified: true,
                share: 100,
            }],
            collection: null,
            uses: null,
        }).sendAndConfirm(umi, {
            send: {
                commitment: "finalized",
                preflightCommitment: "confirmed"
            }
        });
        await NFTEventService.saveNFTEvent("mint", { ...metadata, mintAddress: mint.publicKey.toString(), createAuthor: umi.identity.publicKey.toString() });
        return mint.publicKey.toString()
    } catch (error: any) {
        console.error("ERROR------> NFT minting failed:", error);
        return "false";
    }
}

export const burnNFT = async (privateKey: string, mintAddress: string) => {
    try {
        const umiKeypair = umi.eddsa.createKeypairFromSecretKey(bs58.decode(privateKey || ""));
        umi.use(keypairIdentity(umiKeypair))
            .use(mplTokenMetadata())
            .use(mockStorage());

        if (!mintAddress) {
            throw new Error("Mint address is required");
        }

        const mint = publicKey(mintAddress);

        await burnV1(umi, {
            mint,
            authority: umi.identity,
            tokenStandard: TokenStandard.NonFungible,
        }).sendAndConfirm(umi, {
            send: { commitment: "finalized" }
        });
        console.log("✅ NFT burned successfully!");
        await NFTEventService.saveNFTEvent("burn", { mintAddress, burnAuthor: umi.identity.publicKey.toString() });
    } catch (error: any) {
        const errorMessage = error.message || "Unknown error occurred while burning NFT";
        console.error("ERROR------> NFT burning failed:", errorMessage);
        return { success: false, error: errorMessage };
    }
};

export const transferNFT = async (privateKey: string, mintAddress: string, toAddress: string) => {
    try {
        const umiKeypair = umi.eddsa.createKeypairFromSecretKey(bs58.decode(privateKey || ""));
        umi.use(keypairIdentity(umiKeypair))
            .use(mplTokenMetadata())
            .use(mockStorage());
        const mint = publicKey(mintAddress);
        const to = publicKey(toAddress);

        const result = await transferV1(umi, {
            mint,
            authority: umi.identity,
            tokenOwner: umi.identity.publicKey,
            destinationOwner: to,
            tokenStandard: TokenStandard.NonFungible,
        }).sendAndConfirm(umi, {
            send: { commitment: "finalized" }
        });
        const txHash = bs58.encode(result.signature);
        await NFTEventService.saveNFTEvent("transfer", { mintAddress, transferAuthor: umi.identity.publicKey.toString(), receiver: toAddress });
        return { success: true, txHash };
    } catch (error: any) {
        const errorMessage = error.message || "Unknown error occurred while transferring NFT";
        console.error("ERROR------> NFT transferring failed:", errorMessage);
        return false;
    }
}