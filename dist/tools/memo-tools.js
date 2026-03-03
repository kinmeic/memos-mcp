import { z } from 'zod';
// Input schemas
export const createMemoSchema = z.object({
    content: z.string().describe('The memo content in Markdown format'),
    visibility: z
        .enum(['PRIVATE', 'PROTECTED', 'PUBLIC'])
        .optional()
        .default('PRIVATE')
        .describe('Visibility level: PRIVATE, PROTECTED, or PUBLIC'),
    state: z
        .enum(['NORMAL', 'ARCHIVED'])
        .optional()
        .default('NORMAL')
        .describe('Memo state: NORMAL or ARCHIVED'),
    pinned: z.boolean().optional().default(false).describe('Whether to pin the memo'),
});
export const listMemosSchema = z.object({
    pageSize: z
        .number()
        .optional()
        .default(50)
        .describe('Maximum number of memos to return (default: 50, max: 1000)'),
    pageToken: z.string().optional().describe('Page token from previous response for pagination'),
    state: z
        .enum(['NORMAL', 'ARCHIVED'])
        .optional()
        .default('NORMAL')
        .describe('Filter by state: NORMAL or ARCHIVED'),
    orderBy: z
        .string()
        .optional()
        .default('display_time desc')
        .describe('Sort order (e.g., "pinned desc, display_time desc"). Supports: pinned, display_time, create_time, update_time, name'),
    filter: z
        .string()
        .optional()
        .describe('CEL expression for advanced filtering (e.g., "visibility == \'PUBLIC\'")'),
    showDeleted: z.boolean().optional().default(false).describe('Include deleted memos'),
});
export const getMemoSchema = z.object({
    memoId: z.string().describe('The memo ID (e.g., "123" or "memos/123")'),
});
export const updateMemoSchema = z.object({
    memoId: z.string().describe('The memo ID to update'),
    content: z.string().optional().describe('New content for the memo'),
    visibility: z
        .enum(['PRIVATE', 'PROTECTED', 'PUBLIC'])
        .optional()
        .describe('New visibility setting'),
    state: z.enum(['NORMAL', 'ARCHIVED']).optional().describe('New state setting'),
    pinned: z.boolean().optional().describe('New pinned state'),
});
export const deleteMemoSchema = z.object({
    memoId: z.string().describe('The memo ID to delete'),
});
// Tool implementations
export function createMemoTools(client) {
    return {
        create_memo: {
            name: 'create_memo',
            description: 'Create a new memo',
            inputSchema: createMemoSchema,
            handler: async (input) => {
                const memo = await client.createMemo({
                    content: input.content,
                    visibility: input.visibility,
                    state: input.state,
                    pinned: input.pinned,
                });
                return memo;
            },
        },
        list_memos: {
            name: 'list_memos',
            description: 'List memos with pagination, sorting, and CEL filter support',
            inputSchema: listMemosSchema,
            handler: async (input) => {
                const result = await client.listMemos({
                    pageSize: input.pageSize,
                    pageToken: input.pageToken,
                    state: input.state,
                    orderBy: input.orderBy,
                    filter: input.filter,
                    showDeleted: input.showDeleted,
                });
                return result;
            },
        },
        get_memo: {
            name: 'get_memo',
            description: 'Get a specific memo by ID',
            inputSchema: getMemoSchema,
            handler: async (input) => {
                const memo = await client.getMemo(input.memoId);
                return memo;
            },
        },
        update_memo: {
            name: 'update_memo',
            description: 'Update an existing memo',
            inputSchema: updateMemoSchema,
            handler: async (input) => {
                const updateMask = [];
                const data = {};
                if (input.content !== undefined) {
                    updateMask.push('content');
                    data.content = input.content;
                }
                if (input.visibility !== undefined) {
                    updateMask.push('visibility');
                    data.visibility = input.visibility;
                }
                if (input.state !== undefined) {
                    updateMask.push('state');
                    data.state = input.state;
                }
                if (input.pinned !== undefined) {
                    updateMask.push('pinned');
                    data.pinned = input.pinned;
                }
                if (updateMask.length === 0) {
                    throw new Error('At least one field must be provided for update');
                }
                const memo = await client.updateMemo(input.memoId, data, updateMask);
                return memo;
            },
        },
        delete_memo: {
            name: 'delete_memo',
            description: 'Delete a memo',
            inputSchema: deleteMemoSchema,
            handler: async (input) => {
                await client.deleteMemo(input.memoId);
                return { success: true, memoId: input.memoId };
            },
        },
    };
}
//# sourceMappingURL=memo-tools.js.map