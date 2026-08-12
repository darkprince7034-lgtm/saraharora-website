import { verifyAdminSession } from "../../_utils/auth.js";

export async function onRequestGet(context) {
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
        const { results } = await env.DB.prepare(`
            SELECT
                c.id,
                c.status,
                c.created_at,
                c.updated_at,
                (
                    SELECT m.message
                    FROM messages m
                    WHERE m.conversation_id = c.id
                    ORDER BY m.id DESC
                    LIMIT 1
                ) AS latest_message,
                (
                    SELECT m.sender
                    FROM messages m
                    WHERE m.conversation_id = c.id
                    ORDER BY m.id DESC
                    LIMIT 1
                ) AS latest_sender
            FROM conversations c
            ORDER BY c.updated_at DESC
        `).all();

        return Response.json({
            success: true,
            conversations: results
        });

    } catch (error) {

        console.error(
            "Failed to load conversations:",
            error
        );

        return Response.json(
            {
                success: false,
                error: "Failed to load conversations."
            },
            { status: 500 }
        );
    }
}