#!/usr/bin/env python3
"""
Memos MCP Server
A Model Context Protocol server for interacting with Memos API.
"""

import asyncio
import json
import os
from typing import Any
from urllib.parse import urljoin

import httpx
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import (
    Resource,
    Tool,
    TextContent,
    ImageContent,
    EmbeddedResource,
)

# Server configuration
server = Server("memos-server")

# Memos API configuration
MEMOS_BASE_URL = os.environ.get("MEMOS_BASE_URL", "")
MEMOS_API_KEY = os.environ.get("MEMOS_API_KEY", "")


def get_headers() -> dict[str, str]:
    """Get API request headers."""
    headers = {
        "Content-Type": "application/json",
    }
    if MEMOS_API_KEY:
        headers["Authorization"] = f"Bearer {MEMOS_API_KEY}"
    return headers


async def create_memo(
    content: str,
    visibility: str = "PRIVATE",
    state: str = "NORMAL",
    pinned: bool = False,
    name: str | None = None,
    create_time: str | None = None,
    update_time: str | None = None,
    display_time: str | None = None,
    attachments: list[dict[str, Any]] | None = None,
    relations: list[dict[str, Any]] | None = None,
    property: dict[str, Any] | None = None,
    location: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Create a new memo using Memos API.

    Args:
        content: The content of the memo in Markdown format (required)
        visibility: Visibility of the memo (PRIVATE, PROTECTED, PUBLIC)
        state: State of the memo (NORMAL, ARCHIVED)
        pinned: Whether the memo is pinned
        name: Resource name of the memo (format: memos/{id})
        create_time: Creation timestamp (RFC3339 format)
        update_time: Last update timestamp (RFC3339 format)
        display_time: Display timestamp (RFC3339 format)
        attachments: List of attachment objects
        relations: List of memo relation objects
        property: Property object (hasLink, hasTaskList, hasCode, hasIncompleteTasks)
        location: Location object (placeholder, latitude, longitude)

    Returns:
        The created memo data
    """
    url = urljoin(MEMOS_BASE_URL.rstrip("/") + "/", "api/v1/memos")

    payload: dict[str, Any] = {
        "content": content,
        "visibility": f"VISIBILITY_{visibility}",
        "state": f"STATE_{state}",
    }

    # Only include pinned if True (optional field)
    if pinned:
        payload["pinned"] = pinned

    # Optional fields
    if name is not None:
        payload["name"] = name
    if create_time is not None:
        payload["createTime"] = create_time
    if update_time is not None:
        payload["updateTime"] = update_time
    if display_time is not None:
        payload["displayTime"] = display_time
    if attachments is not None:
        payload["attachments"] = attachments
    if relations is not None:
        payload["relations"] = relations
    if property is not None:
        payload["property"] = property
    if location is not None:
        payload["location"] = location

    async with httpx.AsyncClient() as client:
        response = await client.post(
            url,
            headers=get_headers(),
            json=payload,
            timeout=30.0,
        )
        response.raise_for_status()
        return response.json()


async def list_memos(
    page_size: int | None = None,
    page_token: str | None = None,
    state: str | None = None,
    order_by: str | None = None,
    filter: str | None = None,
    show_deleted: bool | None = None,
) -> dict[str, Any]:
    """
    List memos using Memos API.

    Args:
        page_size: Maximum number of memos to return (default: 50, max: 1000)
        page_token: Page token for pagination (from previous response)
        state: Filter by state (NORMAL, ARCHIVED). Default is NORMAL
        order_by: Order to sort results by (default: "display_time desc")
                 Supports: pinned, display_time, create_time, update_time, name
                 Example: "pinned desc, display_time desc" or "create_time asc"
        filter: CEL expression to filter memos
                Example: "visibility == 'PUBLIC'" or "creator == 'users/1'"
        show_deleted: If true, show deleted memos in the response

    Returns:
        List of memos with next_page_token for pagination
    """
    url = urljoin(MEMOS_BASE_URL.rstrip("/") + "/", "api/v1/memos")

    params: dict[str, Any] = {}

    if page_size is not None:
        params["pageSize"] = page_size
    if page_token is not None:
        params["pageToken"] = page_token
    if state is not None:
        params["state"] = f"STATE_{state}"
    if order_by is not None:
        params["orderBy"] = order_by
    if filter is not None:
        params["filter"] = filter
    if show_deleted is not None:
        params["showDeleted"] = "true" if show_deleted else "false"

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            headers=get_headers(),
            params=params,
            timeout=30.0,
        )
        response.raise_for_status()
        return response.json()


async def get_memo(memo_id: str) -> dict[str, Any]:
    """
    Get a specific memo by ID.

    Args:
        memo_id: The ID of the memo

    Returns:
        The memo data
    """
    url = urljoin(MEMOS_BASE_URL.rstrip("/") + "/", f"api/v1/memos/{memo_id}")

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            headers=get_headers(),
            timeout=30.0,
        )
        response.raise_for_status()
        return response.json()


async def update_memo(
    memo_id: str,
    content: str | None = None,
    visibility: str | None = None,
    state: str | None = None,
    pinned: bool | None = None,
    create_time: str | None = None,
    update_time: str | None = None,
    display_time: str | None = None,
    attachments: list[dict[str, Any]] | None = None,
    relations: list[dict[str, Any]] | None = None,
    property: dict[str, Any] | None = None,
    location: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Update an existing memo.

    Args:
        memo_id: The ID of the memo to update
        content: New content for the memo
        visibility: New visibility setting
        state: New state setting
        pinned: New pinned state
        create_time: Creation timestamp (RFC3339 format)
        update_time: Last update timestamp (RFC3339 format)
        display_time: Display timestamp (RFC3339 format)
        attachments: List of attachment objects
        relations: List of memo relation objects
        property: Property object
        location: Location object

    Returns:
        The updated memo data
    """
    url = urljoin(MEMOS_BASE_URL.rstrip("/") + "/", f"api/v1/memos/{memo_id}")

    payload: dict[str, Any] = {}
    if content is not None:
        payload["content"] = content
    if visibility is not None:
        payload["visibility"] = f"VISIBILITY_{visibility}"
    if state is not None:
        payload["state"] = f"STATE_{state}"
    if pinned is not None:
        payload["pinned"] = pinned
    if create_time is not None:
        payload["createTime"] = create_time
    if update_time is not None:
        payload["updateTime"] = update_time
    if display_time is not None:
        payload["displayTime"] = display_time
    if attachments is not None:
        payload["attachments"] = attachments
    if relations is not None:
        payload["relations"] = relations
    if property is not None:
        payload["property"] = property
    if location is not None:
        payload["location"] = location

    async with httpx.AsyncClient() as client:
        response = await client.patch(
            url,
            headers=get_headers(),
            json=payload,
            timeout=30.0,
        )
        response.raise_for_status()
        return response.json()


async def delete_memo(memo_id: str) -> None:
    """
    Delete a memo.

    Args:
        memo_id: The ID of the memo to delete
    """
    url = urljoin(MEMOS_BASE_URL.rstrip("/") + "/", f"api/v1/memos/{memo_id}")

    async with httpx.AsyncClient() as client:
        response = await client.delete(
            url,
            headers=get_headers(),
            timeout=30.0,
        )
        response.raise_for_status()


async def list_memo_attachments(
    memo_id: str,
    page_size: int | None = None,
    page_token: str | None = None,
) -> dict[str, Any]:
    """
    List attachments for a memo.

    Args:
        memo_id: The ID of the memo
        page_size: Maximum number of attachments to return (default: 50, max: 1000)
        page_token: Page token for pagination

    Returns:
        List of attachments with next_page_token for pagination
    """
    url = urljoin(MEMOS_BASE_URL.rstrip("/") + "/", f"api/v1/memos/{memo_id}/attachments")

    params: dict[str, Any] = {}
    if page_size is not None:
        params["pageSize"] = page_size
    if page_token is not None:
        params["pageToken"] = page_token

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            headers=get_headers(),
            params=params,
            timeout=30.0,
        )
        response.raise_for_status()
        return response.json()


async def set_memo_attachments(
    memo_id: str,
    attachments: list[dict[str, Any]],
) -> None:
    """
    Set attachments for a memo. This replaces all existing attachments.

    Args:
        memo_id: The ID of the memo
        attachments: List of attachment objects (must use camelCase for API compatibility).
            Each attachment can contain:
            - filename (required): The filename of the attachment
            - type (required): MIME type of the attachment (e.g., 'image/png', 'application/pdf')
            - content (optional): Base64 encoded file content (use for small files)
            - externalLink (optional): External link URL (alternative to content)

    Note: Do NOT include 'size' or 'createTime' when creating/updating attachments.
    These are output-only fields set by the server.

    Important: Attachment fields must use camelCase (externalLink, not external_link)
    as they are sent directly to the API.
    """
    url = urljoin(MEMOS_BASE_URL.rstrip("/") + "/", f"api/v1/memos/{memo_id}/attachments")

    payload = {
        "name": f"memos/{memo_id}",
        "attachments": attachments,
    }

    async with httpx.AsyncClient() as client:
        response = await client.patch(
            url,
            headers=get_headers(),
            json=payload,
            timeout=30.0,
        )
        response.raise_for_status()


async def create_attachment(
    filename: str,
    type: str,
    attachment_id: str | None = None,
    content: str | None = None,
    external_link: str | None = None,
    memo: str | None = None,
) -> dict[str, Any]:
    """
    Create a new attachment using Memos API.

    Args:
        filename: The filename of the attachment (required)
        type: MIME type of the attachment (required, e.g., 'image/png', 'application/pdf')
        attachment_id: Optional custom attachment ID
        content: Optional base64 encoded file content (alternative to external_link)
        external_link: Optional external link URL (alternative to content)
        memo: Optional related memo resource name (format: memos/{memo})

    Returns:
        The created attachment data
    """
    url = urljoin(MEMOS_BASE_URL.rstrip("/") + "/", "api/v1/attachments")

    payload: dict[str, Any] = {
        "filename": filename,
        "type": type,
    }

    if attachment_id is not None:
        # Add as query parameter
        url += f"?attachmentId={attachment_id}"
    if content is not None:
        payload["content"] = content
    if external_link is not None:
        payload["externalLink"] = external_link
    if memo is not None:
        payload["memo"] = memo

    async with httpx.AsyncClient() as client:
        response = await client.post(
            url,
            headers=get_headers(),
            json=payload,
            timeout=30.0,
        )
        response.raise_for_status()
        return response.json()


async def get_attachment(attachment_id: str) -> dict[str, Any]:
    """
    Get a specific attachment by ID.

    Args:
        attachment_id: The ID of the attachment

    Returns:
        The attachment data
    """
    url = urljoin(MEMOS_BASE_URL.rstrip("/") + "/", f"api/v1/attachments/{attachment_id}")

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            headers=get_headers(),
            timeout=30.0,
        )
        response.raise_for_status()
        return response.json()


async def list_attachments(
    page_size: int | None = None,
    page_token: str | None = None,
    filter: str | None = None,
    order_by: str | None = None,
) -> dict[str, Any]:
    """
    List all attachments with pagination and filtering.

    Args:
        page_size: Maximum number of attachments to return (default: 50, max: 1000)
        page_token: Page token for pagination
        filter: CEL expression to filter results (e.g., 'mime_type=="image/png"', 'filename.contains("test")')
        order_by: Order to sort results by (e.g., 'create_time desc', 'filename asc')

    Returns:
        List of attachments with next_page_token for pagination
    """
    url = urljoin(MEMOS_BASE_URL.rstrip("/") + "/", "api/v1/attachments")

    params: dict[str, Any] = {}
    if page_size is not None:
        params["pageSize"] = page_size
    if page_token is not None:
        params["pageToken"] = page_token
    if filter is not None:
        params["filter"] = filter
    if order_by is not None:
        params["orderBy"] = order_by

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            headers=get_headers(),
            params=params,
            timeout=30.0,
        )
        response.raise_for_status()
        return response.json()


async def update_attachment(
    attachment_id: str,
    update_mask: str,
    filename: str | None = None,
    type: str | None = None,
    content: str | None = None,
    external_link: str | None = None,
    memo: str | None = None,
) -> dict[str, Any]:
    """
    Update an existing attachment.

    Args:
        attachment_id: The ID of the attachment to update
        update_mask: Comma-separated list of fields to update (e.g., 'filename,type,externalLink,content')
        filename: New filename
        type: New MIME type
        content: New base64 encoded file content
        external_link: New external link URL
        memo: New related memo resource name

    Returns:
        The updated attachment data
    """
    url = urljoin(MEMOS_BASE_URL.rstrip("/") + "/", f"api/v1/attachments/{attachment_id}")

    # Add update_mask as query parameter
    url += f"?updateMask={update_mask}"

    payload: dict[str, Any] = {}
    if filename is not None:
        payload["filename"] = filename
    if type is not None:
        payload["type"] = type
    if content is not None:
        payload["content"] = content
    if external_link is not None:
        payload["externalLink"] = external_link
    if memo is not None:
        payload["memo"] = memo

    async with httpx.AsyncClient() as client:
        response = await client.patch(
            url,
            headers=get_headers(),
            json=payload,
            timeout=30.0,
        )
        response.raise_for_status()
        return response.json()


async def delete_attachment(attachment_id: str) -> None:
    """
    Delete an attachment.

    Args:
        attachment_id: The ID of the attachment to delete
    """
    url = urljoin(MEMOS_BASE_URL.rstrip("/") + "/", f"api/v1/attachments/{attachment_id}")

    async with httpx.AsyncClient() as client:
        response = await client.delete(
            url,
            headers=get_headers(),
            timeout=30.0,
        )
        response.raise_for_status()


@server.list_resources()
async def handle_list_resources() -> list[Resource]:
    """List available resources."""
    return [
        Resource(
            uri=f"memos://memos",
            name="All Memos",
            description="List all memos from your Memos instance",
            mimeType="application/json",
        ),
        Resource(
            uri=f"memos://config",
            name="Configuration",
            description="Current Memos server configuration",
            mimeType="application/json",
        ),
    ]


@server.read_resource()
async def handle_read_resource(uri: str) -> str:
    """Read a resource."""
    if uri == "memos://memos":
        try:
            memos = await list_memos(page_size=100)
            return json.dumps(memos, indent=2, ensure_ascii=False)
        except Exception as e:
            return json.dumps({"error": str(e)})
    elif uri == "memos://config":
        config = {
            "base_url": MEMOS_BASE_URL,
            "has_api_key": bool(MEMOS_API_KEY),
        }
        return json.dumps(config, indent=2)
    else:
        raise ValueError(f"Unknown resource: {uri}")


@server.list_tools()
async def handle_list_tools() -> list[Tool]:
    """List available tools."""
    return [
        Tool(
            name="create_memo",
            description="Create a new memo in Memos. Content should be in Markdown format.",
            inputSchema={
                "type": "object",
                "properties": {
                    "content": {
                        "type": "string",
                        "description": "The content of the memo in Markdown format (required)",
                    },
                    "visibility": {
                        "type": "string",
                        "enum": ["PRIVATE", "PROTECTED", "PUBLIC"],
                        "description": "Visibility of the memo",
                        "default": "PRIVATE",
                    },
                    "state": {
                        "type": "string",
                        "enum": ["NORMAL", "ARCHIVED"],
                        "description": "State of the memo",
                        "default": "NORMAL",
                    },
                    "pinned": {
                        "type": "boolean",
                        "description": "Whether to pin the memo",
                        "default": False,
                    },
                    "name": {
                        "type": "string",
                        "description": "Resource name of the memo (format: memos/{id})",
                    },
                    "createTime": {
                        "type": "string",
                        "description": "Creation timestamp in RFC3339 format (e.g., 2024-01-01T12:00:00Z)",
                    },
                    "updateTime": {
                        "type": "string",
                        "description": "Last update timestamp in RFC3339 format",
                    },
                    "displayTime": {
                        "type": "string",
                        "description": "Display timestamp in RFC3339 format",
                    },
                    "attachments": {
                        "type": "array",
                        "description": "List of attachment objects. Each attachment requires 'filename' and 'type'. Optionally 'content' (base64) or 'externalLink' (use camelCase for attachment fields as they match the API)",
                        "items": {
                            "type": "object",
                            "properties": {
                                "filename": {
                                    "type": "string",
                                    "description": "The filename of the attachment (required)",
                                },
                                "type": {
                                    "type": "string",
                                    "description": "MIME type of the attachment (required, e.g., 'image/png', 'application/pdf')",
                                },
                                "content": {
                                    "type": "string",
                                    "description": "Base64 encoded content of the file (for small files, alternative to externalLink)",
                                },
                                "externalLink": {
                                    "type": "string",
                                    "description": "External link URL for the attachment (alternative to content)",
                                },
                            },
                            "required": ["filename", "type"],
                        },
                    },
                    "relations": {
                        "type": "array",
                        "description": "List of memo relation objects",
                        "items": {"type": "object"},
                    },
                    "property": {
                        "type": "object",
                        "description": "Property object (e.g., {\"hasLink\": true, \"hasTaskList\": false})",
                    },
                    "location": {
                        "type": "object",
                        "description": "Location object (e.g., {\"placeholder\": \"Office\", \"latitude\": 40.7128, \"longitude\": -74.0060})",
                    },
                },
                "required": ["content"],
            },
        ),
        Tool(
            name="list_memos",
            description="List memos from your Memos instance with pagination, sorting, and filters. Supports CEL expressions for advanced filtering.",
            inputSchema={
                "type": "object",
                "properties": {
                    "pageSize": {
                        "type": "integer",
                        "description": "Maximum number of memos to return (default: 50, max: 1000)",
                        "default": 50,
                        "minimum": 1,
                        "maximum": 1000,
                    },
                    "pageToken": {
                        "type": "string",
                        "description": "Page token from previous response for pagination",
                    },
                    "state": {
                        "type": "string",
                        "enum": ["NORMAL", "ARCHIVED"],
                        "description": "Filter by state (default: NORMAL)",
                    },
                    "orderBy": {
                        "type": "string",
                        "description": "Order to sort results by. Default: 'display_time desc'. Supports comma-separated fields: pinned, display_time, create_time, update_time, name. Example: 'pinned desc, display_time desc' or 'create_time asc'",
                    },
                    "filter": {
                        "type": "string",
                        "description": "CEL expression to filter memos. Examples: \"visibility == 'PUBLIC'\", \"creator == 'users/1'\", \"content.contains('meeting')\"",
                    },
                    "showDeleted": {
                        "type": "boolean",
                        "description": "If true, show deleted memos in the response",
                        "default": False,
                    },
                },
                "required": [],
            },
        ),
        Tool(
            name="get_memo",
            description="Get a specific memo by its ID",
            inputSchema={
                "type": "object",
                "properties": {
                    "memo_id": {
                        "type": "string",
                        "description": "The ID or name of the memo (e.g., '123' or 'memos/123')",
                    },
                },
                "required": ["memo_id"],
            },
        ),
        Tool(
            name="update_memo",
            description="Update an existing memo",
            inputSchema={
                "type": "object",
                "properties": {
                    "memo_id": {
                        "type": "string",
                        "description": "The ID or name of the memo to update",
                    },
                    "content": {
                        "type": "string",
                        "description": "New content for the memo in Markdown format",
                    },
                    "visibility": {
                        "type": "string",
                        "enum": ["PRIVATE", "PROTECTED", "PUBLIC"],
                        "description": "New visibility setting",
                    },
                    "state": {
                        "type": "string",
                        "enum": ["NORMAL", "ARCHIVED"],
                        "description": "New state setting",
                    },
                    "pinned": {
                        "type": "boolean",
                        "description": "New pinned state",
                    },
                    "createTime": {
                        "type": "string",
                        "description": "Creation timestamp in RFC3339 format",
                    },
                    "updateTime": {
                        "type": "string",
                        "description": "Last update timestamp in RFC3339 format",
                    },
                    "displayTime": {
                        "type": "string",
                        "description": "Display timestamp in RFC3339 format",
                    },
                    "attachments": {
                        "type": "array",
                        "description": "List of attachment objects. Each attachment requires 'filename' and 'type'. Optionally 'content' (base64) or 'externalLink' (use camelCase for attachment fields as they match the API)",
                        "items": {
                            "type": "object",
                            "properties": {
                                "filename": {
                                    "type": "string",
                                    "description": "The filename of the attachment (required)",
                                },
                                "type": {
                                    "type": "string",
                                    "description": "MIME type of the attachment (required, e.g., 'image/png', 'application/pdf')",
                                },
                                "content": {
                                    "type": "string",
                                    "description": "Base64 encoded content of the file (for small files, alternative to externalLink)",
                                },
                                "externalLink": {
                                    "type": "string",
                                    "description": "External link URL for the attachment (alternative to content)",
                                },
                            },
                            "required": ["filename", "type"],
                        },
                    },
                    "relations": {
                        "type": "array",
                        "description": "List of memo relation objects",
                        "items": {"type": "object"},
                    },
                    "property": {
                        "type": "object",
                        "description": "Property object",
                    },
                    "location": {
                        "type": "object",
                        "description": "Location object",
                    },
                },
                "required": ["memo_id"],
            },
        ),
        Tool(
            name="delete_memo",
            description="Delete a memo by its ID",
            inputSchema={
                "type": "object",
                "properties": {
                    "memo_id": {
                        "type": "string",
                        "description": "The ID or name of the memo to delete",
                    },
                },
                "required": ["memo_id"],
            },
        ),
        Tool(
            name="list_memo_attachments",
            description="List all attachments for a specific memo with pagination support",
            inputSchema={
                "type": "object",
                "properties": {
                    "memoId": {
                        "type": "string",
                        "description": "The ID or name of the memo (e.g., '123' or 'memos/123')",
                    },
                    "pageSize": {
                        "type": "integer",
                        "description": "Maximum number of attachments to return (default: 50, max: 1000)",
                        "default": 50,
                        "minimum": 1,
                        "maximum": 1000,
                    },
                    "pageToken": {
                        "type": "string",
                        "description": "Page token from previous response for pagination",
                    },
                },
                "required": ["memoId"],
            },
        ),
        Tool(
            name="set_memo_attachments",
            description="Set attachments for a memo. This replaces all existing attachments. Each attachment must have 'filename' and 'type'. Use 'content' for base64-encoded file data OR 'externalLink' for URLs. Do NOT include 'size' or 'createTime' (server-generated).",
            inputSchema={
                "type": "object",
                "properties": {
                    "memoId": {
                        "type": "string",
                        "description": "The ID or name of the memo",
                    },
                    "attachments": {
                        "type": "array",
                        "description": "List of attachment objects with 'filename', 'type', and optionally 'content' (base64) or 'externalLink' (use camelCase)",
                        "items": {
                            "type": "object",
                            "properties": {
                                "filename": {
                                    "type": "string",
                                    "description": "The filename of the attachment (required)",
                                },
                                "type": {
                                    "type": "string",
                                    "description": "MIME type of the attachment (required, e.g., 'image/png', 'application/pdf')",
                                },
                                "content": {
                                    "type": "string",
                                    "description": "Base64 encoded file content (alternative to externalLink, for small files)",
                                },
                                "externalLink": {
                                    "type": "string",
                                    "description": "External link URL (alternative to content)",
                                },
                            },
                            "required": ["filename", "type"],
                        },
                    },
                },
                "required": ["memoId", "attachments"],
            },
        ),
        Tool(
            name="create_attachment",
            description="Create a new attachment. Use 'content' for base64-encoded file data OR 'externalLink' for external URLs. Attachments can be linked to memos.",
            inputSchema={
                "type": "object",
                "properties": {
                    "filename": {
                        "type": "string",
                        "description": "The filename of the attachment (required)",
                    },
                    "type": {
                        "type": "string",
                        "description": "MIME type of the attachment (required, e.g., 'image/png', 'application/pdf')",
                    },
                    "attachmentId": {
                        "type": "string",
                        "description": "Optional custom attachment ID",
                    },
                    "content": {
                        "type": "string",
                        "description": "Base64 encoded file content (alternative to externalLink, for small files)",
                    },
                    "externalLink": {
                        "type": "string",
                        "description": "External link URL for the attachment (alternative to content)",
                    },
                    "memo": {
                        "type": "string",
                        "description": "Related memo resource name (format: memos/{memo})",
                    },
                },
                "required": ["filename", "type"],
            },
        ),
        Tool(
            name="get_attachment",
            description="Get a specific attachment by ID",
            inputSchema={
                "type": "object",
                "properties": {
                    "attachmentId": {
                        "type": "string",
                        "description": "The ID or name of the attachment (e.g., '123' or 'attachments/123')",
                    },
                },
                "required": ["attachmentId"],
            },
        ),
        Tool(
            name="list_attachments",
            description="List all attachments with pagination, filtering, and sorting. Supports CEL expressions for filtering.",
            inputSchema={
                "type": "object",
                "properties": {
                    "pageSize": {
                        "type": "integer",
                        "description": "Maximum number of attachments to return (default: 50, max: 1000)",
                        "default": 50,
                        "minimum": 1,
                        "maximum": 1000,
                    },
                    "pageToken": {
                        "type": "string",
                        "description": "Page token from previous response for pagination",
                    },
                    "filter": {
                        "type": "string",
                        "description": "CEL expression to filter attachments. Examples: \"mime_type==\\\"image/png\\\"\", \"filename.contains(\\\"test\\\")\", \"memo==\\\"memos/1\\\"\"",
                    },
                    "orderBy": {
                        "type": "string",
                        "description": "Order to sort results by. Examples: 'create_time desc', 'filename asc'",
                    },
                },
                "required": [],
            },
        ),
        Tool(
            name="update_attachment",
            description="Update an existing attachment. Requires updateMask parameter specifying which fields to update.",
            inputSchema={
                "type": "object",
                "properties": {
                    "attachmentId": {
                        "type": "string",
                        "description": "The ID or name of the attachment to update",
                    },
                    "updateMask": {
                        "type": "string",
                        "description": "Comma-separated list of fields to update (e.g., 'filename,type,externalLink')",
                    },
                    "filename": {
                        "type": "string",
                        "description": "New filename",
                    },
                    "type": {
                        "type": "string",
                        "description": "New MIME type",
                    },
                    "content": {
                        "type": "string",
                        "description": "New base64 encoded file content",
                    },
                    "externalLink": {
                        "type": "string",
                        "description": "New external link URL",
                    },
                    "memo": {
                        "type": "string",
                        "description": "New related memo resource name (format: memos/{memo})",
                    },
                },
                "required": ["attachmentId", "updateMask"],
            },
        ),
        Tool(
            name="delete_attachment",
            description="Delete an attachment by ID",
            inputSchema={
                "type": "object",
                "properties": {
                    "attachmentId": {
                        "type": "string",
                        "description": "The ID or name of the attachment to delete",
                    },
                },
                "required": ["attachmentId"],
            },
        ),
    ]


def format_memo_id(memo_id: str) -> str:
    """
    Format memo ID to extract numeric ID if needed.

    Args:
        memo_id: The memo ID (could be '123', 'memos/123', or a UUID)

    Returns:
        The formatted memo ID
    """
    # If it's in the format 'memos/123', extract just the ID
    if memo_id.startswith("memos/"):
        return memo_id.split("/")[-1]
    return memo_id


@server.call_tool()
async def handle_call_tool(name: str, arguments: dict[str, Any]) -> list[TextContent | ImageContent | EmbeddedResource]:
    """Handle tool calls."""
    try:
        if name == "create_memo":
            content = arguments.get("content", "")
            visibility = arguments.get("visibility", "PRIVATE")
            state = arguments.get("state", "NORMAL")
            pinned = arguments.get("pinned", False)
            name = arguments.get("name")
            create_time = arguments.get("createTime")
            update_time = arguments.get("updateTime")
            display_time = arguments.get("displayTime")
            attachments = arguments.get("attachments")
            relations = arguments.get("relations")
            property = arguments.get("property")
            location = arguments.get("location")

            if not content:
                return [TextContent(type="text", text="Error: content is required")]

            result = await create_memo(
                content=content,
                visibility=visibility,
                state=state,
                pinned=pinned,
                name=name,
                create_time=create_time,
                update_time=update_time,
                display_time=display_time,
                attachments=attachments,
                relations=relations,
                property=property,
                location=location,
            )

            return [
                TextContent(
                    type="text",
                    text=json.dumps(result, indent=2, ensure_ascii=False)
                )
            ]

        elif name == "list_memos":
            page_size = arguments.get("pageSize")
            page_token = arguments.get("pageToken")
            state = arguments.get("state")
            order_by = arguments.get("orderBy")
            filter = arguments.get("filter")
            show_deleted = arguments.get("showDeleted")

            result = await list_memos(
                page_size=page_size,
                page_token=page_token,
                state=state,
                order_by=order_by,
                filter=filter,
                show_deleted=show_deleted,
            )

            return [
                TextContent(
                    type="text",
                    text=json.dumps(result, indent=2, ensure_ascii=False)
                )
            ]

        elif name == "get_memo":
            memo_id = arguments.get("memoId", "")
            if not memo_id:
                return [TextContent(type="text", text="Error: memo_id is required")]

            formatted_id = format_memo_id(memo_id)
            result = await get_memo(formatted_id)

            return [
                TextContent(
                    type="text",
                    text=json.dumps(result, indent=2, ensure_ascii=False)
                )
            ]

        elif name == "update_memo":
            memo_id = arguments.get("memoId", "")
            if not memo_id:
                return [TextContent(type="text", text="Error: memo_id is required")]

            formatted_id = format_memo_id(memo_id)
            result = await update_memo(
                memo_id=formatted_id,
                content=arguments.get("content"),
                visibility=arguments.get("visibility"),
                state=arguments.get("state"),
                pinned=arguments.get("pinned"),
                create_time=arguments.get("createTime"),
                update_time=arguments.get("updateTime"),
                display_time=arguments.get("displayTime"),
                attachments=arguments.get("attachments"),
                relations=arguments.get("relations"),
                property=arguments.get("property"),
                location=arguments.get("location"),
            )

            return [
                TextContent(
                    type="text",
                    text=json.dumps(result, indent=2, ensure_ascii=False)
                )
            ]

        elif name == "delete_memo":
            memo_id = arguments.get("memoId", "")
            if not memo_id:
                return [TextContent(type="text", text="Error: memo_id is required")]

            formatted_id = format_memo_id(memo_id)
            await delete_memo(formatted_id)

            return [
                TextContent(
                    type="text",
                    text=f"Successfully deleted memo: {memo_id}"
                )
            ]

        elif name == "list_memo_attachments":
            memo_id = arguments.get("memo_id", "")
            if not memo_id:
                return [TextContent(type="text", text="Error: memo_id is required")]

            formatted_id = format_memo_id(memo_id)
            page_size = arguments.get("pageSize")
            page_token = arguments.get("pageToken")

            result = await list_memo_attachments(
                memo_id=formatted_id,
                page_size=page_size,
                page_token=page_token,
            )

            return [
                TextContent(
                    type="text",
                    text=json.dumps(result, indent=2, ensure_ascii=False)
                )
            ]

        elif name == "set_memo_attachments":
            memo_id = arguments.get("memoId", "")
            attachments = arguments.get("attachments")
            if not memo_id:
                return [TextContent(type="text", text="Error: memo_id is required")]
            if attachments is None:
                return [TextContent(type="text", text="Error: attachments is required")]

            formatted_id = format_memo_id(memo_id)
            await set_memo_attachments(
                memo_id=formatted_id,
                attachments=attachments,
            )

            return [
                TextContent(
                    type="text",
                    text=f"Successfully set {len(attachments)} attachment(s) for memo: {memo_id}"
                )
            ]

        elif name == "create_attachment":
            filename = arguments.get("filename", "")
            type = arguments.get("type", "")
            attachment_id = arguments.get("attachmentId")
            content = arguments.get("content")
            external_link = arguments.get("externalLink")
            memo = arguments.get("memo")

            if not filename:
                return [TextContent(type="text", text="Error: filename is required")]
            if not type:
                return [TextContent(type="text", text="Error: type is required")]

            result = await create_attachment(
                filename=filename,
                type=type,
                attachment_id=attachment_id,
                content=content,
                external_link=external_link,
                memo=memo,
            )

            return [
                TextContent(
                    type="text",
                    text=json.dumps(result, indent=2, ensure_ascii=False)
                )
            ]

        elif name == "get_attachment":
            attachment_id = arguments.get("attachmentId", "")
            if not attachment_id:
                return [TextContent(type="text", text="Error: attachment_id is required")]

            # Format attachment ID similar to memo ID
            if attachment_id.startswith("attachments/"):
                attachment_id = attachment_id.split("/")[-1]

            result = await get_attachment(attachment_id)

            return [
                TextContent(
                    type="text",
                    text=json.dumps(result, indent=2, ensure_ascii=False)
                )
            ]

        elif name == "list_attachments":
            page_size = arguments.get("pageSize")
            page_token = arguments.get("pageToken")
            filter = arguments.get("filter")
            order_by = arguments.get("orderBy")

            result = await list_attachments(
                page_size=page_size,
                page_token=page_token,
                filter=filter,
                order_by=order_by,
            )

            return [
                TextContent(
                    type="text",
                    text=json.dumps(result, indent=2, ensure_ascii=False)
                )
            ]

        elif name == "update_attachment":
            attachment_id = arguments.get("attachmentId", "")
            update_mask = arguments.get("updateMask", "")
            if not attachment_id:
                return [TextContent(type="text", text="Error: attachment_id is required")]
            if not update_mask:
                return [TextContent(type="text", text="Error: update_mask is required")]

            # Format attachment ID
            if attachment_id.startswith("attachments/"):
                attachment_id = attachment_id.split("/")[-1]

            result = await update_attachment(
                attachment_id=attachment_id,
                update_mask=update_mask,
                filename=arguments.get("filename"),
                type=arguments.get("type"),
                content=arguments.get("content"),
                external_link=arguments.get("externalLink"),
                memo=arguments.get("memo"),
            )

            return [
                TextContent(
                    type="text",
                    text=json.dumps(result, indent=2, ensure_ascii=False)
                )
            ]

        elif name == "delete_attachment":
            attachment_id = arguments.get("attachmentId", "")
            if not attachment_id:
                return [TextContent(type="text", text="Error: attachment_id is required")]

            # Format attachment ID
            if attachment_id.startswith("attachments/"):
                attachment_id = attachment_id.split("/")[-1]

            await delete_attachment(attachment_id)

            return [
                TextContent(
                    type="text",
                    text=f"Successfully deleted attachment: {attachment_id}"
                )
            ]

        else:
            return [TextContent(type="text", text=f"Unknown tool: {name}")]

    except httpx.HTTPStatusError as e:
        return [
            TextContent(
                type="text",
                text=f"HTTP Error {e.response.status_code}: {e.response.text}"
            )
        ]
    except Exception as e:
        return [TextContent(type="text", text=f"Error: {str(e)}")]


async def main():
    """Main entry point for the server."""
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options(),
        )


if __name__ == "__main__":
    asyncio.run(main())
