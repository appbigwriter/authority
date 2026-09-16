import { JsonStore } from './repository.js';
import { createAuthorityServer } from './server.js';

const port = Number(process.env.PORT ?? 3400);
const host = process.env.HOST ?? '0.0.0.0';
const file = process.env.AUTHORITY_STORE ?? './data/authority-engine.json';
createAuthorityServer(new JsonStore(file)).listen(port, host, () => console.log(`authority-engine listening on http://${host}:${port}`));
