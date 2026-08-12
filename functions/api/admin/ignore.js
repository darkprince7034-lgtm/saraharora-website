import { verifyAdminSession } from "../../_utils/auth.js";

export async function onRequestPost(context) {
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

    try {
        const body = await request.json();

        const conversationId =
            body.conversationId?.trim();

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

        await env.DB
            .prepare(`
                UPDATE conversations
                SET
                    status = 'ignored',
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
            status: "ignored"
        });

    } catch (error) {

        console.error(
            "Failed to ignore conversation:",
            error
        );

        return Response.json(
            {
                success: false,
                error: "Unable to ignore conversation."
            },
            { status: 500 }
        );
    }
}