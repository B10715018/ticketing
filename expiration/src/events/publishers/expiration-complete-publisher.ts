import { Subjects,Publisher,ExpirationCompleteEvent } from "@bwptickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
  subject: Subjects.ExpirationComplete=Subjects.ExpirationComplete;
}
