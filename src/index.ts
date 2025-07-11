import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import router from "./router";
import { SupabaseConnection } from './utils/supabase';
import cors from 'cors';
import { buyProductController } from './controller/nft.controller';
import { ProductService } from './services/product.service';
import { getAllProducts } from './utils/getAllproduct';
dotenv.config();

const app = express();
const port = process.env.PORT || 1001;
const corsOptions = {
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'FETCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.raw());

app.use('/api', router);
SupabaseConnection();

app.post('/webhooks/orders/paid', express.json(), async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ message: 'Webhook received' });
    console.log("--------------------------------  Order received  --------------------------------");
    const result = await ProductService.getUserProductHistoryProductId(req.body.contact_email, req.body.id);
    if(result){
      await buyProductController(req);
    }
    else{
      res.status(400).json({ message: 'already purchased' });
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});