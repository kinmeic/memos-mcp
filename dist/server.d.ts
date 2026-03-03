import { MemosClient } from './memos-client.js';
export declare class MemosServer {
    private server;
    private client;
    private tools;
    constructor(client: MemosClient);
    private setupTools;
    private getToolProperties;
    private setupResources;
    run(): Promise<void>;
}
//# sourceMappingURL=server.d.ts.map