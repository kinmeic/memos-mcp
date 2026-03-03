import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListResourcesRequestSchema, ListToolsRequestSchema, ReadResourceRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { createMemoTools } from './tools/memo-tools.js';
import { createAttachmentTools } from './tools/attachment-tools.js';
export class MemosServer {
    server;
    client;
    tools = new Map();
    constructor(client) {
        this.client = client;
        this.server = new Server({
            name: 'memos',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
                resources: {},
            },
        });
        this.setupTools();
        this.setupResources();
    }
    setupTools() {
        const memoTools = createMemoTools(this.client);
        const attachmentTools = createAttachmentTools(this.client);
        // Register all tools
        for (const tool of Object.values(memoTools)) {
            this.tools.set(tool.name, tool);
        }
        for (const tool of Object.values(attachmentTools)) {
            this.tools.set(tool.name, tool);
        }
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            const toolsList = [];
            for (const tool of this.tools.values()) {
                const schemaResult = this.getToolProperties(tool.inputSchema);
                const properties = schemaResult.properties;
                const required = schemaResult.required;
                toolsList.push({
                    name: tool.name,
                    description: tool.description,
                    inputSchema: {
                        type: 'object',
                        properties,
                        ...(required && required.length > 0 ? { required } : {}),
                    },
                });
            }
            return { tools: toolsList };
        });
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            const tool = this.tools.get(name);
            if (!tool) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Tool "${name}" not found`,
                        },
                    ],
                    isError: true,
                };
            }
            try {
                const result = await tool.handler(args);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                    isError: true,
                };
            }
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getToolProperties(inputSchema) {
        const shape = inputSchema._def?.shape?.() || {};
        const properties = {};
        const required = [];
        for (const [key, value] of Object.entries(shape)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let zodDef = value._def;
            let actualValue = value;
            // Handle ZodDefault - unwrap to get the inner schema
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (zodDef?.typeName === 'ZodDefault') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const innerSchema = zodDef.innerType;
                zodDef = innerSchema?._def;
            }
            if (zodDef) {
                let type = 'string';
                if (zodDef.typeName === 'ZodBoolean') {
                    type = 'boolean';
                }
                else if (zodDef.typeName === 'ZodNumber') {
                    type = 'number';
                }
                else if (zodDef.typeName === 'ZodArray') {
                    type = 'array';
                }
                else if (zodDef.typeName === 'ZodEnum') {
                    type = 'string';
                }
                // Get description from the schema directly (not as a method)
                const description = actualValue.description || key;
                properties[key] = { type, description };
                // Check if optional - for ZodOptional or ZodDefault
                const isOptional = zodDef.typeName === 'ZodOptional' ||
                    zodDef.typeName === 'ZodDefault' ||
                    zodDef.checks?.some(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (check) => check.kind === 'optional');
                if (!isOptional) {
                    required.push(key);
                }
            }
        }
        return { properties, required: required.length > 0 ? required : undefined };
    }
    setupResources() {
        this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
            return {
                resources: [
                    {
                        uri: 'memos://memos',
                        name: 'All Memos',
                        description: 'All memos from your Memos instance',
                        mimeType: 'application/json',
                    },
                    {
                        uri: 'memos://config',
                        name: 'Server Configuration',
                        description: 'Current server configuration',
                        mimeType: 'application/json',
                    },
                ],
            };
        });
        this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
            const { uri } = request.params;
            if (uri === 'memos://memos') {
                const result = await this.client.listMemos({ pageSize: 100 });
                return {
                    contents: [
                        {
                            uri,
                            mimeType: 'application/json',
                            text: JSON.stringify(result.memos, null, 2),
                        },
                    ],
                };
            }
            if (uri === 'memos://config') {
                return {
                    contents: [
                        {
                            uri,
                            mimeType: 'application/json',
                            text: JSON.stringify({
                                baseUrl: process.env.MEMOS_BASE_URL || 'https://demo.usememos.com',
                                apiKeySet: !!process.env.MEMOS_API_KEY,
                            }, null, 2),
                        },
                    ],
                };
            }
            return {
                contents: [
                    {
                        uri,
                        mimeType: 'text/plain',
                        text: `Resource "${uri}" not found`,
                    },
                ],
                isError: true,
            };
        });
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
    }
}
//# sourceMappingURL=server.js.map