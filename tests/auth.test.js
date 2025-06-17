jest.setTimeout(60000);

require('dotenv').config();
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');

let server;

beforeAll(async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      server = app.listen(0); 
    } catch (err) {
      console.error('DB Connection Failed:', err.message);
    }
  })

afterAll(async () => {
  await mongoose.connection.close();
  if (server) {
    await server.close();  
  }
}); 



describe('Auth API Endpoints', () => {

    const userPayload = {
        first_name: 'Arisekola',
        last_name: 'Kusamotu',
        email: `arisekola${Date.now()}@example.com`,  
        password: 'securepassword'
      };
  test('Register new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(userPayload);
      
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', userPayload.email);
  });

  test('Login user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: userPayload.email,
        password: userPayload.password
      });
  
    
    console.log('Login Response:', res.body);
  
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', userPayload.email);
  });

});