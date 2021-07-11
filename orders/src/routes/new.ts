import express,{Request, Response} from 'express';
import mongoose from 'mongoose';
import { requireAuth,validateRequest ,NotFoundError,BadRequestError} from '@bwptickets/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order,OrderStatus } from '../models/order';
import { OrderCreatedPublisher } from '../events/publisher/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';


const router= express.Router();
const EXPIRATION_WINDOW_SECONDS=1*60;

router.post('/api/orders',requireAuth,[
  body('ticketId').not().isEmpty().custom((input:string)=>mongoose.Types.ObjectId.isValid(input)).withMessage('TicketId must be provided')
],validateRequest,async(req:Request,res:Response)=>{
const{ticketId}=req.body;
//find the ticket that user try to order in database
const ticket=await Ticket.findById(ticketId);
if(!ticket)
{
  throw new NotFoundError();
}
//make sure that ticket not yet been reserved
//run query to look at all order and find order where ticket is we just found and order status not cancelled
//if found ticket then reserve
const isReserved=await ticket.isReserved();
if(isReserved)
{
  throw new BadRequestError('Ticket is already reserved');
}
//calculate expiration date for the order
const expiration=new Date();
expiration.setSeconds(expiration.getSeconds()+EXPIRATION_WINDOW_SECONDS); 
//build order save to database
const order= Order.build({
  userId: req.currentUser!.id,
  status: OrderStatus.Created,
  expiresAt: expiration,
  ticket
});
await order.save();
//publish event that order is created
new OrderCreatedPublisher(natsWrapper.client).publish({
  id: order.id,
  version: order.version,
  status: order.status,
  userId: order.userId,
  expiresAt: order.expiresAt.toISOString(),
  ticket:{
    id: ticket.id,
    price: ticket.price,
  }
});

  res.status(201).send(order);

});

export {router as newOrderRouter}; 