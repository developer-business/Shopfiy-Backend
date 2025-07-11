import { Request, Response } from 'express';
import NFTEventService from "../services/event.service";
        
const NFTEventController = {
    getNFTAllEvents: async (req: Request, res: Response) => {
        try {
            const result = await NFTEventService.getNFTAllEvents();
            res.status(200).json({ message: 'NFT events fetched successfully', result });
        } catch (error: any) {
            console.error('❌ Error fetching NFT events:', error);
            res.status(500).json({ error: 'Failed to fetch NFT events' });
        }
    }
}

export default NFTEventController;