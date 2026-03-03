import { z } from 'zod';
import { MemosClient } from '../memos-client.js';
export declare const listMemoAttachmentsSchema: z.ZodObject<{
    memoId: z.ZodString;
    pageSize: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    pageToken: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    pageSize: number;
    memoId: string;
    pageToken?: string | undefined;
}, {
    memoId: string;
    pageSize?: number | undefined;
    pageToken?: string | undefined;
}>;
export type ListMemoAttachmentsInput = z.infer<typeof listMemoAttachmentsSchema>;
export declare const setMemoAttachmentsSchema: z.ZodObject<{
    memoId: z.ZodString;
    attachments: z.ZodArray<z.ZodObject<{
        filename: z.ZodString;
        type: z.ZodString;
        externalLink: z.ZodOptional<z.ZodString>;
        content: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        filename: string;
        content?: string | undefined;
        externalLink?: string | undefined;
    }, {
        type: string;
        filename: string;
        content?: string | undefined;
        externalLink?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    memoId: string;
    attachments: {
        type: string;
        filename: string;
        content?: string | undefined;
        externalLink?: string | undefined;
    }[];
}, {
    memoId: string;
    attachments: {
        type: string;
        filename: string;
        content?: string | undefined;
        externalLink?: string | undefined;
    }[];
}>;
export type SetMemoAttachmentsInput = z.infer<typeof setMemoAttachmentsSchema>;
export declare const createAttachmentSchema: z.ZodObject<{
    filename: z.ZodString;
    type: z.ZodString;
    externalLink: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    memo: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: string;
    filename: string;
    content?: string | undefined;
    externalLink?: string | undefined;
    memo?: string | undefined;
}, {
    type: string;
    filename: string;
    content?: string | undefined;
    externalLink?: string | undefined;
    memo?: string | undefined;
}>;
export type CreateAttachmentInput = z.infer<typeof createAttachmentSchema>;
export declare const getAttachmentSchema: z.ZodObject<{
    attachment_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    attachment_id: string;
}, {
    attachment_id: string;
}>;
export type GetAttachmentInput = z.infer<typeof getAttachmentSchema>;
export declare const listAttachmentsSchema: z.ZodObject<{
    page_size: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page_token: z.ZodOptional<z.ZodString>;
    filter: z.ZodOptional<z.ZodString>;
    order_by: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page_size: number;
    filter?: string | undefined;
    page_token?: string | undefined;
    order_by?: string | undefined;
}, {
    filter?: string | undefined;
    page_size?: number | undefined;
    page_token?: string | undefined;
    order_by?: string | undefined;
}>;
export type ListAttachmentsInput = z.infer<typeof listAttachmentsSchema>;
export declare const updateAttachmentSchema: z.ZodObject<{
    attachment_id: z.ZodString;
    update_mask: z.ZodString;
    filename: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodString>;
    external_link: z.ZodOptional<z.ZodString>;
    memo: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    attachment_id: string;
    update_mask: string;
    type?: string | undefined;
    filename?: string | undefined;
    memo?: string | undefined;
    external_link?: string | undefined;
}, {
    attachment_id: string;
    update_mask: string;
    type?: string | undefined;
    filename?: string | undefined;
    memo?: string | undefined;
    external_link?: string | undefined;
}>;
export type UpdateAttachmentInput = z.infer<typeof updateAttachmentSchema>;
export declare const deleteAttachmentSchema: z.ZodObject<{
    attachment_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    attachment_id: string;
}, {
    attachment_id: string;
}>;
export type DeleteAttachmentInput = z.infer<typeof deleteAttachmentSchema>;
export declare function createAttachmentTools(client: MemosClient): {
    list_memo_attachments: {
        name: string;
        description: string;
        inputSchema: z.ZodObject<{
            memoId: z.ZodString;
            pageSize: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
            pageToken: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            pageSize: number;
            memoId: string;
            pageToken?: string | undefined;
        }, {
            memoId: string;
            pageSize?: number | undefined;
            pageToken?: string | undefined;
        }>;
        handler: (input: ListMemoAttachmentsInput) => Promise<import("../types.js").ListAttachmentsResponse>;
    };
    set_memo_attachments: {
        name: string;
        description: string;
        inputSchema: z.ZodObject<{
            memoId: z.ZodString;
            attachments: z.ZodArray<z.ZodObject<{
                filename: z.ZodString;
                type: z.ZodString;
                externalLink: z.ZodOptional<z.ZodString>;
                content: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                type: string;
                filename: string;
                content?: string | undefined;
                externalLink?: string | undefined;
            }, {
                type: string;
                filename: string;
                content?: string | undefined;
                externalLink?: string | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            memoId: string;
            attachments: {
                type: string;
                filename: string;
                content?: string | undefined;
                externalLink?: string | undefined;
            }[];
        }, {
            memoId: string;
            attachments: {
                type: string;
                filename: string;
                content?: string | undefined;
                externalLink?: string | undefined;
            }[];
        }>;
        handler: (input: SetMemoAttachmentsInput) => Promise<import("../types.js").Memo>;
    };
    create_attachment: {
        name: string;
        description: string;
        inputSchema: z.ZodObject<{
            filename: z.ZodString;
            type: z.ZodString;
            externalLink: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            memo: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: string;
            filename: string;
            content?: string | undefined;
            externalLink?: string | undefined;
            memo?: string | undefined;
        }, {
            type: string;
            filename: string;
            content?: string | undefined;
            externalLink?: string | undefined;
            memo?: string | undefined;
        }>;
        handler: (input: CreateAttachmentInput) => Promise<import("../types.js").Attachment>;
    };
    get_attachment: {
        name: string;
        description: string;
        inputSchema: z.ZodObject<{
            attachment_id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            attachment_id: string;
        }, {
            attachment_id: string;
        }>;
        handler: (input: GetAttachmentInput) => Promise<import("../types.js").Attachment>;
    };
    list_attachments: {
        name: string;
        description: string;
        inputSchema: z.ZodObject<{
            page_size: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
            page_token: z.ZodOptional<z.ZodString>;
            filter: z.ZodOptional<z.ZodString>;
            order_by: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            page_size: number;
            filter?: string | undefined;
            page_token?: string | undefined;
            order_by?: string | undefined;
        }, {
            filter?: string | undefined;
            page_size?: number | undefined;
            page_token?: string | undefined;
            order_by?: string | undefined;
        }>;
        handler: (input: ListAttachmentsInput) => Promise<import("../types.js").ListAttachmentsResponse>;
    };
    update_attachment: {
        name: string;
        description: string;
        inputSchema: z.ZodObject<{
            attachment_id: z.ZodString;
            update_mask: z.ZodString;
            filename: z.ZodOptional<z.ZodString>;
            type: z.ZodOptional<z.ZodString>;
            external_link: z.ZodOptional<z.ZodString>;
            memo: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            attachment_id: string;
            update_mask: string;
            type?: string | undefined;
            filename?: string | undefined;
            memo?: string | undefined;
            external_link?: string | undefined;
        }, {
            attachment_id: string;
            update_mask: string;
            type?: string | undefined;
            filename?: string | undefined;
            memo?: string | undefined;
            external_link?: string | undefined;
        }>;
        handler: (input: UpdateAttachmentInput) => Promise<import("../types.js").Attachment>;
    };
    delete_attachment: {
        name: string;
        description: string;
        inputSchema: z.ZodObject<{
            attachment_id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            attachment_id: string;
        }, {
            attachment_id: string;
        }>;
        handler: (input: DeleteAttachmentInput) => Promise<{
            success: boolean;
            attachmentId: string;
        }>;
    };
};
//# sourceMappingURL=attachment-tools.d.ts.map