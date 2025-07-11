import { supabase } from "../utils/supabase";

export const ProductService = {
    saveUserProductHistory: async (userEmail: string, userProduct: any, id: string) => {
        try {
            // Validate input
            if (!userEmail || !userProduct || !id) {
                throw new Error('Missing required parameters');
            }
            if (!userProduct.id) {
                throw new Error('Product must have an id');
            }

            const { error: orderError } = await supabase.from('users')
                .update({ orderid: id })
                .eq('email', userEmail);

            if (orderError) {
                throw new Error(`Failed to update order ID: ${orderError.message}`);
            }

            const { data: existingUser, error: fetchError } = await supabase.from('users')
                .select('history')
                .eq('email', userEmail)
                .single();
            if (fetchError) {
                throw new Error(`Failed to fetch user history: ${fetchError.message}`);
            }
            let existingHistory: any[] = [];
            if (existingUser?.history) {
                existingHistory = [...existingUser.history, { ...userProduct, buyDate: new Date().toISOString() }];
            }
            else {
                existingHistory = [userProduct];
            }
            const { data, error: updateError } = await supabase.from('users')
                .update({ history: existingHistory })
                .eq('email', userEmail);

            if (updateError) {
                throw new Error(`Failed to update user history: ${updateError.message}`);
            }
            console.log("1️⃣ User product history saved successfully!");
            return data;
        } catch (error) {
            console.error('❌ Error saving user product history:', error);
            throw error;
        }
    },
    getUserProductHistoryProductId: async (userEmail: string, orderId: string) => {
        try {
            const { data: existingOrder } = await supabase.from('users')
                .select('orderid')
                .eq('email', userEmail)
                .single();
            if (existingOrder?.orderid === null) {
                return true;
            }
            if (existingOrder?.orderid === orderId) {
                console.log("⚠️ Order already exists for user:", userEmail, orderId);
                return false;
            }
            else {
                return true;
            }
        } catch (error) {
            console.error('❌ Error getting user product history:', error);
            return false;
        }
    },
    deleteUserProductHistory: async (userEmail: string, nftAddress: string) => {
        try {
            // Validate input
            if (!userEmail || !nftAddress) {
                throw new Error('Missing required parameters');
            }

            const { data: existingUser, error: fetchError } = await supabase.from('users')
                .select('history')
                .eq('email', userEmail)
                .single();

            if (fetchError) {
                throw new Error(`Failed to fetch user history: ${fetchError.message}`);
            }

            if (!existingUser?.history) {
                return { message: 'No history found for user' };
            }

            // Filter out the item with matching mintAddress
            const updatedHistory = existingUser.history.filter((item: any) => item.mintAddress !== nftAddress);

            // Update the user's history with the filtered array
            const { data, error: updateError } = await supabase.from('users')
                .update({ history: updatedHistory })
                .eq('email', userEmail);

            if (updateError) {
                throw new Error(`Failed to update user history: ${updateError.message}`);
            }

            const newUserHistory = await supabase.from('users') 
                .select('history')
                .eq('email', userEmail)
                .single();

            console.log("✅ User product history item deleted successfully!");
            return newUserHistory;
        } catch (error) {
            console.error('❌ Error deleting user product history:', error);
            throw error;
        }
    }
}