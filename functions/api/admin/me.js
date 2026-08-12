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
                authenticated: false
            },
            { status: 401 }
        );
    }

    return Response.json({
        authenticated: true
    });
}