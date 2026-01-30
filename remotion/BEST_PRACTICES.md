# Best Practices Guide: Creating High-Quality Videos with Remotion & AI

## Executive Summary
This guide provides a structured methodology for creating professional-grade videos using Remotion. It combines architectural design, animation timing, and AI prompt engineering.

## Part 1: Remotion Fundamentals

### Frame-Based Thinking
Remotion renders each frame independently. Animations must be deterministic based on the current frame number.
- **WRONG**: Move object 20px per frame relative to previous
- **CORRECT**: Position object at (currentFrame * 20) pixels

## Part 2: Animation Architecture

### Core Techniques

1. **Linear Interpolation** (Constant Speed)
   Use for consistent movement (clouds, scrolling).
   ```tsx
   const opacity = interpolate(frame, [0, 30], [0, 1]);
   ```

2. **Spring Animations** (Physics-Based)
   Best for UI elements. Creates natural bounce and deceleration.
   ```tsx
   const scale = spring({ fps, frame, config: { damping: 200 } });
   ```

3. **Easing Functions** (Non-Linear)
   - `linear`: Constant velocity
   - `bezier`: Professional transitions
   - `bounce`: Playful UI
   - `elastic`: Rubber band effects

### Composition Control
- **Sequence**: Places elements at specific frame ranges
- **Series**: Sequential auto-positioning
- **AbsoluteFill**: Layers content (z-index by order)

## Part 3: AI Prompt Engineering

### The Prompt Framework
1. **Intent**: "Create a 5-second intro..."
2. **Specs**: 1920x1080, 30fps
3. **Structure**: Layers, audio, text
4. **Animation**: Frame ranges and types (spring, ease)
5. **Style**: Colors, fonts
6. **Implementation**: "Use staticFile() for assets"

### Example Prompt Template
```text
# Remotion Video Composition Prompt
## Goal
Create a 10-second animated dashboard reveal.

## Technical Specs
- Dimensions: 1920x1080
- FPS: 30
- Duration: 300 frames (10 seconds)

## Animation Details
- Frames 0-30: Fade-in using interpolate
- Frames 30-90: Element slides in with spring (damping: 100)
- Frames 90-150: Counter animates with easing:bezier
```

## Part 4: Optimization

- **Cloud Rendering**: Disable GPU effects (blur, gradients) for Lambda.
- **Assets**: Use `staticFile()` for local assets in `public/`.
- **Text**: Use `fitText()` for responsive sizing.

## Part 5: Common Recipes

### Fade-In Transition
```tsx
const opacity = interpolate(frame, [0, 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
return <div style={{opacity}}>Content</div>;
```

### Slide-In with Spring
```tsx
const springValue = spring({fps, frame, config: {damping: 100}});
const translateX = interpolate(springValue, [0, 1], [-500, 0]);
return <div style={{transform: `translateX(${translateX}px)`}}>Content</div>;
```
