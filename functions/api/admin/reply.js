import { verifyAdminSession } from "../../_utils/auth.js";

export async function onRequestPost(context) {
    const { request, env } = context;

    // Verify admin session
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

    try {
        const body = await request.json();

        const conversationId =
            body.conversationId?.trim();

        const message =
            body.message?.trim();

        if (!conversationId || !message) {
            return Response.json(
                {
                    success: false,
                    error:
                        "Conversation ID and message are required."
                },
                { status: 400 }
            );
        }

        if (message.length > 5000) {
            return Response.json(
                {
                    success: false,
                    error: "Message is too long."
                },
                { status: 400 }
            );
        }

        // Make sure the conversation actually exists
        const conversation = await env.DB
            .prepare(`
                SELECT id
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

        const now =
            new Date().toISOString();

        // Insert Sarah's reply
        const result = await env.DB
            .prepare(`
                INSERT INTO messages (
                    conversation_id,
                    sender,
                    message,
                    created_at,
                    delivered
                )
                VALUES (?, 'admin', ?, ?, 0)
            `)
            .bind(
                conversationId,
                message,
                now
            )
            .run();

        // Move conversation to replied
        await env.DB
            .prepare(`
                UPDATE conversations
                SET
                    status = 'replied',
                    updated_at = ?
                WHERE id = ?
            `)
            .bind(
                now,
                conversationId
            )
            .run();

        return Response.json({
            success: true,
            messageId:
                result.meta.last_row_id,
            createdAt: now
        });

    } catch (error) {

        console.error(
            "Failed to send admin reply:",
            error
        );

        return Response.json(
            {
                success: false,
                error:
                    "Unable to send reply."
            },
            { status: 500 }
        );
    }
}