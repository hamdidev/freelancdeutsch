export function track(event: string, properties?: Record<string, unknown>): void {
    if (typeof window === 'undefined') return;

    // Forward to gtag if available
    const w = window as unknown as { gtag?: (...args: unknown[]) => void }
    if (typeof w.gtag === 'function') {
        w.gtag('event', event, properties ?? {})
    }

    if (import.meta.env.DEV) {
        console.debug('[analytics]', event, properties);
    }
}
