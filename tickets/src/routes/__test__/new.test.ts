import request from 'supertest';
import { app } from '../../app';
import {Ticket} from '../../models/ticket';
import {natsWrapper} from '../../nats-wrapper';

it('has a route handler listening to /api/tickets for post request',async()=>{
  const response= await request(app).post('/api/tickets').send({});

  expect(response.status).not.toEqual(404);
});

it('can only be access if user is signed in',async()=>{
  await request(app).post('/api/tickets').send({}).expect(401);
});

it('return status other than 401 if a user signed in',async()=>{
  const response= await request(app).post('/api/tickets').set('Cookie',global.signin()).send({});
  console.log(response.status);
  expect(response.status).not.toEqual(401);
});

it('return error if invalid title provided',async()=>{
  await request(app).post('/api/tickets').set('Cookie',global.signin()).send({
    title:'',
    price:10
  }).expect(400);

  await request(app).post('/api/tickets').set('Cookie',global.signin()).send({
    price:10
  }).expect(400);

});


it('return error if invalid price provided',async()=>{
  await request(app).post('/api/tickets').set('Cookie',global.signin()).send({
    title:'asakjssdc',
    price:-10
  }).expect(400);

  await request(app).post('/api/tickets').set('Cookie',global.signin()).send({
    title:'asakjssdc'
  }).expect(400);
});

it('create ticket with valid inputs',async()=>{
  //add in check to make sure ticket was save to database
  let tickets= await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const title='asambsdnjks';

  await request(app).post('/api/tickets').set('Cookie',global.signin()).send({
    title,
    price: 20
  }).expect(201);

  tickets=await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(20);
  expect(tickets[0].title).toEqual(title);
  
});

it('publishes an event', async()=>{
  const title='asambsdnjks';

  await request(app).post('/api/tickets').set('Cookie',global.signin()).send({
    title,
    price: 20
  }).expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
