import { Hono } from 'hono'
import api from "./src/apiRoutes.js";
import { cors } from 'hono/cors'
import {
    getCookie,
    deleteCookie
  } from 'hono/cookie'

const app = new Hono();
app.use(cors({
    origin: 'https://next-cloudflare-todo.pages.dev',
    credentials: true
}));

//check token middlewear
app.use('/todo',async (c,next)=>{
    const token = getCookie(c,'token');
    if (!token) return  c.json({ ok:false, message: 'token not found' }, 401);
    try {
      const user = await jwt.verify(token, c.env.jwtoken);
      const data = jwt.decode(token)
      if (!user) {
        deleteCookie(c, 'token');
        return  c.json({ ok:false, message: 'Invalid token' }, 401);
      }
      next();
    } catch (error) {
      return c.json({ ok:false, message: 'Server Side Error',error }, 500);
    }
})
app.use('/user',async (c,next)=>{
    const token = getCookie(c,'token');
    if (!token) return  c.json({ ok:false, message: 'token not found' }, 401);
    try {
      const user = await jwt.verify(token, c.env.jwtoken);
      if (!user) {
        deleteCookie(c, 'token');
        return  c.json({ ok:false, message: 'Invalid token' }, 401);
      }
      next();
    } catch (error) {
      return c.json({ ok:false, message: 'Server Side Error',error }, 500);
    }
})
app.route('/api',api);
app.get('/health', async(c) =>{
  return c.text(`all working`)
});

export default app;