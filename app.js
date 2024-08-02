import { Hono } from 'hono'
import api from "./src/apiRoutes.js";
import HashManager from 'preethash';

const app = new Hono();
// app.use('/api', (c,next) => {
//     const hm = new HashManager(undefined,c.env.apikey);
//     const authHeader = c.req.header('Authorization');
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return c.json({ error: "Missing or invalid authorization header" }, 400);
//     }
//     const passwordFromUser = authHeader.split(" ")[1];
//     if (!hm.checkAndStoreHash(passwordFromUser)) {
//       return c.json({ error: "Invalid API key" }, 401);
//     }
//     next()
// })

app.route('/api',api);

export default app;