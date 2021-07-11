import { Publisher,Subjects,TicketCreatedEvent } from "@bwptickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
  subject: Subjects.TicketCreated=Subjects.TicketCreated;
}