import { verifyAdminSession } from "../../_utils/auth.js";

export async function onRequestGet(context) {
    const { request, env } = context;

    const authenticated = await verifyAdminSession(
        request,
        env.SESSION_SECRET
    );

    if (!authenticated) {
        return Response.json(
            {
                success: false,
                error: "Unauthorized"
            },
            { status: 401 }
        );
    }

    const url = new URL(request.url);
    const conversationId = url.searchParams.get("id");

    if (!conversationId) {
        return Response.json(
            {
                success: false,
                error: "Conversation ID is required."
            },
            { status: 400 }
        );
    }

    try {
        const conversation = await env.DB
            .prepare(`
                SELECT
                    id,
                    status,
                    created_at,
                    updated_at
                FROM conversations
                WHERE id = ?
                LIMIT 1
            `)
            .bind(conversationId)
            .first();

        if (!conversation) {
            return Response.json(
                {
                    success: false,
                    error: "Conversation not found."
                },
                { status: 404 }
            );
        }

        const { results: messages } = await env.DB
            .prepare(`
                SELECT
                    id,
                    sender,
                    message,
                    created_at,
                    delivered
                FROM messages
                WHERE conversation_id = ?
                ORDER BY id ASC
            `)
            .bind(conversationId)
            .all();

        return Response.json({
            success: true,
            conversation,
            messages
        });

    } catch (error) {

        console.error(
            "Failed to load conversation:",
            error
        );

        return Response.json(
            {
                success: false,
                error: "Failed to load conversation."
            },
            { status: 500 }
        );
    }
}