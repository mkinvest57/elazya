import { useState } from "react";
import Setup from "./pages/Setup";
import Dashboard from "./pages/Dashboard";
import { OpenClawClient } from "./lib/openclaw-client";


import PrerequisitesCheck from "./components/PrerequisitesCheck";

import { ToastProvider } from "./components/ToastProvider";

function App() {
    const [appState, setAppState] = useState<'checking' | 'setup' | 'dashboard'>('checking');

    return (
        <ToastProvider>
            <div className="w-screen h-screen bg-[#09090b] overflow-hidden flex flex-col font-sans">


                {/* Main Content */}
                <div className="flex-1 overflow-hidden relative">
                    {appState === 'checking' && (
                        <PrerequisitesCheck onReady={() => {
                            // Versioned config flag to force new wizard for v2 upgrade
                            const configured = localStorage.getItem('elazya_v2_configured') === 'true';

                            if (configured) {
                                OpenClawClient.isSetupComplete().then(isConfigured => {
                                    setAppState(isConfigured ? 'dashboard' : 'setup');
                                });
                            } else {
                                // Force setup if v2 flag is missing, even if engine is configured
                                setAppState('setup');
                            }
                        }} />
                    )}

                    {appState === 'dashboard' && <Dashboard />}
                    {appState === 'setup' && <Setup onComplete={() => setAppState('dashboard')} />}
                </div>
            </div>
        </ToastProvider>
    );
}

export default App;
