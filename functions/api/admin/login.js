import { createAdminSession } from "../../_utils/auth.js";

export async function onRequestPost(context) {
    try {
        const { request, env } = context;

        const body = await request.json();

        const username = body.username?.trim();
        const password = body.password;

        if (!username || !password) {
            return Response.json(
                {
                    success: false,
                    error: "Username and password are required."
                },
                { status: 400 }
            );
        }

        if (
            username !== env.ADMIN_USERNAME ||
            password !== env.ADMIN_PASSWORD
        ) {
            return Response.json(
                {
                    success: false,
                    error: "Invalid username or password."
                },
                { status: 401 }
            );
        }

        const sessionToken = await createAdminSession(
            env.SESSION_SECRET
        );

        return new Response(
            JSON.stringify({
                success: true
            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Set-Cookie":
                        `sarah_admin_session=${sessionToken}; ` +
                        `Path=/; ` +
                        `HttpOnly; ` +
                        `Secure; ` +
                        `SameSite=Strict; ` +
                        `Max-Age=604800`
                }
            }
        );
    } catch (error) {
        return Response.json(
            {
                success: false,
                error: "Unable to process login."
            },
            { status: 500 }
        );
    }
}