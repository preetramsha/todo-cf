import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1';
import { user } from './db/schema.js';
import {  insertUser,
          isUsernameAvailable,
          validateUser,
          insertTodo,
          delTodo,
          updTodo,
          getTodos,
          deleteUser
        } from './dbconfig.js';

const api = new Hono();

// api.get('/users',async (c) => {
//   const db = drizzle(c.env.DB);
//   const res = await db.select().from(user).all();
//   return c.json({ok:true, data:res});
// })

api.post('/user',async (c) => {
  const {username, password} = await c.req.json();
  const res = await insertUser(c,username,password);
  if (!res) return c.json({ok:false},400);
  return c.json({ok:true, data:res});
});

api.delete('/user',async (c) => {
  const {username, password} = await c.req.json();
  const res = await deleteUser(c,username,password);
  if (!res) return c.json({ok:false},400);
  return c.json({ok:true, data:res});
});

api.post('/validateuser',async (c) => {
  const {username, password} = await c.req.json();
  const res = await validateUser(c,username,password);
  return c.json({ok:true, isValid:res});
});

api.get('/isusernameavailable',async (c) => {
  const username = c.req.query('username');
  const res = await isUsernameAvailable(c,username);
  return c.json({ok:true, isValid:res});
});

api.post('/todo',async (c) => {
  const {username, desc} = await c.req.json();
  const res = await insertTodo(c,username,desc);
  if (!res) return c.json({ok:false, data:res},400);
  return c.json({ok:true, data:res});
});

api.delete('/todo',async (c) => {
  const {username, tid} = await c.req.json();
  const res = await delTodo(c,username,tid);
  if (!res) return c.json({ok:false, data:res},400);
  return c.json({ok:true});
});

api.patch('/todo',async (c) => {
  const {username, desc, tid} = await c.req.json();
  const res = await updTodo(c,username,desc,tid);
  if (!res) return c.json({ok:false, data:res},400);
  return c.json({ok:true,data:res});
});

api.get('/todo',async (c) => {
  const username = c.req.query('username');
  const res = await getTodos(c,username);
  if (!res) return c.json({ok:false, data:res},400)
  return c.json({ok:true, data:res});
});

export default api;