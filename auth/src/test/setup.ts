import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import request from 'supertest';

declare global{
  namespace NodeJS{
    interface Global{
      signin(): Promise<string[]>;
    }
  }
}
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

 global.signin=async()=>{
   const email='test@test.com';
   const password='password';

   const response= await request(app).post('/api/users/signup').send({
     email,password
   }).expect(201);

   const cookie=response.get('Set-Cookie');

   return cookie;
 };