import { TicketCreatedListener } from "../ticket-created-listener";
import { TicketCreatedEvent } from "@bwptickets/common";
import { natsWrapper } from "../../../__mocks__/nats-wrapper";
import mongoose from 'mongoose';
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";

const setup=async()=>{
    //create instance of listener
    //@ts-ignore
  const listener = new TicketCreatedListener(natsWrapper.client);
  //create fake object with id,version, etc(event)
  const data: TicketCreatedEvent['data']={
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title:'concert',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString()
  };
  //CREATE fake message object
  //@ts-ignore
  const msg:Message={
    ack: jest.fn()
  };

  return {listener,data,msg};
};


it('creates and save a ticket',async()=>{
  const{listener,data,msg}=await setup();

  //call the on message function with data and message object
  await listener.onMessage(data,msg);
  //write assertion make sure ticket was created
  const ticket= await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it('acks the message', async()=>{
  const {data,listener,msg}=await setup();
  //call the on message function with data and message object
  await listener.onMessage(data,msg);
  //write assertion make sure ack is called
  expect(msg.ack).toHaveBeenCalled();
});