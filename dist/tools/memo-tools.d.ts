import { z } from 'zod';
import { MemosClient } from '../memos-client.js';
export declare const createMemoSchema: z.ZodObject<{
    content: z.ZodString;
    visibility: z.ZodDefault<z.ZodOptional<z.ZodEnum<["PRIVATE", "PROTECTED", "PUBLIC"]>>>;
    state: z.ZodDefault<z.ZodOptional<z.ZodEnum<["NORMAL", "ARCHIVED"]>>>;
    pinned: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    content: string;
    visibility: "PRIVATE" | "PROTECTED" | "PUBLIC";
    state: "NORMAL" | "ARCHIVED";
    pinned: boolean;
}, {
    content: string;
    visibility?: "PRIVATE" | "PROTECTED" | "PUBLIC" | undefined;
    state?: "NORMAL" | "ARCHIVED" | undefined;
    pinned?: boolean | undefined;
}>;
export type CreateMemoInput = z.infer<typeof createMemoSchema>;
export declare const listMemosSchema: z.ZodObject<{
    pageSize: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    pageToken: z.ZodOptional<z.ZodString>;
    state: z.ZodDefault<z.ZodOptional<z.ZodEnum<["NORMAL", "ARCHIVED"]>>>;
    orderBy: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    filter: z.ZodOptional<z.ZodString>;
    showDeleted: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    state: "NORMAL" | "ARCHIVED";
    pageSize: number;
    orderBy: string;
    showDeleted: boolean;
    filter?: string | undefined;
    pageToken?: string | undefined;
}, {
    state?: "NORMAL" | "ARCHIVED" | undefined;
    filter?: string | undefined;
    pageSize?: number | undefined;
    pageToken?: string | undefined;
    orderBy?: string | undefined;
    showDeleted?: boolean | undefined;
}>;
export type ListMemosInput = z.infer<typeof listMemosSchema>;
export declare const getMemoSchema: z.ZodObject<{
    memoId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    memoId: string;
}, {
    memoId: string;
}>;
export type GetMemoInput = z.infer<typeof getMemoSchema>;
export declare const updateMemoSchema: z.ZodObject<{
    memoId: z.ZodString;
    content: z.ZodOptional<z.ZodString>;
    visibility: z.ZodOptional<z.ZodEnum<["PRIVATE", "PROTECTED", "PUBLIC"]>>;
    state: z.ZodOptional<z.ZodEnum<["NORMAL", "ARCHIVED"]>>;
    pinned: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    memoId: string;
    content?: string | undefined;
    visibility?: "PRIVATE" | "PROTECTED" | "PUBLIC" | undefined;
    state?: "NORMAL" | "ARCHIVED" | undefined;
    pinned?: boolean | undefined;
}, {
    memoId: string;
    content?: string | undefined;
    visibility?: "PRIVATE" | "PROTECTED" | "PUBLIC" | undefined;
    state?: "NORMAL" | "ARCHIVED" | undefined;
    pinned?: boolean | undefined;
}>;
export type UpdateMemoInput = z.infer<typeof updateMemoSchema>;
export declare const deleteMemoSchema: z.ZodObject<{
    memoId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    memoId: string;
}, {
    memoId: string;
}>;
export type DeleteMemoInput = z.infer<typeof deleteMemoSchema>;
export declare function createMemoTools(client: MemosClient): {
    create_memo: {
        name: string;
        description: string;
        inputSchema: z.ZodObject<{
            content: z.ZodString;
            visibility: z.ZodDefault<z.ZodOptional<z.ZodEnum<["PRIVATE", "PROTECTED", "PUBLIC"]>>>;
            state: z.ZodDefault<z.ZodOptional<z.ZodEnum<["NORMAL", "ARCHIVED"]>>>;
            pinned: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        }, "strip", z.ZodTypeAny, {
            content: string;
            visibility: "PRIVATE" | "PROTECTED" | "PUBLIC";
            state: "NORMAL" | "ARCHIVED";
            pinned: boolean;
        }, {
            content: string;
            visibility?: "PRIVATE" | "PROTECTED" | "PUBLIC" | undefined;
            state?: "NORMAL" | "ARCHIVED" | undefined;
            pinned?: boolean | undefined;
        }>;
        handler: (input: CreateMemoInput) => Promise<import("../types.js").Memo>;
    };
    list_memos: {
        name: string;
        description: string;
        inputSchema: z.ZodObject<{
            pageSize: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
            pageToken: z.ZodOptional<z.ZodString>;
            state: z.ZodDefault<z.ZodOptional<z.ZodEnum<["NORMAL", "ARCHIVED"]>>>;
            orderBy: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            filter: z.ZodOptional<z.ZodString>;
            showDeleted: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        }, "strip", z.ZodTypeAny, {
            state: "NORMAL" | "ARCHIVED";
            pageSize: number;
            orderBy: string;
            showDeleted: boolean;
            filter?: string | undefined;
            pageToken?: string | undefined;
        }, {
            state?: "NORMAL" | "ARCHIVED" | undefined;
            filter?: string | undefined;
            pageSize?: number | undefined;
            pageToken?: string | undefined;
            orderBy?: string | undefined;
            showDeleted?: boolean | undefined;
        }>;
        handler: (input: ListMemosInput) => Promise<import("../types.js").ListMemosResponse>;
    };
    get_memo: {
        name: string;
        description: string;
        inputSchema: z.ZodObject<{
            memoId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            memoId: string;
        }, {
            memoId: string;
        }>;
        handler: (input: GetMemoInput) => Promise<import("../types.js").Memo>;
    };
    update_memo: {
        name: string;
        description: string;
        inputSchema: z.ZodObject<{
            memoId: z.ZodString;
            content: z.ZodOptional<z.ZodString>;
            visibility: z.ZodOptional<z.ZodEnum<["PRIVATE", "PROTECTED", "PUBLIC"]>>;
            state: z.ZodOptional<z.ZodEnum<["NORMAL", "ARCHIVED"]>>;
            pinned: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            memoId: string;
            content?: string | undefined;
            visibility?: "PRIVATE" | "PROTECTED" | "PUBLIC" | undefined;
            state?: "NORMAL" | "ARCHIVED" | undefined;
            pinned?: boolean | undefined;
        }, {
            memoId: string;
            content?: string | undefined;
            visibility?: "PRIVATE" | "PROTECTED" | "PUBLIC" | undefined;
            state?: "NORMAL" | "ARCHIVED" | undefined;
            pinned?: boolean | undefined;
        }>;
        handler: (input: UpdateMemoInput) => Promise<import("../types.js").Memo>;
    };
    delete_memo: {
        name: string;
        description: string;
        inputSchema: z.ZodObject<{
            memoId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            memoId: string;
        }, {
            memoId: string;
        }>;
        handler: (input: DeleteMemoInput) => Promise<{
            success: boolean;
            memoId: string;
        }>;
    };
};
//# sourceMappingURL=memo-tools.d.ts.map