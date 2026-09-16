import { JsonStore } from './repository.js';
import { createAuthorityServer } from './server.js';

const port = Number(process.env.PORT ?? 3400);
const file = process.env.AUTHORITY_STORE ?? './data/authority-engine.json';
createAuthorityServer(new JsonStore(file)).listen(port, '127.0.0.1', () => console.log(`authority-engine listening on http://127.0.0.1:${port}`));
