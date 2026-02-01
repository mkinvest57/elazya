import React from 'react';
import { AbsoluteFill, Series, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { Intro, TextOverlay, DynamicStories, StoryItem } from './Compositions';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont();

export const AlizeExplainer: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    const stories: StoryItem[] = [
        {
            type: 'intro',
            durationInFrames: 90,
            title: 'ALIZÉ',
            subtitle: 'L\'IA qui travaille pour vous.',
            backgroundColor: '#0a0a0b',
        },
        {
            type: 'text',
            durationInFrames: 120,
            text: 'Trier vos emails ? Alizé s\'en occupe.',
            backgroundColor: '#002244',
            textColor: '#00d4ff',
        },
        {
            type: 'text',
            durationInFrames: 120,
            text: 'Résumer vos cours ? En un clic.',
            backgroundColor: '#004422',
            textColor: '#90EE90',
        },
        {
            type: 'text',
            durationInFrames: 120,
            text: 'Factures pro ? Tout est prêt.',
            backgroundColor: '#442200',
            textColor: '#FFD700',
        },
        {
            type: 'text',
            durationInFrames: 90,
            text: 'Gagnez 2h chaque jour.',
            backgroundColor: '#000000',
            textColor: '#ffffff',
        }
    ];

    return (
        <AbsoluteFill style={{ backgroundColor: 'black', fontFamily }}>
            <DynamicStories stories={stories} />

            {/* Subtle Overlay Glow */}
            <AbsoluteFill style={{
                pointerEvents: 'none',
                background: 'radial-gradient(circle, transparent 40%, rgba(0,212,255,0.05) 100%)'
            }} />
        </AbsoluteFill>
    );
};
