import {
    AbsoluteFill,
    Img,
    interpolate,
    Sequence,
    useCurrentFrame,
    useVideoConfig,
    spring,
    Easing,
    Series,
} from 'remotion';

// --- SHARED COMPONENTS ---

const Title: React.FC<{
    title: string;
    color: string;
    delay?: number;
}> = ({ title, color, delay = 0 }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const translateY = spring({
        frame: frame - delay,
        fps,
        config: { damping: 12 },
        from: -100,
        to: 0,
    });

    const opacity = interpolate(
        frame - delay,
        [0, 30],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return (
        <h1
            style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: 800,
                fontSize: 100,
                textAlign: 'center',
                position: 'absolute',
                top: 150,
                width: '100%',
                color,
                transform: `translateY(${translateY}px)`,
                opacity,
                margin: 0,
            }}
        >
            {title}
        </h1>
    );
};

const Subtitle: React.FC<{
    text: string;
    color: string;
    delay?: number;
}> = ({ text, color, delay = 0 }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const scale = spring({
        frame: frame - delay,
        fps,
        config: { damping: 200, mass: 0.5 },
    });

    const opacity = interpolate(
        frame - delay,
        [0, 20],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return (
        <div
            style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 40,
                textAlign: 'center',
                position: 'absolute',
                top: 320,
                width: '100%',
                color: 'rgba(255, 255, 255, 0.8)',
                transform: `scale(${scale})`,
                opacity,
            }}
        >
            {text}
        </div>
    );
};

// --- COMPOSITIONS ---

// 1. Professional Intro with Spring Animations
export const Intro: React.FC<{
    title: string;
    subtitle?: string;
    backgroundColor?: string;
}> = ({ title, subtitle, backgroundColor = '#1a1a2e' }) => {
    return (
        <AbsoluteFill
            style={{
                backgroundColor,
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Title title={title} color="#ffffff" delay={0} />
            {subtitle && <Subtitle text={subtitle} color="#cccccc" delay={15} />}
        </AbsoluteFill>
    );
};

// 2. Text Overlay with Slide-in Effect
export const TextOverlay: React.FC<{
    text: string;
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
}> = ({
    text,
    backgroundColor = '#1a1a2e',
    textColor = '#ffffff',
    fontSize = 80,
}) => {
        const frame = useCurrentFrame();
        const { fps } = useVideoConfig();

        const progress = spring({
            frame,
            fps,
            config: { damping: 200 },
        });

        const translateY = interpolate(progress, [0, 1], [100, 0]);
        const opacity = interpolate(progress, [0, 1], [0, 1]);

        return (
            <AbsoluteFill
                style={{
                    backgroundColor,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <div
                    style={{
                        color: textColor,
                        fontSize,
                        fontWeight: 'bold',
                        fontFamily: 'Inter, sans-serif',
                        textAlign: 'center',
                        transform: `translateY(${translateY}px)`,
                        opacity,
                        padding: '0 60px',
                    }}
                >
                    {text}
                </div>
            </AbsoluteFill>
        );
    };

// 3. Slideshow with Crossfade and Zoom
export const Slideshow: React.FC<{
    images: string[];
    transitionDuration?: number;
}> = ({ images, transitionDuration = 30 }) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    const framesPerImage = Math.floor(durationInFrames / images.length);

    return (
        <AbsoluteFill style={{ backgroundColor: '#000' }}>
            {images.map((image, index) => {
                const startFrame = index * framesPerImage;
                const endFrame = (index + 1) * framesPerImage;

                // Is this image currently active?
                const active = frame >= startFrame && frame < endFrame;
                // Or in transition?
                const exiting = frame >= endFrame && frame < endFrame + transitionDuration;

                if (!active && !exiting) return null;

                const timeInSlide = frame - startFrame;

                // Slow zoom effect (Ken Burns)
                const scale = interpolate(timeInSlide, [0, framesPerImage], [1, 1.1]);

                // Fade in/out
                const opacity = interpolate(
                    frame,
                    [startFrame, startFrame + 15, endFrame - 15, endFrame],
                    [0, 1, 1, 0],
                    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                );

                return (
                    <AbsoluteFill key={index} style={{ opacity }}>
                        <Img
                            src={image}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transform: `scale(${scale})`,
                            }}
                        />
                    </AbsoluteFill>
                );
            })}
        </AbsoluteFill>
    );
};

// 4. Image with Animated Caption
export const ImageWithText: React.FC<{
    imageSrc: string;
    text: string;
    textPosition?: 'top' | 'center' | 'bottom';
}> = ({ imageSrc, text, textPosition = 'bottom' }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Background image subtle zoom
    const scale = interpolate(frame, [0, 300], [1, 1.05], {
        extrapolateRight: 'clamp',
    });

    // Caption pop-up
    const captionY = spring({
        frame: frame - 20,
        fps,
        config: { damping: 15 },
        from: 100,
        to: 0,
    });

    const captionOpacity = interpolate(
        frame - 20,
        [0, 10],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    const positionStyle: React.CSSProperties = {
        top: textPosition === 'top' ? '10%' : (textPosition === 'center' ? '50%' : undefined),
        bottom: textPosition === 'bottom' ? '10%' : undefined,
        transform: textPosition === 'center' ? 'translateY(-50%)' : undefined,
    };

    return (
        <AbsoluteFill style={{ overflow: 'hidden' }}>
            <AbsoluteFill style={{ transform: `scale(${scale})` }}>
                <Img
                    src={imageSrc}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />
            </AbsoluteFill>

            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    ...positionStyle,
                    textAlign: 'center',
                    opacity: captionOpacity,
                    transform: textPosition !== 'center' ? `translateY(${captionY}px)` : undefined,
                }}
            >
                <div style={{ display: 'inline-block', overflow: 'hidden', borderRadius: '12px' }}>
                    <span
                        style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.75)',
                            backdropFilter: 'blur(10px)',
                            color: '#ffffff',
                            fontSize: 48,
                            fontWeight: 600,
                            fontFamily: 'Inter, system-ui, sans-serif',
                            padding: '20px 40px',
                            display: 'block',
                        }}
                    >
                        {text}
                    </span>
                </div>
            </div>
        </AbsoluteFill>
    );
};
// 5. Dynamic Stories (Series of Scenes)
export type StoryItem = {
    type: 'text' | 'image' | 'intro';
    durationInFrames: number;
    title?: string; // For intro/text
    subtitle?: string; // For intro
    text?: string; // For text/image
    imageSrc?: string; // For image
    backgroundColor?: string;
    textColor?: string;
};

export const DynamicStories: React.FC<{
    stories: StoryItem[];
}> = ({ stories }) => {
    return (
        <AbsoluteFill style={{ backgroundColor: '#000' }}>
            <Series>
                {stories.map((story, index) => {
                    return (
                        <Series.Sequence key={index} durationInFrames={story.durationInFrames}>
                            {story.type === 'intro' && (
                                <Intro
                                    title={story.title || ''}
                                    subtitle={story.subtitle}
                                    backgroundColor={story.backgroundColor}
                                />
                            )}
                            {story.type === 'text' && (
                                <TextOverlay
                                    text={story.text || story.title || ''}
                                    backgroundColor={story.backgroundColor}
                                    textColor={story.textColor}
                                />
                            )}
                            {story.type === 'image' && (
                                <ImageWithText
                                    imageSrc={story.imageSrc || ''}
                                    text={story.text || ''}
                                />
                            )}
                        </Series.Sequence>
                    );
                })}
            </Series>
        </AbsoluteFill>
    );
};

// 6. Advanced Stats Dashboard (Q4EarningsReveal)
const StatCard: React.FC<{
    label: string;
    value: string;
    delay: number;
    color: string;
}> = ({ label, value, delay, color }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const scale = spring({
        frame: frame - delay,
        fps,
        config: { damping: 12 },
    });

    const opacity = interpolate(frame - delay, [0, 20], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    return (
        <div
            style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: 20,
                padding: 40,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                transform: `scale(${scale})`,
                opacity,
                width: 400,
                height: 250,
                margin: 20,
                border: `2px solid ${color}`,
                boxShadow: `0 10px 30px rgba(0,0,0,0.3)`,
            }}
        >
            <div
                style={{
                    color: color,
                    fontSize: 80,
                    fontWeight: 900,
                    fontFamily: 'Inter, sans-serif',
                    marginBottom: 10,
                }}
            >
                {value}
            </div>
            <div
                style={{
                    color: '#ffffff',
                    fontSize: 30,
                    fontFamily: 'Inter, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                    opacity: 0.8,
                }}
            >
                {label}
            </div>
        </div>
    );
};

export const Q4EarningsReveal: React.FC<{
    companyName: string;
    quarter: string;
    revenue: string;
    netIncome: string;
    growth: string;
    primaryColor?: string;
    secondaryColor?: string;
}> = ({
    companyName,
    quarter,
    revenue,
    netIncome,
    growth,
    primaryColor = '#00E5FF',
    secondaryColor = '#2979FF',
}) => {
        const frame = useCurrentFrame();
        const { durationInFrames } = useVideoConfig();

        // Animated gradient background
        const bgPos = interpolate(frame, [0, durationInFrames], [0, 100]);

        return (
            <AbsoluteFill
                style={{
                    background: `linear-gradient(135deg, #121212 0%, #1a1a2e 50%, #000000 100%)`,
                    backgroundSize: '200% 200%',
                    backgroundPosition: `${bgPos}% 50%`,
                    color: 'white',
                    fontFamily: 'Inter, sans-serif',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <AbsoluteFill
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                        zIndex: 1,
                    }}
                >
                    {/* Header */}
                    <div style={{ marginBottom: 60, textAlign: 'center' }}>
                        <h1
                            style={{
                                fontSize: 60,
                                margin: 0,
                                fontWeight: 300,
                                letterSpacing: 4,
                                opacity: interpolate(frame, [0, 30], [0, 1]),
                            }}
                        >
                            {companyName.toUpperCase()}
                        </h1>
                        <h2
                            style={{
                                fontSize: 100,
                                margin: 0,
                                background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                opacity: interpolate(frame, [10, 40], [0, 1]),
                                transform: `translateY(${interpolate(frame, [10, 40], [20, 0], { extrapolateRight: 'clamp' })}px)`,
                            }}
                        >
                            {quarter} RESULTS
                        </h2>
                    </div>

                    {/* Grid of Stats */}
                    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <StatCard label="Revenue" value={revenue} delay={30} color={primaryColor} />
                        <StatCard label="Net Income" value={netIncome} delay={45} color="#00E676" />
                        <StatCard label="YoY Growth" value={growth} delay={60} color={secondaryColor} />
                    </div>
                </AbsoluteFill>
            </AbsoluteFill>
        );
    };
