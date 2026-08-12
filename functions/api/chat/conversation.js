function generateId(length = 8) {
    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

    const bytes = crypto.getRandomValues(
        new Uint8Array(length)
    );

    let result = "";

    for (const byte of bytes) {
        result += chars[byte % chars.length];
    }

    return result;
}

function generateToken() {
    const bytes = crypto.getRandomValues(
        new Uint8Array(32)
    );

    let binary = "";

    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

export async function onRequestPost(context) {
    const { env } = context;

    try {
        const conversationId = generateId(8);
        const visitorToken = generateToken();

        const now = new Date().toISOString();

        await env.DB.prepare(`
            INSERT INTO conversations (
                id,
                visitor_token,
                status,
                created_at,
                updated_at
            )
            VALUES (?, ?, 'pending', ?, ?)
        `)
        .bind(
            conversationId,
            visitorToken,
            now,
            now
        )
        .run();

        const headers = new Headers({
            "Content-Type": "application/json",

            "Set-Cookie":
                `sarah_chat_token=${visitorToken}; ` +
                `Path=/; ` +
                `HttpOnly; ` +
                `Secure; ` +
                `SameSite=Strict; ` +
                `Max-Age=31536000`
        });

        return new Response(
            JSON.stringify({
                success: true,
                conversationId
            }),
            {
                status: 200,
                headers
            }
        );

    } catch (error) {

        console.error(
            "Failed to create conversation:",
            error
        );

        return Response.json(
            {
                success: false,
                error: "Unable to create conversation."
            },
            { status: 500 }
        );
    }
}