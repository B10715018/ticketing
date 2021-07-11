import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import request from 'supertest';
import jwt from 'jsonwebtoken';

declare global{
  namespace NodeJS{
    interface Global{
      signin(id ?:string): string[];
    }
  }
}
//mock test buat yang NATS
jest.mock('../nats-wrapper');

process.env.STRIPE_KEY='sk_test_51JByV3EWz78eTfa8hNLh6NhrAcnZ1rlVA1hf7Xhw50PatOwORxn09rz0b0MYfEPOaFTydPFJrmiDfqUYTf9X9In200KnwXy6l5';
//ini sebelum mulai semua test
let mongo:any;

beforeAll(async()=>{
  //bikin jwt sembarqngan dlu
  process.env.JWT_KEY='asdf';
  //buat bikin memory server yg baru
  mongo= new MongoMemoryServer();
  //buat bikin url buat nanti ke connect ke db
  const mongoUri= await mongo.getUri();

  await mongoose.connect(mongoUri,{
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

//sebelum jalanin masing" test

beforeEach(async()=>{
  jest.clearAllMocks();
  const collections=await mongoose.connection.db.collections();

  for (let collection of collections)
  {
    await collection.deleteMany({});
  }
});

//stelah kelar jalanin semua testnya

afterAll(async()=>{
  await mongo.stop();
  await mongoose.connection.close();
});

// buat glovbal function buat di test development
//@ts-ignore
 global.signin=(id?:string)=>{
   //build jwt payload {id,email}
   const payload={
     id: id||new mongoose.Types.ObjectId().toHexString(),
     email: 'test@test.com'
   };
   //create JWT
   const token=jwt.sign(payload,process.env.JWT_KEY!);
   //build session object{jwt: MY_JWT}
   const session={jwt: token};
   //turn session to json
   const sessionJSON=JSON.stringify(session);
   //take json encode it as base64
   const base64=Buffer.from(sessionJSON).toString('base64');
   //return a string that cookie with encoded data
   return [`express:sess=${base64}`];
 };