"use client";

// R3F canvas for rendering Draco-compressed .glb models.
// Isolation contract: the root is fixed / -z-10 / pointer-events-none so the
// canvas never intercepts scroll or touch events.
//
// Consume via the dynamic wrapper so it is never in the initial bundle:
//   import { ModelViewerLazy } from "@/components/ModelViewerLazy";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Stage, useGLTF } from "@react-three/drei";

function Model({ src }: { src: string }) {
  const gltf = useGLTF(src, "/draco/");
  return <primitive object={gltf.scene} />;
}

export default function ModelViewer({ src }: { src: string }) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <Canvas dpr={[1, 1.5]} camera={{ fov: 35, position: [0, 0, 6] }}>
        <Suspense fallback={null}>
          <Stage environment={null} intensity={0.5}>
            <Model src={src} />
          </Stage>
        </Suspense>
      </Canvas>
    </div>
  );
}
