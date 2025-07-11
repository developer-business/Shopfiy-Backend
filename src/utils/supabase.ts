import { createClient } from '@supabase/supabase-js';
import { Client } from 'pg';
import "dotenv/config";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabaseUserKey = process.env.SUPABASE_USER_KEY!;
const supabaseDBPassword = `revenger0412!@#$%`;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to verify connection and create table
export async function SupabaseConnection() {
    let client: Client | null = null;
    try {
        client = new Client({
            user: "postgres." + supabaseUserKey,
            host: "aws-0-us-east-2.pooler.supabase.com",
            database: "postgres",
            password: supabaseDBPassword,
            port: 6543,
        });

        await client.connect();
        console.log('✅ Connected to the database');
        const createUserTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                fullname text,
                email text UNIQUE NOT NULL,
                password text,
                username text UNIQUE,
                avatar text,
                country text,
                interests text,
                emailcommunications boolean,
                hubsstakingInterest boolean,
                updated_at date,
                walletAddress text,
                privateKey text,
                history jsonb ,
                orderid int8,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        const createTokenTableQuery = `
            CREATE TABLE IF NOT EXISTS tokens (
                id SERIAL PRIMARY KEY,
                event text NOT NULL,
                metadata jsonb ,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await client.query(createUserTableQuery);
        await client.query(createTokenTableQuery);
        console.log('✅ Database setup completed successfully');
    } catch (error: any) {
        console.error('❌ Database connection error:', {
            message: error.message,
            code: error.code,
            detail: error.detail
        });
        throw new Error(`Database setup failed: ${error.message}`);
    }
}