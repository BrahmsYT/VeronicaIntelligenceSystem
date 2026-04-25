import jwt from 'jsonwebtoken';
import { env } from './config';
export const sign = (payload:any) => jwt.sign(payload, env.jwt, {expiresIn:'7d'});
export const verify = (token:string) => jwt.verify(token, env.jwt);
