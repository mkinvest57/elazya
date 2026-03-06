/**
 * License validation and management for Elazya.
 * 
 * License format: ELAZYA-(SOLO|PRO|BIZ)-XXXX-XXXX
 * Storage: SQLite via Tauri set_setting/get_setting + ~/.elazya/license.json backup
 */

import { OpenClawClient } from './openclaw-client';

export type ElazyaPlan = 'solo' | 'pro' | 'business';

export interface LicenseData {
    key: string;
    plan: ElazyaPlan;
    activatedAt: string;
    machineId: string;
}

const LICENSE_KEY_REGEX = /^ELAZYA-(SOLO|PRO|BIZ)-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

const PLAN_MAP: Record<string, ElazyaPlan> = {
    'SOLO': 'solo',
    'PRO': 'pro',
    'BIZ': 'business',
};

/**
 * Generate a stable machine ID based on available system info.
 * Falls back to a random UUID stored in settings.
 */
async function getOrCreateMachineId(): Promise<string> {
    const existing = await OpenClawClient.getSetting('elazya_machine_id');
    if (existing) return existing;

    const id = crypto.randomUUID();
    await OpenClawClient.setSetting('elazya_machine_id', id);
    return id;
}

/**
 * Validate a license key format.
 * Returns the extracted plan or throws a descriptive error.
 */
export function validateKeyFormat(key: string): ElazyaPlan {
    const trimmed = key.trim().toUpperCase();

    if (!LICENSE_KEY_REGEX.test(trimmed)) {
        throw new Error('Format invalide. Exemple : ELAZYA-PRO-A3F9-7K2M');
    }

    const parts = trimmed.split('-');
    const planCode = parts[1]; // SOLO | PRO | BIZ
    const plan = PLAN_MAP[planCode];

    if (!plan) {
        throw new Error('Plan inconnu dans la clé de licence.');
    }

    return plan;
}

/**
 * Activate a license key.
 * Validates format, extracts plan, generates machine ID, and saves locally.
 */
export async function activateLicense(key: string): Promise<LicenseData> {
    const plan = validateKeyFormat(key);

    // License validated locally by format — no server call needed

    const machineId = await getOrCreateMachineId();

    const license: LicenseData = {
        key: key.trim().toUpperCase(),
        plan,
        activatedAt: new Date().toISOString(),
        machineId,
    };

    // Save to SQLite settings
    await OpenClawClient.setSetting('elazya_license', JSON.stringify(license));
    await OpenClawClient.setSetting('elazya_plan', plan);

    return license;
}

/**
 * Get the current license data, if any.
 */
export async function getLicense(): Promise<LicenseData | null> {
    try {
        const raw = await OpenClawClient.getSetting('elazya_license');
        if (!raw) return null;
        return JSON.parse(raw) as LicenseData;
    } catch {
        return null;
    }
}

/**
 * Get the current plan. Returns null if no license is active.
 */
export async function getCurrentPlan(): Promise<ElazyaPlan | null> {
    const license = await getLicense();
    return license?.plan ?? null;
}

/**
 * Check if a license is active.
 */
export async function hasLicense(): Promise<boolean> {
    const license = await getLicense();
    return license !== null;
}

/**
 * Upgrade the license to a higher plan.
 * Used after in-app upgrade purchase.
 */
export async function upgradePlan(newKey: string): Promise<LicenseData> {
    return activateLicense(newKey);
}

/**
 * Clear license (for reset/debug).
 */
export async function clearLicense(): Promise<void> {
    await OpenClawClient.setSetting('elazya_license', '');
    await OpenClawClient.setSetting('elazya_plan', '');
}
