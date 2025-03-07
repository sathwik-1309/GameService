import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import gameRoutes from './routes/gameRoutes';
import { WebSocketManager } from './websockets/webSocketManager';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(express.json());
app.use('/games', gameRoutes);

WebSocketManager.initialize(io);

// Prevent server from running during tests
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export { app, server, io };