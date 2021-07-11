import mongoose from 'mongoose';
import { OrderStatus } from '@bwptickets/common';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/order';
import { Ticket } from '../../../models/ticket';
import { ExpirationCompleteEvent } from '@bwptickets/common';
import { Message } from 'node-nats-streaming';

const setup=async()=>{
  const listener=new ExpirationCompleteListener(natsWrapper.client);

  const ticket= Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title:'concert',
    price: 20
  });

  await ticket.save();

  const order=Order.build({
    status:OrderStatus.Created,
    userId:'asdadsf',
    expiresAt: new Date(),
    ticket,
  });

  await order.save();

  //create event
  const data: ExpirationCompleteEvent['data']={
    orderId: order.id
  };
//@ts-ignore
  const msg:Message={
    ack:jest.fn()
  };

  return{listener,ticket,data,msg,order};
};

//tes ikutin sesuai yg ts nya

it('update order status to cancel',async()=>{
  const{listener,order,ticket,data,msg}=await setup();

  await listener.onMessage(data,msg);

  const updatedOrder=await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emit order cancelled event',async()=>{
  const{listener,order,ticket,data,msg}=await setup();

  await listener.onMessage(data,msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData=JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

  expect(eventData.id).toEqual(order.id);
});

it('acks the message',async()=>{
  const{listener,order,ticket,data,msg}=await setup();

  await listener.onMessage(data,msg);

  expect(msg.ack).toHaveBeenCalled();
});