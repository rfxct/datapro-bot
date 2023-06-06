import express from 'express';
import cors from 'cors';

import SilverClient from './src/SilverClient';
import { GatewayIntentBits } from 'discord.js';

const client = new SilverClient({
  intents: [GatewayIntentBits.Guilds],
  ws: { properties: { browser: 'Discord Android' } }
});

void client.start().then(() => {
  const app = express();
  app.use(cors());
  app.get('/current-session', (_req, res) => {
    res.json(client.dataPro.currentSession);
  });

  app.listen(process.env.PORT ?? 3000);
});
