import nats from 'node-nats-streaming';
import {randomBytes} from 'crypto';
import {TicketCreatedListener} from './events/ticket-created-listener';

console.clear();

const stan=nats.connect('ticketing',randomBytes(4).toString('hex'),{
  url:'http://localhost:4222'
});

//watch for event
stan.on('connect',()=>{
  console.log('connected to NATS');
//kalo close connection
  stan.on('close',()=>{
    console.log('Connection is closed');
    process.exit();
  });
//queue group buat 2 service yg sama tp dapat hasil dibagi ke salah satu aja
new TicketCreatedListener(stan).listen();
});
//signal interupt kek rs
process.on('SIGINT',()=>stan.close());
//signal terminate kek ctrl + c
process.on('SIGTERM',()=>stan.close());

