import mongoose, { ConnectOptions } from 'mongoose';
import { processEnv } from '../utils/processEnv.js';

const  MONGODB_URI= processEnv().MONGODB_URI 

mongoose
  .set('strictQuery', true)
  .connect(MONGODB_URI!, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  } as ConnectOptions)
  .then(() => console.log('connected to MongoDB'));
const db = mongoose.connection;
export default db;
