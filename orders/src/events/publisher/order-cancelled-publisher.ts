import { Publisher,OrderCancelledEvent, Subjects } from "@bwptickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
  subject: Subjects.OrderCancelled=Subjects.OrderCancelled;
}