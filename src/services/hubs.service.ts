import { supabase } from "../utils/supabase";

const HubsService = {
    getUserByEmail: async (email: string) => {
        try {
            const { data, error } = await supabase.from('users').select('*').eq('email', email);
            if (error) {
                console.error('❌ Error getting user by email:', error);
                return null;
            }
            return data;
        } catch (error) {
            console.error('❌ Error getting user by email:', error);
            return null;
        }
    },
    addUser: async (fullname: string, email: string, password: string, walletaddress: string, privatekey: string) => {
        try {
            const { data, error } = await supabase.from('users').insert({ fullname, email, password, walletaddress, privatekey });
            if (error) {
                console.error('❌ Error adding user:', error);
                return false;
            }
            const { data: userData, error: userError } = await supabase.from('users').select('*').eq('email', email);
            if (userError) {
                return false;
            }
            return userData;
        } catch (error) {
            console.error('❌ Error adding user:', error);
            return null;
        }
    },
    updateUser: async (email: string, fullname: string, password: string) => {
        try {
            const { data, error } = await supabase.from('users').update({ fullname, password }).eq('email', email);
            if (error) {
                return false
            }
            const { data: userData, error: userError } = await supabase.from('users').select('*').eq('email', email);
            if (userError) {
                return false;
            }
            return userData;
        } catch (error) {
            console.error('❌ Error updating user:', error);
            return null;
        }
    },
    getUserByEmailAndWalletAddress: async (email: string) => {
        try {
            const { data, error } = await supabase.from('users').select('walletaddress').eq('email', email);
            if (error) {
                return false;
            }
            return data;
        } catch (error) {
            console.error('❌ Error getting user by email and wallet address:', error);
            return null;
        }
    },
    updateUserProfileSetup: async (
        email: string,
        username: string,
        country: string,
        interests: any,
        emailCommunications: boolean,
        hubsStakingInterest: boolean,
        avatarUrl?: string
    ) => {
        try {
            const updateData: any = {
                username,
                country,
                interests: Array.isArray(interests) ? interests : [],
                updated_at: new Date().toISOString()
            };

            if (avatarUrl) {
                updateData.avatar = avatarUrl;
            }
            const { data, error } = await supabase
                .from('users')
                .update(updateData)
                .eq('email', email);

            if (error) {
                console.error('❌ Error updating user profile setup:', error);
                return false;
            }

            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('email', email);

            if (userError) {
                console.error('❌ Error getting updated user data:', userError);
                return false;
            }

            return userData;
        } catch (error) {
            console.error('❌ Error updating user profile setup:', error);
            return null;
        }
    },
    updateUserProfile: async (email: string, username: string, country: string, fullname: string) => {
        try {
            const { data, error } = await supabase.from('users').update({ username, country, fullname }).eq('email', email);
            if (error) {
                return false;
            }
            const { data: userData, error: userError } = await supabase.from('users').select('*').eq('email', email);
            if (userError) {
                return false;
            }
            return userData;
        } catch (error) {
            console.error('❌ Error updating user profile:', error);
            return null;
        }
    }
}
export default HubsService;
