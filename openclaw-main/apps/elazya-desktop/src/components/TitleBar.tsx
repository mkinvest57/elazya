import { getCurrentWindow } from '@tauri-apps/api/window';

export function TitleBar() {
    const win = getCurrentWindow();

    return (
        <div
            data-tauri-drag-region
            className="h-12 flex items-center justify-center select-none relative z-[9999] shrink-0"
        >
            {/* 1. Spacer for native traffic lights (macOS) */}
            <div className="w-20 shrink-0" />

            {/* 2. Drag Region with title */}
            <div
                data-tauri-drag-region
                className="flex-1 h-full flex items-center justify-center cursor-grab"
                onDoubleClick={() => win.toggleMaximize()}
            >
                <span className="text-xs font-medium text-white/40 tracking-widest uppercase pointer-events-none font-mono">
                    ELAZYA
                </span>
            </div>

            {/* 3. Spacer for balance */}
            <div className="w-20 shrink-0" />
        </div>
    );
}
