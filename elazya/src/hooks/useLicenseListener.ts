/**
 * useLicenseListener — Listens for `license-updated` Tauri events.
 *
 * When the Rust deep-link handler processes an `elazya://upgrade-success` URL,
 * it writes the new license to ~/.elazya/license.json and emits a
 * `license-updated` event. This hook listens for that event and triggers
 * a callback so the UI can reload to reflect the new plan.
 */

import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { activateLicense } from '../lib/license';

interface LicenseUpdatedPayload {
    plan: string;
    key: string;
}

export function useLicenseListener(onUpdate: (plan: string, key: string) => void) {
    useEffect(() => {
        const unlisten = listen<LicenseUpdatedPayload>('license-updated', async (event) => {
            const { plan, key } = event.payload;
            console.log(`[LicenseListener] Received upgrade event — plan: ${plan}, key: ${key}`);

            try {
                // Save the new key to SQLite via the existing license module
                await activateLicense(key);
                console.log(`[LicenseListener] License activated in SQLite: ${key}`);
            } catch (err) {
                console.error('[LicenseListener] Failed to activate license in SQLite:', err);
            }

            // Notify parent component to reload UI
            onUpdate(plan, key);
        });

        return () => {
            unlisten.then(fn => fn());
        };
    }, [onUpdate]);
}
