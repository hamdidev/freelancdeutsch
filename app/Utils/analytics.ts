type EventProperties = Record<string, string | number | boolean>;

export function track(event: string, properties?: EventProperties): void {
    // In development — just log to console
    if (import.meta.env.DEV) {
        console.debug("[analytics]", event, properties);
        return;
    }

    // In production — wire up your analytics provider here
    // e.g. Plausible, Fathom, or PostHog (all DSGVO-friendly)
    // window.plausible?.(event, { props: properties })
}
