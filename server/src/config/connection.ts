import mongoose, { ConnectOptions } from 'mongoose';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(__dirname, '../../.env')
});

mongoose
  .connect('mongodb+srv://bernardjbs:mongo6150@mocart.ni5gw.mongodb.net/pictura?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  } as ConnectOptions)
  .then(() => console.log('connected to MongoDB'));
const db = mongoose.connection;
export default db;

