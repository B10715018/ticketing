import { Subjects,Publisher,PaymentCreatedEvent } from "@bwptickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent>{
  subject: Subjects.PaymentCreated=Subjects.PaymentCreated;
}
