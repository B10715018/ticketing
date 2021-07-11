import request from 'supertest';
import {app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order } from '../../models/order';
import mongoose from 'mongoose';

const buildTicket=async()=>{
  const ticket=Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title:'concert',
    price:20
  });

  await ticket.save();

  return ticket;
}
it('fetches order for a particular user',async()=>{
  //create 3 ticket
  const ticket1=await buildTicket();
  const ticket2=await buildTicket();
  const ticket3=await buildTicket();

  const userOne=global.signin();
  const userTwo=global.signin();
  //create 1 order as user number 1
  await request(app).post('/api/orders').set('Cookie',userOne).send({ticketId: ticket1.id}).expect(201);
  //create 2 order as user number 2
  const {body:orderOne}=await request(app).post('/api/orders').set('Cookie',userTwo).send({ticketId: ticket2.id}).expect(201);
  const {body:orderTwo}=await request(app).post('/api/orders').set('Cookie',userTwo).send({ticketId: ticket3.id}).expect(201);
  //request for order that user number 2 has
  const response=await request(app).get('/api/orders').set('Cookie',userTwo).expect(200);

  //make sure only got orders for user number 2

  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(orderOne.id);
  expect(response.body[1].id).toEqual(orderTwo.id);
  expect(response.body[0].ticket.id).toEqual(ticket2.id);
  expect(response.body[1].ticket.id).toEqual(ticket3.id); 
});