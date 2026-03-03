import { Memo, Attachment, ListMemosRequest, ListMemosResponse, CreateMemoRequest, UpdateMemoRequest, ListAttachmentsRequest, ListAttachmentsResponse, CreateAttachmentRequest, UpdateAttachmentRequest, ListMemoAttachmentsRequest, SetMemoAttachmentsRequest, Config } from './types.js';
export declare class MemosClient {
    private client;
    constructor(config: Config);
    private normalizeMemoId;
    private normalizeAttachmentId;
    listMemos(params?: ListMemosRequest): Promise<ListMemosResponse>;
    getMemo(memoId: string): Promise<Memo>;
    createMemo(data: CreateMemoRequest): Promise<Memo>;
    updateMemo(memoId: string, data: UpdateMemoRequest, updateMask: string[]): Promise<Memo>;
    deleteMemo(memoId: string): Promise<void>;
    listAttachments(params?: ListAttachmentsRequest): Promise<ListAttachmentsResponse>;
    getAttachment(attachmentId: string): Promise<Attachment>;
    createAttachment(data: CreateAttachmentRequest): Promise<Attachment>;
    updateAttachment(attachmentId: string, data: UpdateAttachmentRequest, updateMask: string[]): Promise<Attachment>;
    deleteAttachment(attachmentId: string): Promise<void>;
    listMemoAttachments(memoId: string, params?: ListMemoAttachmentsRequest): Promise<ListAttachmentsResponse>;
    setMemoAttachments(memoId: string, data: SetMemoAttachmentsRequest): Promise<Memo>;
}
export declare function createMemosClient(): MemosClient;
//# sourceMappingURL=memos-client.d.ts.map