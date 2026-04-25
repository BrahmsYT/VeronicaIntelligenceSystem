'use client';

import { Canvas } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import { TransportModel } from './transport-models';

export function TransitHeroScene() {
  return (
    <div className='relative h-[420px] w-full overflow-hidden rounded-[24px]' style={{ background: 'radial-gradient(80% 60% at 50% 0%, color-mix(in srgb, var(--brand-to) 18%, transparent), transparent 60%), radial-gradient(60% 40% at 80% 100%, color-mix(in srgb, var(--brand-from) 16%, transparent), transparent 60%), linear-gradient(180deg, color-mix(in srgb, var(--bg-alt) 92%, black), var(--bg))' }}>
      <Canvas camera={{ position: [0, 1.8, 6.2], fov: 42 }}>
        <ambientLight intensity={1.4} />
        <directionalLight position={[4, 5, 4]} intensity={2.6} />
        <directionalLight position={[-4, 3, -2]} intensity={0.7} color='#93c5fd' />
        <Float speed={1.5} rotationIntensity={0.22} floatIntensity={0.4}>
          <group>
            <group position={[-2.1, 0.05, 0]} scale={0.72} rotation={[-0.08, -0.35, 0.02]}><TransportModel type='bus' /></group>
            <group position={[0.9, 0.12, -0.1]} scale={0.78} rotation={[-0.05, -0.45, 0.02]}><TransportModel type='metro' /></group>
            <group position={[0.2, -0.7, 1.1]} scale={0.62} rotation={[-0.06, -0.7, 0.02]}><TransportModel type='taxi' /></group>
          </group>
        </Float>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]}>
          <circleGeometry args={[5.2, 64]} />
          <meshStandardMaterial color='#071225' />
        </mesh>
        <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.6} />
      </Canvas>
    </div>
  );
}
