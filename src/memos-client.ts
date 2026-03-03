import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  Memo,
  Attachment,
  ListMemosRequest,
  ListMemosResponse,
  CreateMemoRequest,
  UpdateMemoRequest,
  ListAttachmentsRequest,
  ListAttachmentsResponse,
  CreateAttachmentRequest,
  UpdateAttachmentRequest,
  ListMemoAttachmentsRequest,
  SetMemoAttachmentsRequest,
  Config,
} from './types.js';

export class MemosClient {
  private client: AxiosInstance;

  constructor(config: Config) {
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
      },
    });
  }

  private normalizeMemoId(id: string): string {
    if (id.startsWith('memos/')) {
      return id;
    }
    return `memos/${id}`;
  }

  private normalizeAttachmentId(id: string): string {
    if (id.startsWith('attachments/')) {
      return id;
    }
    return `attachments/${id}`;
  }

  // Memo operations

  async listMemos(params: ListMemosRequest = {}): Promise<ListMemosResponse> {
    const response = await this.client.get<ListMemosResponse>('/api/v1/memos', {
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

  async getMemo(memoId: string): Promise<Memo> {
    const normalizedId = this.normalizeMemoId(memoId);
    const response = await this.client.get<Memo>(`/api/v1/${normalizedId}`);
    return response.data;
  }

  async createMemo(data: CreateMemoRequest): Promise<Memo> {
    const response = await this.client.post<Memo>('/api/v1/memos', data);
    return response.data;
  }

  async updateMemo(
    memoId: string,
    data: UpdateMemoRequest,
    updateMask: string[]
  ): Promise<Memo> {
    const normalizedId = this.normalizeMemoId(memoId);
    const updateMaskStr = updateMask.join(',');
    const response = await this.client.patch<Memo>(`/api/v1/${normalizedId}`, data, {
      params: { updateMask: updateMaskStr },
    });
    return response.data;
  }

  async deleteMemo(memoId: string): Promise<void> {
    const normalizedId = this.normalizeMemoId(memoId);
    await this.client.delete(`/api/v1/${normalizedId}`);
  }

  // Attachment operations

  async listAttachments(params: ListAttachmentsRequest = {}): Promise<ListAttachmentsResponse> {
    const response = await this.client.get<ListAttachmentsResponse>('/api/v1/attachments', {
      params: {
        pageSize: params.pageSize,
        pageToken: params.pageToken,
        filter: params.filter,
        orderBy: params.orderBy,
      },
    });
    return response.data;
  }

  async getAttachment(attachmentId: string): Promise<Attachment> {
    const normalizedId = this.normalizeAttachmentId(attachmentId);
    const response = await this.client.get<Attachment>(`/api/v1/${normalizedId}`);
    return response.data;
  }

  async createAttachment(data: CreateAttachmentRequest): Promise<Attachment> {
    const response = await this.client.post<Attachment>('/api/v1/attachments', data);
    return response.data;
  }

  async updateAttachment(
    attachmentId: string,
    data: UpdateAttachmentRequest,
    updateMask: string[]
  ): Promise<Attachment> {
    const normalizedId = this.normalizeAttachmentId(attachmentId);
    const updateMaskStr = updateMask.join(',');
    const response = await this.client.patch<Attachment>(`/api/v1/${normalizedId}`, data, {
      params: { updateMask: updateMaskStr },
    });
    return response.data;
  }

  async deleteAttachment(attachmentId: string): Promise<void> {
    const normalizedId = this.normalizeAttachmentId(attachmentId);
    await this.client.delete(`/api/v1/${normalizedId}`);
  }

  // Memo-specific attachment operations

  async listMemoAttachments(
    memoId: string,
    params: ListMemoAttachmentsRequest = {}
  ): Promise<ListAttachmentsResponse> {
    const normalizedId = this.normalizeMemoId(memoId);
    const response = await this.client.get<ListAttachmentsResponse>(
      `/api/v1/${normalizedId}/attachments`,
      {
        params: {
          pageSize: params.pageSize,
          pageToken: params.pageToken,
        },
      }
    );
    return response.data;
  }

  async setMemoAttachments(
    memoId: string,
    data: SetMemoAttachmentsRequest
  ): Promise<Memo> {
    const normalizedId = this.normalizeMemoId(memoId);

    // The API expects attachments with a "name" field referencing existing attachments
    // If users provide full attachment objects (filename, type), we need to create them first
    const attachmentNames: string[] = [];

    for (const att of data.attachments) {
      if (att.name) {
        // Already has a name, use it directly
        attachmentNames.push(att.name);
      } else if (att.filename && att.type) {
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
    const response = await this.client.patch<Memo>(
      `/api/v1/${normalizedId}/attachments`,
      { attachments: attachmentNames.map((name) => ({ name })) }
    );
    return response.data;
  }
}

// Factory function to create client from environment
export function createMemosClient(): MemosClient {
  const config: Config = {
    baseUrl: process.env.MEMOS_BASE_URL || 'https://demo.usememos.com',
    apiKey: process.env.MEMOS_API_KEY || '',
  };
  return new MemosClient(config);
}
