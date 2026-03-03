// Type definitions for Memos API

export type Visibility = 'PRIVATE' | 'PROTECTED' | 'PUBLIC';
export type MemoState = 'NORMAL' | 'ARCHIVED';

export interface Memo {
  name: string;
  uid?: string;
  rowStatus?: 'NORMAL' | 'ARCHIVED';
  creator?: string;
  createTime?: string;
  updateTime?: string;
  displayTime?: string;
  content: string;
  visibility: Visibility;
  pinned: boolean;
  state?: MemoState;
  tags?: string[];
  relations?: MemoRelation[];
  resources?: Resource[];
}

export interface MemoRelation {
  memo?: string;
  relatedMemo?: string;
  type: string;
}

export interface Resource {
  name: string;
  uid?: string;
  createTime?: string;
  filename: string;
  externalLink?: string;
  content?: string; // Base64 encoded
  type: string;
  size?: number;
  memo?: string;
}

export interface Attachment {
  name: string;
  uid?: string;
  createTime?: string;
  filename: string;
  externalLink?: string;
  content?: string; // Base64 encoded
  type: string;
  size?: number;
  memo?: string;
}

// API Request/Response types

export interface ListMemosRequest {
  pageSize?: number;
  pageToken?: string;
  state?: MemoState;
  orderBy?: string;
  filter?: string;
  showDeleted?: boolean;
}

export interface ListMemosResponse {
  memos: Memo[];
  nextPageToken?: string;
}

export interface CreateMemoRequest {
  content: string;
  visibility?: Visibility;
  state?: MemoState;
  pinned?: boolean;
}

export interface UpdateMemoRequest {
  content?: string;
  visibility?: Visibility;
  state?: MemoState;
  pinned?: boolean;
}

export interface ListAttachmentsRequest {
  pageSize?: number;
  pageToken?: string;
  filter?: string;
  orderBy?: string;
}

export interface ListAttachmentsResponse {
  attachments: Attachment[];
  nextPageToken?: string;
}

export interface CreateAttachmentRequest {
  filename: string;
  type: string;
  externalLink?: string;
  content?: string;
  memo?: string;
}

export interface UpdateAttachmentRequest {
  filename?: string;
  type?: string;
  externalLink?: string;
  memo?: string;
}

export interface ListMemoAttachmentsRequest {
  pageSize?: number;
  pageToken?: string;
}

export interface SetMemoAttachmentsRequest {
  attachments: {
    // For existing attachments, just provide the name (e.g., "attachments/123")
    name?: string;
    // For new attachments, provide the file details
    filename?: string;
    type?: string;
    externalLink?: string;
    content?: string;
  }[];
}

export interface Config {
  baseUrl: string;
  apiKey: string;
}
