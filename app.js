import { Hono } from 'hono'
import api from "./src/apiRoutes.js";
import HashManager from 'preethash';

const app = new Hono();

app.route('/api',api);

export default app;