import { config } from '../config.js';
// Render's free plan sleeps a service after 15 minutes without inbound traffic.
// Pinging our own public URL counts as inbound traffic, so the service stays awake.
export function startKeepAlive() {
    const { url, intervalMinutes } = config.keepAlive;
    if (!url || !(intervalMinutes > 0))
        return;
    const target = `${url}/api/health`;
    const ping = async () => {
        try {
            const res = await fetch(target, { signal: AbortSignal.timeout(30_000) });
            if (!res.ok)
                console.warn(`[keep-alive] ${target} responded ${res.status}`);
        }
        catch (err) {
            console.warn(`[keep-alive] ping failed: ${err.message}`);
        }
    };
    setInterval(ping, intervalMinutes * 60_000).unref();
    console.log(`[keep-alive] pinging ${target} every ${intervalMinutes} min`);
}
