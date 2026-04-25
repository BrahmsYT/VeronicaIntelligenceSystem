'use client';

import { Canvas } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';

function HeroObjects() {
  return (
    <group>
      <group position={[-1.7, 0.1, 0]} scale={0.78}>
        {/* bus */}
        <mesh>
          <boxGeometry args={[2.4, 0.72, 0.88]} />
          <meshStandardMaterial color='#0ea5e9' />
        </mesh>
      </group>
      <group position={[0.75, 0.16, -0.1]} scale={0.86}>
        {/* metro */}
        <mesh>
          <boxGeometry args={[2.65, 0.7, 0.92]} />
          <meshStandardMaterial color='#7c3aed' />
        </mesh>
      </group>
      <group position={[0.2, -0.55, 1.2]} scale={0.62}>
        {/* taxi */}
        <mesh>
          <boxGeometry args={[1.8, 0.48, 0.92]} />
          <meshStandardMaterial color='#f59e0b' />
        </mesh>
      </group>
    </group>
  );
}

export function TransitHeroScene() {
  return (
    <div className='h-[340px] w-full overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.18),transparent_42%),linear-gradient(180deg,#111827_0%,#020617_100%)]'>
      <Canvas camera={{ position: [0, 1.8, 5.5], fov: 42 }}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[4, 5, 4]} intensity={2.4} />
        <directionalLight position={[-4, 3, -2]} intensity={0.7} color='#93c5fd' />
        <Float speed={1.8} rotationIntensity={0.25} floatIntensity={0.5}>
          <HeroObjects />
        </Float>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.05, 0]}>
          <circleGeometry args={[5, 64]} />
          <meshStandardMaterial color='#071225' />
        </mesh>
        <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.9} />
      </Canvas>
    </div>
  );
}
