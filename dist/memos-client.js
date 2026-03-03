import axios from 'axios';
export class MemosClient {
    client;
    constructor(config) {
        this.client = axios.create({
            baseURL: config.baseUrl,
            headers: {
                'Content-Type': 'application/json',
                ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
            },
        });
    }
    normalizeMemoId(id) {
        if (id.startsWith('memos/')) {
            return id;
        }
        return `memos/${id}`;
    }
    normalizeAttachmentId(id) {
        if (id.startsWith('attachments/')) {
            return id;
        }
        return `attachments/${id}`;
    }
    // Memo operations
    async listMemos(params = {}) {
        const response = await this.client.get('/api/v1/memos', {
            params: {
                pageSize: params.pageSize,
                pageToken: params.pageToken,
                state: params.state,
                orderBy: params.orderBy,
                filter: params.filter,
                showDeleted: params.showDeleted,
            },
        });
        return response.data;
    }
    async getMemo(memoId) {
        const normalizedId = this.normalizeMemoId(memoId);
        const response = await this.client.get(`/api/v1/${normalizedId}`);
        return response.data;
    }
    async createMemo(data) {
        const response = await this.client.post('/api/v1/memos', data);
        return response.data;
    }
    async updateMemo(memoId, data, updateMask) {
        const normalizedId = this.normalizeMemoId(memoId);
        const updateMaskStr = updateMask.join(',');
        const response = await this.client.patch(`/api/v1/${normalizedId}`, data, {
            params: { updateMask: updateMaskStr },
        });
        return response.data;
    }
    async deleteMemo(memoId) {
        const normalizedId = this.normalizeMemoId(memoId);
        await this.client.delete(`/api/v1/${normalizedId}`);
    }
    // Attachment operations
    async listAttachments(params = {}) {
        const response = await this.client.get('/api/v1/attachments', {
            params: {
                pageSize: params.pageSize,
                pageToken: params.pageToken,
                filter: params.filter,
                orderBy: params.orderBy,
            },
        });
        return response.data;
    }
    async getAttachment(attachmentId) {
        const normalizedId = this.normalizeAttachmentId(attachmentId);
        const response = await this.client.get(`/api/v1/${normalizedId}`);
        return response.data;
    }
    async createAttachment(data) {
        const response = await this.client.post('/api/v1/attachments', data);
        return response.data;
    }
    async updateAttachment(attachmentId, data, updateMask) {
        const normalizedId = this.normalizeAttachmentId(attachmentId);
        const updateMaskStr = updateMask.join(',');
        const response = await this.client.patch(`/api/v1/${normalizedId}`, data, {
            params: { updateMask: updateMaskStr },
        });
        return response.data;
    }
    async deleteAttachment(attachmentId) {
        const normalizedId = this.normalizeAttachmentId(attachmentId);
        await this.client.delete(`/api/v1/${normalizedId}`);
    }
    // Memo-specific attachment operations
    async listMemoAttachments(memoId, params = {}) {
        const normalizedId = this.normalizeMemoId(memoId);
        const response = await this.client.get(`/api/v1/${normalizedId}/attachments`, {
            params: {
                pageSize: params.pageSize,
                pageToken: params.pageToken,
            },
        });
        return response.data;
    }
    async setMemoAttachments(memoId, data) {
        const normalizedId = this.normalizeMemoId(memoId);
        // The API expects attachments with a "name" field referencing existing attachments
        // If users provide full attachment objects (filename, type), we need to create them first
        const attachmentNames = [];
        for (const att of data.attachments) {
            if (att.name) {
                // Already has a name, use it directly
                attachmentNames.push(att.name);
            }
            else if (att.filename && att.type) {
                // Need to create the attachment first
                const created = await this.createAttachment({
                    filename: att.filename,
                    type: att.type,
                    externalLink: att.externalLink,
                    content: att.content,
                });
                attachmentNames.push(created.name);
            }
        }
        // Now set the attachments by name
        const response = await this.client.patch(`/api/v1/${normalizedId}/attachments`, { attachments: attachmentNames.map((name) => ({ name })) });
        return response.data;
    }
}
// Factory function to create client from environment
export function createMemosClient() {
    const config = {
        baseUrl: process.env.MEMOS_BASE_URL || 'https://demo.usememos.com',
        apiKey: process.env.MEMOS_API_KEY || '',
    };
    return new MemosClient(config);
}
//# sourceMappingURL=memos-client.js.map