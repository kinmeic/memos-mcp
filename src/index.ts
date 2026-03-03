import 'dotenv/config';
import { createMemosClient } from './memos-client.js';
import { MemosServer } from './server.js';

async function main() {
  const client = createMemosClient();
  const server = new MemosServer(client);

  console.error('Memos MCP Server starting...');
  console.error(`Base URL: ${process.env.MEMOS_BASE_URL || 'https://demo.usememos.com'}`);
  console.error(`API Key: ${process.env.MEMOS_API_KEY ? 'Set' : 'Not set'}`);

  await server.run();
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
