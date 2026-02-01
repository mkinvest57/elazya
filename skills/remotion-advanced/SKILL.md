---
name: remotion-advanced
description: "SUPER ADVANCED VIDEO SKILL: 3D Rendering (Three.js), Batch Processing, and Agent Chained Workflows. Use this for complex, high-end production demands."
homepage: "https://remotion.dev/docs/three"
metadata: {"alize":{"emoji":"🎥","requires":{"bins":["node","ffmpeg"],"packages":["@remotion/three","three","@react-three/fiber"]}}}
---

# Super Advanced Remotion Skill

> [!IMPORTANT]
> **USE THIS SKILL WHEN:**
> - User asks for "3D", "Three.js", or "WebGL"
> - User needs **Parametric/Batch** video generation (e.g., "1000 videos")
> - User demands "Advanced Composition" or "High-End Motion Graphics"

## 1. The Nine-Layer Prompt Structure (MANDATORY)
To achieve "Super Advanced" results, you MUST structure your planning in these 9 layers before writing code.

1.  **Core Intent**: One sentence goal.
2.  **Technical Stack**: `@remotion/three`, distributed rendering, etc.
3.  **Data Schema (Zod)**: Define inputs (revenue, growth, textures).
4.  **Visual Hierarchy**: Background layer -> 3D Layer -> Overlay -> HUD.
5.  **Animation Sequence**: Frame-perfect timing (Springs, Interpolation).
6.  **Styling**: Color palette (Hex), Typography (Inter, Roboto).
7.  **Asset Management**: 3D Models (.glb), textures, audio sync.
8.  **Performance**: `useMemo`, `OffthreadVideo` optimization.
9.  **References**: "Spotify Wrapped style", "Apple Launch style".

---

## 2. Advanced 3D Rendering (Three.js)

**Example: 3D Globe with Data Points**

```tsx
import { ThreeCanvas } from '@remotion/three';
import { useCurrentFrame } from 'remotion';
import { Sphere } from '@react-three/drei';

export const GlobeScene: React.FC = () => {
  const frame = useCurrentFrame();
  
  return (
    <ThreeCanvas width={1920} height={1080}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <mesh rotation={[0, frame * 0.01, 0]}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial color="#4488ff" wireframe />
      </mesh>
    </ThreeCanvas>
  );
};
```

**Key Technique: Video as Texture**
```tsx
const texture = useVideoTexture(staticFile("background.mp4"));
<meshBasicMaterial map={texture} />
```

---

## 3. Parametric Batch Generation

**Pattern: Zod Schema + calculateMetadata**

```tsx
import { z } from 'zod';
import { Composition } from 'remotion';

const mySchema = z.object({
  companyName: z.string(),
  revenue: z.number(),
  theme: z.enum(['dark', 'light'])
});

<Composition
  id="DataVideo"
  component={MyComp}
  schema={mySchema}
  defaultProps={{
    companyName: "Acme",
    revenue: 1000,
    theme: "dark"
  }}
/>
```

## 4. Agent Chaining Workflow (Simulated)

When tackling complex requests:
1.  **Phase 1 (Architect)**: Define the Zod Schema and Component Tree.
2.  **Phase 2 (Developer)**: Implement independent components (e.g., `StatCard.tsx`, `Globe.tsx`).
3.  **Phase 3 (Integrator)**: Assemble in `Composition.tsx`.
4.  **Phase 4 (Optimizer)**: Apply `freeze()` and `useMemo()` for performance.
