import { Hono } from 'hono'
import {  
  insertUser,
  isUsernameAvailable,
  validateUser,
  insertTodo,
  delTodo,
  updTodo,
  getTodos,
  deleteUser
} from './dbconfig.js';
import {
  getCookie,
  setCookie,
  deleteCookie
} from 'hono/cookie'
import jwt from '@tsndr/cloudflare-worker-jwt';

const api = new Hono();

// api.get('/users',async (c) => {
//   const db = drizzle(c.env.DB);
//   const res = await db.select().from(user).all();
//   return c.json({ok:true, data:res});
// })

//done
api.post('/user',async (c) => {
  const {username, password} = await c.req.json();
  const res = await insertUser(c,username,password);
  if (!res) return c.json({ok:false},400);
  const token = await jwt.sign(res,c.env.jwtoken,{expiresIn:'3d'});
  return c.json({ok:true, data:res, token});
});

//done
api.delete('/user',async (c) => {
  const {username, password} = await c.req.json();
  console.log(username,' ', password);
  const res = await deleteUser(c,username,password);
  if (!res) return c.json({ok:false},400);
  return c.json({ok:true, data:res});
});

//also use as a middlewear
api.get('validatetoken',async (c) => {
  const token = getCookie(c,'token');
  if (!token) return  c.json({ ok:false, message: 'token not found' }, 401);
  console.log('token',token);
  try {
    const user = await jwt.verify(token, c.env.jwtoken);
    const data = jwt.decode(token)
    if (!user) return  c.json({ ok:false, message: 'Invalid token' }, 401);
    return c.json({ ok:true, data });
  } catch (error) {
    return c.json({ ok:false, message: 'Server Side Error',error }, 500);
  }
})

//used for login
api.post('/login',async (c) => {
  const {username, password} = await c.req.json();
  if(!username||!password) c.json({ok:false},422);
  const res = await validateUser(c,username,password);
  if(!res.ok) return c.json({ok:false},401);
  const token = await jwt.sign( res.data , c.env.jwtoken, { expiresIn: '1h' });
  if(!token) return c.json({ok:false},401);
  setCookie(c, 'token', token, {
    httpOnly: false,
    secure: true,//change to true when deploying
    sameSite: 'None', 
    path: '/',
    maxAge: 34560000, // 1 hour 
  });
  c.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // Replace with your frontend URL
  c.header('Access-Control-Allow-Credentials', 'true');
  return c.json({ok:true, token });
});

api.post('/logout',async (c) => {
  const deletedCookie = deleteCookie(c, 'token');
  if (!deletedCookie) return c.json({ok:false },400)
  return c.json({ok:true, deleteCookie });
});

//done
api.get('/isusernameavailable',async (c) => {
  const username = c.req.query('username');
  const res = await isUsernameAvailable(c,username);
  return c.json({ok:true, isValid:res});
});

//done
api.post('/todo',async (c) => {
  const {username, desc} = await c.req.json();
  const res = await insertTodo(c,username,desc);
  if (!res) return c.json({ok:false, data:res},400);
  return c.json({ok:true, data:res});
});

//done
api.delete('/todo',async (c) => {
  const {username, tid} = await c.req.json();
  const res = await delTodo(c,username,tid);
  if (!res) return c.json({ok:false, data:res},400);
  return c.json({ok:true});
});

//done
api.patch('/todo',async (c) => {
  const {username, desc, tid} = await c.req.json();
  const res = await updTodo(c,username,desc,tid);
  if (!res) return c.json({ok:false, data:res},400);
  return c.json({ok:true,data:res});
});

//checked
api.get('/todo',async (c) => {
  const username = c.req.query('username');
  const res = await getTodos(c,username);
  if (!res) return c.json({ok:false, data:res},400)
  return c.json({ok:true, data:res});
});

export default api;