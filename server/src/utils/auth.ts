import express from 'express';
import jwt from 'jsonwebtoken';

import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
  path: path.resolve(__dirname, '../../../.env')
});

const secret = process.env.JWT_SECRET as string;
const expiration = '2h';

const authMiddleware = ({ req }: { req: express.Request }) => {
  // allows token to be sent via req.body, req.query, or headers
  let token = req.body.token || req.query.token || req.headers.authorization;

  // ["Bearer", "<tokenvalue>"]
  if (req.headers.authorization) {
    token = token.split(' ').pop().trim();
  }

  if (!token) {
    return req;
  }

  try {
    const { data } = jwt.verify(token, secret, { maxAge: expiration }) as any;
    req.user = data;
  } catch {
    console.log('Invalid token');
  }
  return req;
};

const signToken = ({ firstname, email, userType, _id }: { firstname: string; email: string; userType: string; _id: string }) => {
  const payload = { firstname, email, userType, _id };
  return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
};

export default { authMiddleware, signToken };
