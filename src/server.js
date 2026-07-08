import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { Server } from "socket.io";
import { socketCtrl } from "./controllers/socket.controller.js";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import userRouter from "./routes/user.routes.js";
import documentRouter from "./routes/document.routes.js";
import uploadRouter from "./routes/upload.routes.js";
import dbConnect from "./utils/dbConnect.js";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const DEFAULT_PORT = 8080;

function getPortCandidates(startPort) {
  // Try up to 20 ports to avoid EADDRINUSE during dev.
  return Array.from({ length: 20 }, (_, i) => startPort + i);
}

async function listenWithFallback(app, ioInitFn) {
  const startPort = Number(process.env.PORT) || DEFAULT_PORT;
  const candidates = getPortCandidates(startPort);

  for (const port of candidates) {
    try {
      const server = app.listen(port, async () => {
        await dbConnect();
        console.log(`Server is running on http://localhost:${port}`);
      });

      // Attach socket.io only after we successfully bound.
      const io = new Server(server, {
        pingTimeout: 60000,
        cors: {
          origin: '*',
          methods: ['GET', 'POST']
        },
      });

      ioInitFn(io);
      return;
    } catch (err) {
      if (err && err.code === 'EADDRINUSE') {
        console.warn(`Port ${port} is in use. Trying ${port + 1}...`);
        continue;
      }
      throw err;
    }
  }

  throw new Error(`No available port found in range ${startPort}-${startPort + 19}`);
}

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, 'client', 'dist')));

app.use('/api/v1/users', userRouter);
app.use('/api/v1/documents', documentRouter);
app.use('/api/v1/documents', uploadRouter);


app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

listenWithFallback(app, (io) => {
  socketCtrl(io);
});

