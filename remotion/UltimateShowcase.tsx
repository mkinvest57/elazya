import React from 'react';
import { AbsoluteFill, Series, Sequence, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { Intro, TextOverlay, DynamicStories, StoryItem, Q4EarningsReveal } from './Compositions';
import { WireframeSphere } from './WireframeSphere';
import { loadFont } from '@remotion/google-fonts/Inter';

// Load Inter font for text overlays
const { fontFamily } = loadFont();

// Constants for this composition
const FPS = 30;
const DURATION_TOTAL_SECONDS = 30;
const DURATION_TOTAL_FRAMES = DURATION_TOTAL_SECONDS * FPS;

// Segment durations in frames
const DURATION_INTRO_3D_FRAMES = 5 * FPS;   // 0-5s
const DURATION_DATA_FRAMES = 10 * FPS;     // 5-15s
const DURATION_STORY_FRAMES = 10 * FPS;    // 15-25s
const DURATION_OUTRO_FRAMES = 5 * FPS;     // 25-30s

export const UltimateShowcase: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    // Outro logo text opacity fade in (for the last 2 seconds)
    const outroLogoOpacity = interpolate(
        frame,
        [durationInFrames - 60, durationInFrames - 30], // Fade in from frame 28s to 29s
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    const dynamicStoriesContent: StoryItem[] = [
        {
            type: 'text',
            durationInFrames: DURATION_STORY_FRAMES / 3, // ~3.33 seconds per slide
            text: 'Innovation constante',
            backgroundColor: '#003366',
            textColor: '#ADD8E6',
        },
        {
            type: 'text',
            durationInFrames: DURATION_STORY_FRAMES / 3,
            text: 'Performances inégalées',
            backgroundColor: '#006633',
            textColor: '#90EE90',
        },
        {
            type: 'text',
            durationInFrames: DURATION_STORY_FRAMES / 3,
            text: 'Technologies de pointe',
            backgroundColor: '#663300',
            textColor: '#FFD700',
        },
    ];

    return (
        <AbsoluteFill>
            <Series>
                {/* 0-5s: Intro 3D (WireframeSphere + Title) */}
                <Series.Sequence durationInFrames={DURATION_INTRO_3D_FRAMES}>
                    <WireframeSphere />
                    {/* Overlay title for 3D ENGINE ACTIVATED */}
                    <AbsoluteFill style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'transparent',
                        zIndex: 1 // Ensure text is above 3D scene
                    }}>
                        <div style={{
                            fontFamily,
                            fontSize: 80,
                            fontWeight: 'bold',
                            color: 'white',
                            textAlign: 'center',
                            textShadow: '0 0 10px #00d4ff' // Neon glow effect
                        }}>
                            3D ENGINE ACTIVATED
                        </div>
                    </AbsoluteFill>
                </Series.Sequence>

                {/* 5-15s: Data (Q4EarningsReveal) */}
                <Series.Sequence durationInFrames={DURATION_DATA_FRAMES}>
                    <Q4EarningsReveal
                        companyName="CyberDyne Systems"
                        quarter="Q4 2025"
                        revenue="$99B"
                        netIncome="$25B" // Added a value for netIncome
                        growth="+500%"
                        primaryColor="#00d4ff"
                        secondaryColor="#ff00d4"
                    />
                </Series.Sequence>

                {/* 15-25s: Story (DynamicStories) */}
                <Series.Sequence durationInFrames={DURATION_STORY_FRAMES}>
                    <DynamicStories stories={dynamicStoriesContent} />
                </Series.Sequence>

                {/* 25-30s: Outro */}
                <Series.Sequence durationInFrames={DURATION_OUTRO_FRAMES}>
                    <AbsoluteFill style={{
                        backgroundColor: 'black',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <div style={{
                            fontFamily,
                            fontSize: 120,
                            fontWeight: 'bold',
                            color: 'white',
                            opacity: outroLogoOpacity,
                            textAlign: 'center'
                        }}>
                            🌐 Alizé
                        </div>
                    </AbsoluteFill>
                </Series.Sequence>
            </Series>
        </AbsoluteFill>
    );
};