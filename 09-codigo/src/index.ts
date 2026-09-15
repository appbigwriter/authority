import { createServer } from 'http';

export * from './types.js';
export * from './opportunity-radar.js';
export * from './influencer-seeds.js';
export * from './influencer-farmer.js';
export * from './post-machine.js';

const PORT = process.env.PORT || 3000;

const server = createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Authority Engine API is running\\n');
});

server.listen(PORT, () => {
  console.log(`Authority Engine Server running on port ${PORT}`);
});
