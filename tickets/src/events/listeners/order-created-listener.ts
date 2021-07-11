import { Listener, OrderCreatedEvent,Subjects } from "@bwptickets/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
  subject: Subjects.OrderCreated=Subjects.OrderCreated;
  queueGroupName=queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'],msg:Message){
    //find ticket that order is reserving
    const ticket=await Ticket.findById(data.ticket.id);
    //if no ticket throw error
    if(!ticket)
    {
      throw new Error('Ticket not found');
    }
    //mark ticket as reserve by setting order id
    ticket.set({orderId: data.id});
    //save ticket
    await ticket.save();
    //listener that publish event
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      orderId: ticket.orderId,
      version: ticket.version
    });
    //ack message
    msg.ack();
  }
}