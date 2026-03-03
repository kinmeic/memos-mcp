import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { MemosClient } from './memos-client.js';
import { createMemoTools } from './tools/memo-tools.js';
import { createAttachmentTools } from './tools/attachment-tools.js';

interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: unknown;
  handler: (args: unknown) => Promise<unknown>;
}

export class MemosServer {
  private server: Server;
  private client: MemosClient;
  private tools: Map<string, ToolDefinition> = new Map();

  constructor(client: MemosClient) {
    this.client = client;

    this.server = new Server(
      {
        name: 'memos',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupTools();
    this.setupResources();
  }

  private setupTools() {
    const memoTools = createMemoTools(this.client);
    const attachmentTools = createAttachmentTools(this.client);

    // Register all tools
    for (const tool of Object.values(memoTools)) {
      this.tools.set(tool.name, tool as ToolDefinition);
    }
    for (const tool of Object.values(attachmentTools)) {
      this.tools.set(tool.name, tool as ToolDefinition);
    }

    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const toolsList: Array<{
        name: string;
        description: string;
        inputSchema: { type: string; properties: Record<string, unknown>; required?: string[] };
      }> = [];

      for (const tool of this.tools.values()) {
        const schemaResult = this.getToolProperties(tool.inputSchema);
        const properties = schemaResult.properties as Record<string, unknown>;
        const required = schemaResult.required as string[] | undefined;
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
      const tool = this.tools.get(name as string);

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
      } catch (error) {
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
  private getToolProperties(inputSchema: any): { properties: Record<string, unknown>; required: string[] | undefined } {
    const shape = inputSchema._def?.shape?.() || {};
    const properties: Record<string, unknown> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let zodDef = (value as any)._def;
      let actualValue = value;

      // Handle ZodDefault - unwrap to get the inner schema
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (zodDef?.typeName === 'ZodDefault') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const innerSchema = (zodDef as any).innerType;
        zodDef = innerSchema?._def;
      }

      if (zodDef) {
        let type = 'string';
        if (zodDef.typeName === 'ZodBoolean') {
          type = 'boolean';
        } else if (zodDef.typeName === 'ZodNumber') {
          type = 'number';
        } else if (zodDef.typeName === 'ZodArray') {
          type = 'array';
        } else if (zodDef.typeName === 'ZodEnum') {
          type = 'string';
        }

        // Get description from the schema directly (not as a method)
        const description = (actualValue as any).description || key;

        properties[key] = { type, description };

        // Check if optional - for ZodOptional or ZodDefault
        const isOptional =
          zodDef.typeName === 'ZodOptional' ||
          zodDef.typeName === 'ZodDefault' ||
          zodDef.checks?.some(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (check: any) => check.kind === 'optional'
          );
        if (!isOptional) {
          required.push(key);
        }
      }
    }

    return { properties, required: required.length > 0 ? required : undefined };
  }

  private setupResources() {
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
              text: JSON.stringify(
                {
                  baseUrl: process.env.MEMOS_BASE_URL || 'https://demo.usememos.com',
                  apiKeySet: !!process.env.MEMOS_API_KEY,
                },
                null,
                2
              ),
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
