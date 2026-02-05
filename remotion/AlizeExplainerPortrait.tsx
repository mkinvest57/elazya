import React from 'react';
import { AbsoluteFill, useVideoConfig, useCurrentFrame, interpolate, spring, Series, Sequence } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Outfit';

const { fontFamily } = loadFont();

const HypeText: React.FC<{ text: string, color?: string, delay?: number }> = ({ text, color = '#fff', delay = 0 }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const opacity = interpolate(frame - delay, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
    const scale = spring({
        frame: frame - delay,
        fps,
        from: 0.5,
        to: 1,
        config: { damping: 10 }
    });

    return (
        <div style={{
            opacity,
            transform: `scale(${scale})`,
            color,
            fontSize: 160,
            fontWeight: 950,
            letterSpacing: -10,
            fontFamily,
            textAlign: 'center',
            fontStyle: 'italic'
        }}>
            {text}
        </div>
    );
};

export const AlizeExplainerPortrait: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    return (
        <AbsoluteFill style={{ backgroundColor: 'black', color: 'white' }}>
            <Series>
                {/* Scene 1: Sovereignty */}
                <Series.Sequence durationInFrames={60}>
                    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <HypeText text="L'IA CHEZ VOUS." />
                        <div style={{
                            marginTop: 40,
                            fontSize: 24,
                            textTransform: 'uppercase',
                            letterSpacing: 10,
                            opacity: interpolate(frame, [10, 20], [0, 0.4])
                        }}>100% Locale. Française.</div>
                    </AbsoluteFill>
                </Series.Sequence>

                {/* Scene 2: 44 Skills */}
                <Series.Sequence durationInFrames={90}>
                    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{
                            fontSize: 300,
                            fontWeight: 900,
                            fontStyle: 'italic',
                            opacity: 0.1,
                            position: 'absolute'
                        }}>44</div>
                        <HypeText text="44 SKILLS." delay={10} color="#00e5ff" />
                        <div style={{
                            marginTop: 20,
                            fontSize: 24,
                            color: 'rgba(255,255,255,0.4)',
                            textAlign: 'center',
                            maxWidth: 600
                        }}>Mails, Impôts, Doctolib... <br /> Elazya agit sur votre monde.</div>
                    </AbsoluteFill>
                </Series.Sequence>

                {/* Scene 3: Privacy */}
                <Series.Sequence durationInFrames={90}>
                    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <HypeText text="VOTRE VIE." delay={15} color="#00e5ff" />
                        <div style={{
                            marginTop: 40,
                            fontSize: 20,
                            textTransform: 'uppercase',
                            letterSpacing: 5,
                            opacity: 0.3
                        }}>Zéro donnée envoyée ailleurs.</div>
                    </AbsoluteFill>
                </Series.Sequence>

                {/* Scene 4: Final */}
                <Series.Sequence durationInFrames={60}>
                    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <HypeText text="ELAZYA." />
                        <div style={{
                            marginTop: 20,
                            width: 160,
                            height: 4,
                            backgroundColor: '#00e5ff'
                        }} />
                        <div style={{
                            marginTop: 40,
                            fontSize: 24,
                            fontWeight: 900,
                            letterSpacing: 8
                        }}>SOUVERAINETÉ TOTALE.</div>
                    </AbsoluteFill>
                </Series.Sequence>
            </Series>

            {/* Kinetic Noise Gradient Overlay */}
            <AbsoluteFill style={{
                background: 'radial-gradient(circle, transparent 0%, black 100%)',
                opacity: 0.5,
                pointerEvents: 'none'
            }} />

            {/* Kinetic Glitches */}
            {frame % 15 < 2 && (
                <AbsoluteFill style={{ background: 'white', opacity: 0.05 }} />
            )}
        </AbsoluteFill>
    );
};
