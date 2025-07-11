import { supabase } from "../utils/supabase";

const NFTEventService = {
    saveNFTEvent: async (event: string, metadata: any) => {
        try {
            const { data, error } = await supabase.from('tokens').insert({ event, metadata });
            if (error) {
                console.error('❌ Error saving NFT event:', error);
                return null;
            }
            return data;
        } catch (error) {
            console.error('❌ Error saving NFT event:', error);
            return null;
        }
    },
    getNFTAllEvents: async () => {
        try {
            const { data, error } = await supabase.from('tokens').select('*')
            if (error) {
                console.error('❌ Error getting NFT event:', error);
                return null;
            }
            return data;
        } catch (error) {
            console.error('❌ Error getting NFT event:', error);
            return null;
        }
    }
}
export default NFTEventService;