import { useState, useCallback } from "react";
import Setup from "./pages/Setup";
import Dashboard from "./pages/Dashboard";
import { OpenClawClient } from "./lib/openclaw-client";
import { hasLicense } from "./lib/license";

import PrerequisitesCheck from "./components/PrerequisitesCheck";
import OnboardingWizardV3 from "./components/OnboardingWizardV3";

import { ToastProvider } from "./components/ToastProvider";
import { useLicenseListener } from "./hooks/useLicenseListener";

function App() {
    const [appState, setAppState] = useState<'checking' | 'onboarding' | 'dashboard'>('checking');

    // Listen for license upgrade events from deep links (elazya://upgrade-success)
    const handleLicenseUpdate = useCallback((plan: string, key: string) => {
        console.log(`[App] License upgraded to ${plan}, reloading UI...`);
        // Reset to 'checking' to re-evaluate license and route to dashboard
        setAppState('checking');
    }, []);

    useLicenseListener(handleLicenseUpdate);

    return (
        <ToastProvider>
            <div className="w-screen h-screen bg-[#09090b] overflow-hidden flex flex-col font-sans">

                {/* Main Content */}
                <div className="flex-1 overflow-hidden relative">
                    {appState === 'checking' && (
                        <PrerequisitesCheck onReady={async () => {
                            // Check if user has license + completed onboarding
                            const licensed = await hasLicense();
                            const onboarded = localStorage.getItem('elazya_v2_configured') === 'true';

                            if (licensed && onboarded) {
                                // Check if engine is configured too
                                const engineOk = await OpenClawClient.isSetupComplete();
                                setAppState(engineOk ? 'dashboard' : 'onboarding');
                            } else {
                                setAppState('onboarding');
                            }
                        }} />
                    )}

                    {appState === 'dashboard' && <Dashboard />}
                    {appState === 'onboarding' && (
                        <OnboardingWizardV3 onComplete={() => setAppState('dashboard')} />
                    )}
                </div>
            </div>
        </ToastProvider>
    );
}

export default App;
