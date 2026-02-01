import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { Sphere } from '@react-three/drei';

export const WireframeSphere: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Continuous rotation around the Y-axis
  const rotationSpeed = 0.02; // Adjust for desired speed
  const rotationY = (frame / fps) * rotationSpeed * Math.PI * 2; // Full rotation every (1/rotationSpeed) seconds

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      <ThreeCanvas width={width} height={height} camera={{ position: [0, 0, 5], fov: 60 }} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        {/* Basic lighting for visibility */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        {/* Wireframe Sphere */}
        <mesh rotation={[0, rotationY, 0]}>
          <sphereGeometry args={[2, 64, 64]} /> {/* args: radius, widthSegments, heightSegments */}
          <meshStandardMaterial color="white" wireframe />
        </mesh>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
