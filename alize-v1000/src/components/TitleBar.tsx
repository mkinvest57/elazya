import { getCurrentWindow } from '@tauri-apps/api/window';
import { X, Minus, Maximize2 } from 'lucide-react';

export function TitleBar() {
    const win = getCurrentWindow();

    return (
        <div className="h-10 flex items-center justify-between select-none relative z-[9999]">
            {/* 1. Button Container - NOT DRAGGABLE */}
            <div className="flex items-center px-4 gap-2 z-50 pointer-events-auto">
                <button
                    onClick={() => win.close()}
                    className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57]/80 flex items-center justify-center transition-all shadow-sm border border-black/10 active:scale-95"
                >
                    <X className="w-2 h-2 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
                </button>
                <button
                    onClick={() => win.minimize()}
                    className="w-3 h-3 rounded-full bg-[#FEBC2E] hover:bg-[#FEBC2E]/80 flex items-center justify-center transition-all shadow-sm border border-black/10 active:scale-95"
                >
                    <Minus className="w-2 h-2 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
                </button>
                <button
                    onClick={() => win.toggleMaximize()}
                    className="w-3 h-3 rounded-full bg-[#28C840] hover:bg-[#28C840]/80 flex items-center justify-center transition-all shadow-sm border border-black/10 active:scale-95"
                >
                    <Maximize2 className="w-2 h-2 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
                </button>
            </div>

            {/* 2. Drag Region - Use Flex to fill remaining space without overlap */}
            <div data-tauri-drag-region className="flex-1 h-full flex items-center justify-center">
                <span className="text-xs font-medium text-white/40 tracking-widest uppercase pointer-events-none font-mono">
                    ELAZYA
                </span>
            </div>

            {/* 3. Spacer for balance */}
            <div className="w-20"></div>
        </div>
    );
}
