'use client';

import { Canvas } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import { TransportType } from '@/lib/types';
import { TransportModel } from './transport-models';

export function TransportSelectorScene({ type }: { type: TransportType }) {
  return (
    <div className='h-72 overflow-hidden rounded-[28px]' style={{ border: '1px solid var(--border)', background: 'radial-gradient(circle at top, color-mix(in srgb, var(--brand-to) 18%, transparent), transparent 48%), linear-gradient(180deg, color-mix(in srgb, var(--bg-alt) 90%, black), var(--bg))' }}>
      <Canvas camera={{ position: [0, 1.2, 4.4], fov: 42 }}>
        <ambientLight intensity={1.35} />
        <directionalLight position={[5, 4, 4]} intensity={2} />
        <directionalLight position={[-3, 3, -2]} intensity={0.8} color='#93c5fd' />
        <Float speed={1.4} rotationIntensity={0.28} floatIntensity={0.45}>
          <group rotation={[-0.08, -0.45, 0.02]}>
            <TransportModel type={type} />
          </group>
        </Float>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.74, 0]}>
          <circleGeometry args={[5, 64]} />
          <meshStandardMaterial color='#020617' />
        </mesh>
        <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.9} />
      </Canvas>
    </div>
  );
}
