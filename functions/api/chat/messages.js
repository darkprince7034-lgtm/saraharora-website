function getVisitorToken(request) {
    const cookieHeader = request.headers.get("Cookie") || "";

    const match = cookieHeader.match(
        /(?:^|;\s*)sarah_chat_token=([^;]+)/
    );

    return match ? match[1] : null;
}

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const visitorToken = getVisitorToken(request);

        if (!visitorToken) {
            return Response.json(
                {
                    success: false,
                    error: "Chat session not found."
                },
                { status: 401 }
            );
        }

        const body = await request.json();

        const conversationId =
            body.conversationId?.trim();

        const message =
            body.message?.trim();

        if (!conversationId || !message) {
            return Response.json(
                {
                    success: false,
                    error: "Conversation ID and message are required."
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

        const conversation = await env.DB
            .prepare(`
                SELECT id
                FROM conversations
                WHERE id = ?
                  AND visitor_token = ?
                LIMIT 1
            `)
            .bind(
                conversationId,
                visitorToken
            )
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

        const now = new Date().toISOString();

        const result = await env.DB
            .prepare(`
                INSERT INTO messages (
                    conversation_id,
                    sender,
                    message,
                    created_at,
                    delivered
                )
                VALUES (?, 'visitor', ?, ?, 1)
            `)
            .bind(
                conversationId,
                message,
                now
            )
            .run();

        await env.DB
            .prepare(`
                UPDATE conversations
                SET
                    status = 'pending',
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
            messageId: result.meta.last_row_id,
            createdAt: now
        });

    } catch (error) {

        console.error(
            "Failed to send visitor message:",
            error
        );

        return Response.json(
            {
                success: false,
                error: "Unable to send message."
            },
            { status: 500 }
        );
    }
}

export async function onRequestGet(context) {
    const { request, env } = context;

    try {
        const visitorToken = getVisitorToken(request);

        if (!visitorToken) {
            return Response.json(
                {
                    success: false,
                    error: "Chat session not found."
                },
                { status: 401 }
            );
        }

        const url = new URL(request.url);

        const conversationId =
            url.searchParams.get("conversationId");

        if (!conversationId) {
            return Response.json(
                {
                    success: false,
                    error: "Conversation ID is required."
                },
                { status: 400 }
            );
        }

        const conversation = await env.DB
            .prepare(`
                SELECT
                    id,
                    status,
                    created_at,
                    updated_at
                FROM conversations
                WHERE id = ?
                  AND visitor_token = ?
                LIMIT 1
            `)
            .bind(
                conversationId,
                visitorToken
            )
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
            "Failed to load messages:",
            error
        );

        return Response.json(
            {
                success: false,
                error: "Unable to load conversation."
            },
            { status: 500 }
        );
    }
}