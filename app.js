import { Hono } from 'hono'
import api from "./src/apiRoutes.js";
import { cors } from 'hono/cors'

const app = new Hono();
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.route('/api',api);

export default app;