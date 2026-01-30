import React from 'react';
import { Composition } from 'remotion';
import { TextOverlay, Slideshow, Intro, ImageWithText, DynamicStories, Q4EarningsReveal } from './Compositions';
import { WireframeSphere } from './WireframeSphere';
import { UltimateShowcase } from './UltimateShowcase';
import { AlizeExplainer } from './AlizeExplainer';
import { AlizeExplainerPortrait } from './AlizeExplainerPortrait';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            {/* Text Overlay - Simple text on colored background */}
            <Composition
                id="TextOverlay"
                component={TextOverlay}
                durationInFrames={90}
                fps={30}
                width={1920}
                height={1080}
                defaultProps={{
                    text: 'Hello World',
                    backgroundColor: '#1a1a2e',
                    textColor: '#ffffff',
                    fontSize: 80,
                }}
            />

            {/* Slideshow - Multiple images with transitions */}
            <Composition
                id="Slideshow"
                component={Slideshow}
                durationInFrames={300}
                fps={30}
                width={1920}
                height={1080}
                defaultProps={{
                    images: [],
                    transitionDuration: 15,
                }}
            />

            {/* Intro - Animated title and subtitle */}
            <Composition
                id="Intro"
                component={Intro}
                durationInFrames={120}
                fps={30}
                width={1920}
                height={1080}
                defaultProps={{
                    title: 'Welcome',
                    subtitle: 'Your subtitle here',
                    backgroundColor: '#1a1a2e',
                }}
            />

            {/* Image with Text - Single image with text overlay */}
            <Composition
                id="ImageWithText"
                component={ImageWithText}
                durationInFrames={90}
                fps={30}
                width={1920}
                height={1080}
                defaultProps={{
                    imageSrc: '',
                    text: 'Caption',
                    textPosition: 'bottom',
                }}
            />

            {/* Dynamic Stories - Sequence of text/images/intros */}
            <Composition
                id="DynamicStories"
                component={DynamicStories}
                durationInFrames={300} // Default, will be overridden by props
                fps={30}
                width={1920}
                height={1080}
                defaultProps={{
                    stories: [],
                }}
            />

            {/* Q4 Earnings Dashboard - Advanced Stats Reveal */}
            <Composition
                id="Q4EarningsReveal"
                component={Q4EarningsReveal}
                durationInFrames={300}
                fps={30}
                width={1920}
                height={1080}
                defaultProps={{
                    companyName: 'Acme Corp',
                    quarter: 'Q4 2025',
                    revenue: '$10.5M',
                    netIncome: '$2.3M',
                    growth: '+15%',
                    primaryColor: '#00E5FF',
                    secondaryColor: '#2979FF',
                }}
            />

            {/* Wireframe Sphere - 3D rotating wireframe sphere on black background */}
            <Composition
                id="WireframeSphere"
                component={WireframeSphere}
                durationInFrames={300} // 10 seconds * 30 fps
                fps={30}
                width={1920}
                height={1080}
                defaultProps={{}}
            />

            {/* Ultimate Showcase - Combines all features into one demo */}
            <Composition
                id="UltimateShowcase"
                component={UltimateShowcase}
                durationInFrames={900} // 30 seconds * 30 fps
                fps={30}
                width={1920}
                height={1080}
                defaultProps={{}}
            />

            {/* Alizé Explainer - Persona-targeted video */}
            {/* Alizé Explainer Portrait - For phone mockups */}
            <Composition
                id="AlizeExplainerPortrait"
                component={AlizeExplainerPortrait}
                durationInFrames={450} // 15 seconds * 30 fps
                fps={30}
                width={1080}
                height={1920}
                defaultProps={{}}
            />
        </>
    );
};
