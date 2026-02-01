import React from 'react';
import { AbsoluteFill, spring, interpolate, Easing, useCurrentFrame, useVideoConfig, staticFile, Audio } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

// Load Inter font
const { fontFamily } = loadFont();

// --- Constants ---
const DURATION_IN_FRAMES = 300; // 10 seconds * 30 fps
const FPS = 30;
const VIDEO_WIDTH = 1920;
const VIDEO_HEIGHT = 1080;

// Colors
const BACKGROUND_GRADIENT_TOP = '#0f3460';
const BACKGROUND_GRADIENT_BOTTOM = '#1a1a2e';
const CARD_BACKGROUND = '#16213e';
const NUMBER_COLOR = '#00d4ff';
const LABEL_COLOR = '#eee';

// Spacing
const CARD_SPACING = 150; // px between cards, center-aligned
const CARD_PADDING = 40; // px internal
const CARD_WIDTH = 400; // px
const CARD_HEIGHT = 200; // px

// --- Helper Components ---

interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({ children, style }) => (
  <div
    style={{
      backgroundColor: CARD_BACKGROUND,
      borderRadius: 12,
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      padding: CARD_PADDING,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      ...style,
    }}
  >
    {children}
  </div>
);

interface NumberLabelProps {
  value: number;
  label: string;
  isCurrency?: boolean;
  isPercentage?: boolean;
}

const NumberLabel: React.FC<NumberLabelProps> = ({ value, label, isCurrency, isPercentage }) => {
  const formattedValue = isCurrency
    ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}B`
    : isPercentage
    ? `${Math.round(value)}%`
    : value.toLocaleString();

  return (
    <>
      <div
        style={{
          fontFamily,
          fontSize: 72,
          fontWeight: 'bold',
          color: NUMBER_COLOR,
          marginBottom: 10,
        }}
      >
        {formattedValue}
      </div>
      <div
        style={{
          fontFamily,
          fontSize: 20,
          fontWeight: 'normal',
          color: LABEL_COLOR,
        }}
      >
        {label}
      </div>
    </>
  );
};

// --- Main Composition Component ---

interface Q4EarningsRevealProps {
  revenue?: number;
  customers?: number;
  growth?: number;
}

export const Q4EarningsReveal: React.FC<Q4EarningsRevealProps> = ({
  revenue = 2.5, // Default to $2.5B
  customers = 50000, // Default to 50K
  growth = 127, // Default to 127%
}) => {
  const frame = useCurrentFrame();
  const videoConfig = useVideoConfig();

  // Background fade-in
  const backgroundOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });

  // Card 1: Revenue (frames 30-90)
  const card1SlideInX = spring({
    frame: frame - 30,
    fps: videoConfig.fps,
    config: { damping: 100 },
    from: -VIDEO_WIDTH / 2 - CARD_WIDTH / 2, // Start off-screen left
    to: -(CARD_WIDTH / 2 + CARD_SPACING), // Position relative to center
  });
  const revenueAnimated = interpolate(frame, [30, 90], [0, revenue], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  // Card 2: Customers (frames 75-135)
  const card2SlideInX = spring({
    frame: frame - 75, // offset: -15 frames from card1
    fps: videoConfig.fps,
    config: { damping: 100 },
    from: -VIDEO_WIDTH / 2 - CARD_WIDTH / 2, // Start off-screen left
    to: 0, // Center
  });
  const customersAnimated = interpolate(frame, [75, 135], [0, customers], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  // Card 3: YoY Growth (frames 120-180)
  const card3SlideInX = spring({
    frame: frame - 120, // offset: -45 frames from card1
    fps: videoConfig.fps,
    config: { damping: 100 },
    from: -VIDEO_WIDTH / 2 - CARD_WIDTH / 2, // Start off-screen left
    to: (CARD_WIDTH / 2 + CARD_SPACING), // Position relative to center
  });
  const growthAnimated = interpolate(frame, [120, 180], [0, growth], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  // All cards subtle pulse (frames 200-300)
  const pulseFactor = spring({
      frame: (frame - 200) % 60, // Loop every 60 frames (2 seconds)
      fps: videoConfig.fps,
      config: {damping: 200, stiffness: 200},
      from: 1,
      to: frame > 200 ? 1.05 : 1, // Start pulse after frame 200
      durationInFrames: 30 // Half cycle for pulse in/out
  });
  const finalPulseScale = frame > 200 ? interpolate(pulseFactor, [0, 1], [1, 1.05]) : 1;


  // Audio volume fade
  const audioVolumeIn = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  const audioVolumeOut = interpolate(frame, [270, 300], [1, 0], { extrapolateLeft: 'clamp' });
  const audioVolume = Math.min(audioVolumeIn, audioVolumeOut); // Combine fade in and out

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {/* Background with animated gradient opacity */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(to bottom, ${BACKGROUND_GRADIENT_TOP}, ${BACKGROUND_GRADIENT_BOTTOM})`,
          opacity: backgroundOpacity,
        }}
      />

      {/* Card Container */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Card 1: Revenue */}
        <Card style={{ transform: `translateX(${card1SlideInX}px) scale(${finalPulseScale})` }}>
          <NumberLabel value={revenueAnimated} label="Total Revenue" isCurrency />
        </Card>

        {/* Card 2: Customers */}
        <Card style={{ transform: `translateX(${card2SlideInX}px) scale(${finalPulseScale})`, marginLeft: CARD_SPACING }}>
          <NumberLabel value={customersAnimated} label="Active Customers" />
        </Card>

        {/* Card 3: YoY Growth */}
        <Card style={{ transform: `translateX(${card3SlideInX}px) scale(${finalPulseScale})`, marginLeft: CARD_SPACING }}>
          <NumberLabel value={growthAnimated} label="Year-over-Year" isPercentage />
        </Card>
      </AbsoluteFill>

      {/* Audio Layer */}
      <Audio src={staticFile('cinematic-uplifting.mp3')} volume={audioVolume} />
    </AbsoluteFill>
  );
};