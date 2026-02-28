interface ToggleProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    label?: string;
    description?: string;
    disabled?: boolean;
}

export function Toggle({ enabled, onChange, label, description, disabled = false }: ToggleProps) {
    return (
        <div className={`flex items-center justify-between ${disabled ? 'opacity-50' : ''}`}>
            <div className="flex-1">
                {label && <p className="text-sm font-medium text-white">{label}</p>}
                {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
            </div>
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && onChange(!enabled)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${enabled ? 'bg-cyan-500' : 'bg-zinc-700'
                    } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                />
            </button>
        </div>
    );
}
