import { Ticket } from "../ticket";

it('implement optimistic concurrency control',async()=>{
  //create instance of ticket
  const ticket=Ticket.build({
    title:'concert',
    price: 5,
    userId: '123'
  });

  //save ticket to database
  await ticket.save();

  //fetch ticket twice
  const firstInstance= await Ticket.findById(ticket.id);
  const secondInstance= await Ticket.findById(ticket.id);

  //make two separate changes to ticket that we fetched
  firstInstance!.set({price: 10});
  secondInstance!.set({price:15});
  //save the first ticket
  await firstInstance!.save();
  //save second fetched ticket which will result in error
  try{
    await secondInstance!.save();
  } catch(err)
  {
    return ;
  }
  throw new Error('Should not reach this point');


});

it('increment version on multiple saves',async()=>{
  const ticket= Ticket.build({
    title:'concert',
    price: 20,
    userId:'123',
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect (ticket.version).toEqual(2);

});