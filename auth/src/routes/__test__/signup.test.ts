import request from 'supertest';
import {app} from '../../app';

it('returns a 201 on successful signup',async()=>{
  //ini syntax supertest yg biasa kalo mayu run test
  return request(app).post('/api/users/signup').send({
    email: 'test@test.com',
    password: 'password'
  })
  .expect(201);
});

it('returns a 400 with an invalid email',async()=>{
  //ini syntax supertest yg biasa kalo mayu run test
  return request(app).post('/api/users/signup').send({
    email: 'testcnzmcbmsom',
    password: 'password'
  })
  .expect(400);
});

it('returns a 400 with an invalid password',async()=>{
  //ini syntax supertest yg biasa kalo mayu run test
  return request(app).post('/api/users/signup').send({
    email: 'testcnzmcbmsom',
    password: 'p'
  })
  .expect(400);
});

it('returns a 400 with missing email and password',async()=>{
  //ini syntax supertest yg biasa kalo mayu run test
  await request(app).post('/api/users/signup').send({
    email:'test@test.com'
  })
  .expect(400);
  //pake await buat multiple request
  await request(app).post('/api/users/signup').send({
    password:'asdfdksdfn'
  })
  .expect(400);
});

it('disallows duplicate email',async()=>{
  //ini syntax supertest yg biasa kalo mayu run test
  await request(app).post('/api/users/signup').send({
    email: 'test@test.com',
    password: 'password'
  })
  .expect(201);

  await request(app).post('/api/users/signup').send({
    email: 'test@test.com',
    password: 'password'
  })
  .expect(400);
});

it('sets a cookie after successful signup',async()=>{
  //ini syntax supertest yg biasa kalo mayu run test
  const response=await request(app).post('/api/users/signup').send({
    email: 'test@test.com',
    password: 'password'
  })
  .expect(201);

  expect(response.get('Set-Cookie')).toBeDefined();
});
