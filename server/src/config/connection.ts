import mongoose, { ConnectOptions } from 'mongoose';
import dotenv from 'dotenv';

mongoose
  .connect('mongodb+srv://bernardjbs:mongo6150@mocart.ni5gw.mongodb.net/pictura?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  } as ConnectOptions)
  .then(() => console.log('connected to MongoDB'));

module.exports = mongoose.connection;
