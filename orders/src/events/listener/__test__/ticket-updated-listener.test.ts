import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsWrapper } from "../../../__mocks__/nats-wrapper";
import { Ticket } from "../../../models/ticket";
import mongoose from'mongoose';
import { TicketUpdatedEvent } from "@bwptickets/common";
import { Message } from "node-nats-streaming";

const setup=async()=>{
  //create listener
  //@ts-ignore
  const listener= new TicketUpdatedListener(natsWrapper.client);
  //create and save ticket
  const ticket= Ticket.build({
    id:mongoose.Types.ObjectId().toHexString(),
    title:'concert',
    price:20
  });

  await ticket.save();
  //create fake data object for update
  const data:TicketUpdatedEvent['data']={
    id: ticket.id,
    version: ticket.version+1,
    title:'new concert',
    price:999,
    userId:'ASADS'
  };
  //create fake message object
  //@ts-ignore
  const msg:Message={
    ack: jest.fn()
  };
  //return all of this stuff
  return {msg,data,ticket,listener};
};


it('find , updates and save tickets',async()=>{
  const {msg,data,ticket,listener}=await setup();

  await listener.onMessage(data,msg);

  const updatedTicket=await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});


it('acks the message',async()=>{
  const {msg,data,listener}=await setup();

  await listener.onMessage(data,msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event is in the future version',async()=>{
  const {msg,data,ticket,listener}=await setup();

  data.version=10;
  try{
    await listener.onMessage(data,msg);
  }catch(err)
  {

  }

  expect(msg.ack).not.toHaveBeenCalled();
  
});