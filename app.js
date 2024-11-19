import './libs/instrument.js';
import * as Sentry from '@sentry/node';
import express from 'express';
import routes from './routes/routes.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
const app = express();
const PORT = 3000;
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/', routes);
app.set('view engine', 'ejs');
Sentry.setupExpressErrorHandler(app);

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

export const io = new Server(server);
io.on('connection', (socket) => {
  console.log('A user connected');
});
