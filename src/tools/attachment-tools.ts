import { z } from 'zod';
import { MemosClient } from '../memos-client.js';

// Input schemas

export const listMemoAttachmentsSchema = z.object({
  memoId: z.string().describe('The memo ID (e.g., "123" or "memos/123")'),
  pageSize: z
    .number()
    .optional()
    .default(50)
    .describe('Maximum number of attachments to return (default: 50, max: 1000)'),
  pageToken: z.string().optional().describe('Page token for pagination'),
});

export type ListMemoAttachmentsInput = z.infer<typeof listMemoAttachmentsSchema>;

export const setMemoAttachmentsSchema = z.object({
  memoId: z.string().describe('The memo ID'),
  attachments: z
    .array(
      z.object({
        filename: z.string().describe('The filename'),
        type: z.string().describe('MIME type (e.g., "image/png", "application/pdf")'),
        externalLink: z.string().optional().describe('External URL'),
        content: z.string().optional().describe('Base64 encoded file content'),
      })
    )
    .describe('List of attachment objects'),
});

export type SetMemoAttachmentsInput = z.infer<typeof setMemoAttachmentsSchema>;

export const createAttachmentSchema = z.object({
  filename: z.string().describe('The filename'),
  type: z.string().describe('MIME type (e.g., "image/png", "application/pdf")'),
  externalLink: z.string().optional().describe('External URL'),
  content: z.string().optional().describe('Base64 encoded file content'),
  memo: z.string().optional().describe('Related memo resource name (format: memos/{memo})'),
});

export type CreateAttachmentInput = z.infer<typeof createAttachmentSchema>;

export const getAttachmentSchema = z.object({
  attachment_id: z.string().describe('The attachment ID (e.g., "123" or "attachments/123")'),
});

export type GetAttachmentInput = z.infer<typeof getAttachmentSchema>;

export const listAttachmentsSchema = z.object({
  page_size: z
    .number()
    .optional()
    .default(50)
    .describe('Maximum number of attachments to return (default: 50, max: 1000)'),
  page_token: z.string().optional().describe('Page token for pagination'),
  filter: z.string().optional().describe('CEL expression for filtering'),
  order_by: z
    .string()
    .optional()
    .describe('Sort order (e.g., "create_time desc", "filename asc")'),
});

export type ListAttachmentsInput = z.infer<typeof listAttachmentsSchema>;

export const updateAttachmentSchema = z.object({
  attachment_id: z.string().describe('The attachment ID to update'),
  update_mask: z
    .string()
    .describe('Comma-separated list of fields to update (e.g., "filename,type,externalLink")'),
  filename: z.string().optional().describe('New filename'),
  type: z.string().optional().describe('New MIME type'),
  external_link: z.string().optional().describe('New external URL'),
  memo: z.string().optional().describe('New related memo resource name'),
});

export type UpdateAttachmentInput = z.infer<typeof updateAttachmentSchema>;

export const deleteAttachmentSchema = z.object({
  attachment_id: z.string().describe('The attachment ID to delete'),
});

export type DeleteAttachmentInput = z.infer<typeof deleteAttachmentSchema>;

// Tool implementations

export function createAttachmentTools(client: MemosClient) {
  return {
    list_memo_attachments: {
      name: 'list_memo_attachments',
      description: 'List all attachments for a specific memo',
      inputSchema: listMemoAttachmentsSchema,
      handler: async (input: ListMemoAttachmentsInput) => {
        const result = await client.listMemoAttachments(input.memoId, {
          pageSize: input.pageSize,
          pageToken: input.pageToken,
        });
        return result;
      },
    },
    set_memo_attachments: {
      name: 'set_memo_attachments',
      description: 'Set attachments for a memo (replaces all existing attachments)',
      inputSchema: setMemoAttachmentsSchema,
      handler: async (input: SetMemoAttachmentsInput) => {
        const memo = await client.setMemoAttachments(input.memoId, {
          attachments: input.attachments,
        });
        return memo;
      },
    },
    create_attachment: {
      name: 'create_attachment',
      description: 'Create a new attachment (can be linked to memos later)',
      inputSchema: createAttachmentSchema,
      handler: async (input: CreateAttachmentInput) => {
        const attachment = await client.createAttachment({
          filename: input.filename,
          type: input.type,
          externalLink: input.externalLink,
          content: input.content,
          memo: input.memo,
        });
        return attachment;
      },
    },
    get_attachment: {
      name: 'get_attachment',
      description: 'Get a specific attachment by ID',
      inputSchema: getAttachmentSchema,
      handler: async (input: GetAttachmentInput) => {
        const attachment = await client.getAttachment(input.attachment_id);
        return attachment;
      },
    },
    list_attachments: {
      name: 'list_attachments',
      description: 'List all attachments with pagination, filtering, and sorting',
      inputSchema: listAttachmentsSchema,
      handler: async (input: ListAttachmentsInput) => {
        const result = await client.listAttachments({
          pageSize: input.page_size,
          pageToken: input.page_token,
          filter: input.filter,
          orderBy: input.order_by,
        });
        return result;
      },
    },
    update_attachment: {
      name: 'update_attachment',
      description: 'Update an existing attachment',
      inputSchema: updateAttachmentSchema,
      handler: async (input: UpdateAttachmentInput) => {
        const updateMask = input.update_mask.split(',').map((s) => s.trim());
        const data: {
          filename?: string;
          type?: string;
          externalLink?: string;
          memo?: string;
        } = {};

        for (const field of updateMask) {
          switch (field) {
            case 'filename':
              if (input.filename !== undefined) data.filename = input.filename;
              break;
            case 'type':
              if (input.type !== undefined) data.type = input.type;
              break;
            case 'externalLink':
            case 'external_link':
              if (input.external_link !== undefined) data.externalLink = input.external_link;
              break;
            case 'memo':
              if (input.memo !== undefined) data.memo = input.memo;
              break;
          }
        }

        if (Object.keys(data).length === 0) {
          throw new Error('No valid fields found in update mask');
        }

        const attachment = await client.updateAttachment(input.attachment_id, data, updateMask);
        return attachment;
      },
    },
    delete_attachment: {
      name: 'delete_attachment',
      description: 'Delete an attachment by ID',
      inputSchema: deleteAttachmentSchema,
      handler: async (input: DeleteAttachmentInput) => {
        await client.deleteAttachment(input.attachment_id);
        return { success: true, attachmentId: input.attachment_id };
      },
    },
  };
}
