import { Publisher, OrderCreatedEvent, Subjects } from "@bwptickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>{
  subject: Subjects.OrderCreated=Subjects.OrderCreated;
}
