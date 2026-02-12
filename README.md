# Memos MCP Server

A Model Context Protocol (MCP) server for interacting with [Memos](https://usememos.com/) API.

## Features

- **Create Memos**: Create new memos with Markdown content
- **List Memos**: List memos with pagination, sorting, and CEL filter support
- **Get Memo**: Retrieve a specific memo by ID
- **Update Memo**: Update existing memo content and metadata
- **Delete Memo**: Delete memos
- **Memo Attachments**: List and set memo attachments
- **Attachment Service**: Create, list, get, update, and delete individual attachments

## Installation

1. Clone this repository or download the files

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
export MEMOS_BASE_URL="https://your-memos-instance.com"
export MEMOS_API_KEY="your-api-token"
```

For Memos API key, go to your Memos instance -> Settings -> API to generate a token.

## Configuration

The server uses the following environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MEMOS_BASE_URL` | No | `https://demo.usememos.com` | Your Memos instance base URL |
| `MEMOS_API_KEY` | No | (empty) | Your Memos API access token |

## Usage

### Running the Server

```bash
python server.py
```

### MCP Tools

The server provides the following tools:

#### create_memo
Create a new memo.

Parameters:
- `content` (required): The memo content in Markdown format
- `visibility` (optional): Visibility level - `PRIVATE`, `PROTECTED`, or `PUBLIC` (default: `PRIVATE`)
- `state` (optional): Memo state - `NORMAL` or `ARCHIVED` (default: `NORMAL`)
- `pinned` (optional): Whether to pin the memo (default: `false`)

Example:
```json
{
  "content": "# My First Memo\n\nThis is a **markdown** memo.",
  "visibility": "PRIVATE",
  "pinned": false
}
```

#### list_memos
List memos with pagination, sorting, and CEL filter support.

Parameters:
- `pageSize` (optional): Maximum number of memos to return (default: `50`, max: `1000`)
- `pageToken` (optional): Page token from previous response for pagination
- `state` (optional): Filter by state - `NORMAL` or `ARCHIVED` (default: `NORMAL`)
- `orderBy` (optional): Sort order (default: `display_time desc`). Supports: `pinned`, `display_time`, `create_time`, `update_time`, `name`
- `filter` (optional): CEL expression for advanced filtering (e.g., `visibility == 'PUBLIC'`)
- `show_deleted` (optional): Include deleted memos (default: `false`)

Examples:
```json
// Basic list
{
  "pageSize": 50,
  "state": "NORMAL"
}

// With CEL filter
{
  "filter": "visibility == 'PUBLIC' && content.contains('meeting')",
  "orderBy": "pinned desc, display_time desc"
}

// Pagination
{
  "pageSize": 50,
  "pageToken": "eyJwYWdlU2l6ZSI6IDUwfQ=="
}
```

#### get_memo
Get a specific memo by ID.

Parameters:
- `memoId` (required): The memo ID (e.g., `123` or `memos/123`)

#### update_memo
Update an existing memo.

Parameters:
- `memoId` (required): The memo ID to update
- `content` (optional): New content for the memo
- `visibility` (optional): New visibility setting
- `state` (optional): New state setting
- `pinned` (optional): New pinned state

#### delete_memo
Delete a memo.

Parameters:
- `memoId` (required): The memo ID to delete

#### list_memo_attachments
List all attachments for a specific memo.

Parameters:
- `memoId` (required): The memo ID (e.g., `123` or `memos/123`)
- `pageSize` (optional): Maximum number of attachments to return (default: `50`, max: `1000`)
- `pageToken` (optional): Page token for pagination

Example:
```json
{
  "memoId": "123",
  "pageSize": 100
}
```

#### set_memo_attachments
Set attachments for a memo (replaces all existing attachments).

Parameters:
- `memoId` (required): The memo ID
- `attachments` (required): List of attachment objects (use camelCase for attachment fields)
  - `filename` (required): The filename
  - `type` (required): MIME type (e.g., `image/png`, `application/pdf`)
  - `content` (optional): Base64 encoded file content
  - `externalLink` (optional): External URL (camelCase)

**Note:** Use `content` OR `externalLink`, not both. Do NOT include `size` or `createTime` (these are server-generated).

**Important:** Attachment fields must use **camelCase** (`externalLink`, not `external_link`) as they match the API specification.

Example:
```json
{
  "memoId": "123",
  "attachments": [
    {
      "filename": "document.pdf",
      "type": "application/pdf",
      "externalLink": "https://example.com/doc.pdf"
    },
    {
      "filename": "small-image.png",
      "type": "image/png",
      "content": "iVBORw0KGgoAAAAAABJRU5ErkJggg=="
    }
  ]
}
```

#### create_attachment
Create a new attachment (can be linked to memos later).

Parameters:
- `filename` (required): The filename
- `type` (required): MIME type (e.g., `image/png`, `application/pdf`)
- `attachment_id` (optional): Custom attachment ID
- `external_link` (optional): External URL
- `memo` (optional): Related memo resource name (format: `memos/{memo}`)

Example:
```json
{
  "filename": "document.pdf",
  "type": "application/pdf",
  "external_link": "https://example.com/doc.pdf",
  "memo": "memos/123"
}
```

#### get_attachment
Get a specific attachment by ID.

Parameters:
- `attachment_id` (required): The attachment ID (e.g., `123` or `attachments/123`)

#### list_attachments
List all attachments with pagination, filtering, and sorting.

Parameters:
- `page_size` (optional): Maximum number of attachments to return (default: `50`, max: `1000`)
- `page_token` (optional): Page token for pagination
- `filter` (optional): CEL expression for filtering
- `order_by` (optional): Sort order (e.g., `create_time desc`, `filename asc`)

Examples:
```json
// Basic list
{
  "page_size": 100
}

// With CEL filter
{
  "filter": "mime_type==\"image/png\"",
  "orderBy": "create_time desc"
}

// Filter by memo
{
  "filter": "memo==\"memos/123\""
}
```

#### update_attachment
Update an existing attachment.

Parameters:
- `attachment_id` (required): The attachment ID to update
- `update_mask` (required): Comma-separated list of fields to update (e.g., `filename,type,externalLink`)
- `filename` (optional): New filename
- `type` (optional): New MIME type
- `external_link` (optional): New external URL
- `memo` (optional): New related memo resource name

Example:
```json
{
  "attachmentId": "123"",
  "update_mask": "filename,externalLink",
  "filename": "updated-name.pdf",
  "external_link": "https://example.com/new-url.pdf"
}
```

#### delete_attachment
Delete an attachment by ID.

Parameters:
- `attachment_id` (required): The attachment ID to delete

### MCP Resources

The server provides the following resources:

- `memos://memos`: All memos from your Memos instance
- `memos://config`: Current server configuration

## Claude Desktop Integration

To use this server with Claude Desktop, add it to your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "memos": {
      "command": "python",
      "args": ["/path/to/server.py"],
      "env": {
        "MEMOS_BASE_URL": "https://your-memos-instance.com",
        "MEMOS_API_KEY": "your-api-token"
      }
    }
  }
}
```

## Development

### Project Structure

```
memos-mcp-server/
├── server.py    # Main server implementation
├── requirements.txt        # Python dependencies
├── README.md              # This file
```

## License

MIT License

## References

- [Memos API Documentation](https://usememos.com/docs/api)
- [Model Context Protocol](https://modelcontextprotocol.io/)
