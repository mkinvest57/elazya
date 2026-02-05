import OnboardingWizard from "@/components/OnboardingWizard";

interface SetupProps {
    onComplete: () => void;
}

export default function Setup({ onComplete }: SetupProps) {
    return <OnboardingWizard onComplete={onComplete} />;
}
