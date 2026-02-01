import { useState } from "react";
import Setup from "./pages/Setup";
import Dashboard from "./pages/Dashboard";
import { OpenClawClient } from "./lib/openclaw-client";
import { TitleBar } from "./components/TitleBar";

import PrerequisitesCheck from "./components/PrerequisitesCheck";

import { ToastProvider } from "./components/ToastProvider";

function App() {
    const [appState, setAppState] = useState<'checking' | 'setup' | 'dashboard'>('checking');

    return (
        <ToastProvider>
            <div className="w-screen h-screen bg-transparent p-2 overflow-hidden flex flex-col font-sans">
                <div className="flex-1 flex flex-col bg-[#09090b] rounded-xl border border-white/10 shadow-none overflow-hidden relative">
                    {/* Background ambient effects - simplified as we have body aurora */}

                    <TitleBar />

                    <div className="flex-1 overflow-hidden relative z-10">
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
            </div>
        </ToastProvider>
    );
}

export default App;
