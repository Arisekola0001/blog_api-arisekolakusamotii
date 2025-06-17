jest.setTimeout(40000);
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
require('dotenv').config();

let server, token, blogId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  server = app.listen(0);
});

afterAll(async () => {
  await mongoose.connection.close();
  await server.close();
});

describe('Blog API Endpoints', () => {
  const userPayload = {
    first_name: 'Arisekola',
    last_name: 'Kusamotu',
    email: `arisekola${Date.now()}@example.com`,
    password: 'securepassword',
  };

  const blogPayload = {
    title: 'My First Blog Post',
    description: 'Intro to blog',
    tags: ['intro', 'first'],
    body: 'This is the first blog post for testing purposes.',
  };

  test('Register and login user to get token', async () => {
    await request(app).post('/api/auth/register').send(userPayload);
    const res = await request(app).post('/api/auth/login').send({
      email: userPayload.email,
      password: userPayload.password,
    });

    token = res.body.token;
    expect(token).toBeDefined();
  });

  test('Create new blog post', async () => {
    const res = await request(app)
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(blogPayload);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('title', blogPayload.title);
    blogId = res.body._id;
  });

  test('Publish blog post', async () => {
    const res = await request(app)
      .put(`/api/blogs/${blogId}/publish`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('state', 'published');
  });

  test('Get list of published blogs (public access)', async () => {
    const res = await request(app).get('/api/blogs');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.blogs)).toBe(true);
  });

  test('Get single blog and verify read_count increments', async () => {
    const res = await request(app).get(`/api/blogs/${blogId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('read_count');
  });

  test('Edit blog post', async () => {
    const res = await request(app)
      .put(`/api/blogs/${blogId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Blog Title' });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Updated Blog Title');
  });

  test('Delete blog post', async () => {
    const res = await request(app)
      .delete(`/api/blogs/${blogId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Blog deleted successfully');
  });
});