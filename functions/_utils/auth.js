const encoder = new TextEncoder();

function base64urlEncode(bytes) {
    let binary = "";
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}

function base64urlDecode(value) {
    value = value.replace(/-/g, "+").replace(/_/g, "/");

    while (value.length % 4) {
        value += "=";
    }

    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
}

async function getSigningKey(secret) {
    return crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        {
            name: "HMAC",
            hash: "SHA-256"
        },
        false,
        ["sign", "verify"]
    );
}

export async function createAdminSession(secret) {
    const expiresAt = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);

    const payload = JSON.stringify({
        role: "admin",
        exp: expiresAt,
        nonce: crypto.randomUUID()
    });

    const payloadEncoded = base64urlEncode(
        encoder.encode(payload)
    );

    const key = await getSigningKey(secret);

    const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(payloadEncoded)
    );

    const signatureEncoded = base64urlEncode(
        new Uint8Array(signature)
    );

    return `${payloadEncoded}.${signatureEncoded}`;
}

export async function verifyAdminSession(request, secret) {
    const cookieHeader = request.headers.get("Cookie") || "";

    const match = cookieHeader.match(
        /(?:^|;\s*)sarah_admin_session=([^;]+)/
    );

    if (!match) {
        return false;
    }

    const token = match[1];
    const parts = token.split(".");

    if (parts.length !== 2) {
        return false;
    }

    const [payloadEncoded, signatureEncoded] = parts;

    try {
        const key = await getSigningKey(secret);

        const signature = base64urlDecode(signatureEncoded);

        const valid = await crypto.subtle.verify(
            "HMAC",
            key,
            signature,
            encoder.encode(payloadEncoded)
        );

        if (!valid) {
            return false;
        }

        const payload = JSON.parse(
            new TextDecoder().decode(
                base64urlDecode(payloadEncoded)
            )
        );

        if (payload.role !== "admin") {
            return false;
        }

        if (payload.exp < Math.floor(Date.now() / 1000)) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
}