import nats from 'node-nats-streaming';
import {TicketCreatedPublisher} from './events/ticket-created-publisher';
console.clear();

//stan === client
const stan=nats.connect('ticketing','abc',{
  url:'http://localhost:4222',
});

//listener
stan.on('connect',async()=>{
  console.log('Publisher connected to NATs');

  const publisher= new TicketCreatedPublisher(stan);
  try{
    await publisher.publish({
      id:'123',
      title:'concert',
      price:20
    });
} catch(err)
{
  console.log(err);
}
//   const data=JSON.stringify({
//     id: '123',
//     title: 'concert',
//     price: 20
//   });
// //masukin ke channel di nats streaming server
//   stan.publish('ticket:created',data,()=>{
//     console.log('Published event');
//   });

});