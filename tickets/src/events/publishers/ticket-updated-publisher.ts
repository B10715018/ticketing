import { Publisher,Subjects,TicketUpdatedEvent } from "@bwptickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
  subject: Subjects.TicketUpdated=Subjects.TicketUpdated;
}