'use client';

import { Canvas } from '@react-three/fiber';
import { Float, OrbitControls, RoundedBox } from '@react-three/drei';
import { TransportType } from '@/lib/types';

function Wheel({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.18, 0.18, 0.18, 24]} />
      <meshStandardMaterial color='#0f172a' />
    </mesh>
  );
}

function WindowStrip({ position, scale }: { position: [number, number, number]; scale: [number, number, number] }) {
  return (
    <RoundedBox args={scale} radius={0.03} position={position}>
      <meshStandardMaterial color='#bae6fd' metalness={0.35} roughness={0.15} />
    </RoundedBox>
  );
}

function BusModel() {
  return (
    <group>
      <RoundedBox args={[2.4, 0.72, 0.88]} radius={0.12} position={[0, 0, 0]}>
        <meshStandardMaterial color='#0ea5e9' />
      </RoundedBox>
      <RoundedBox args={[1.25, 0.34, 0.74]} radius={0.08} position={[0.12, 0.42, 0]}>
        <meshStandardMaterial color='#38bdf8' />
      </RoundedBox>
      <WindowStrip position={[-0.18, 0.14, 0.45]} scale={[1.5, 0.2, 0.04]} />
      <Wheel position={[-0.72, -0.42, 0.42]} />
      <Wheel position={[0.65, -0.42, 0.42]} />
      <Wheel position={[-0.72, -0.42, -0.42]} />
      <Wheel position={[0.65, -0.42, -0.42]} />
    </group>
  );
}

function MetroModel() {
  return (
    <group>
      <RoundedBox args={[2.65, 0.7, 0.92]} radius={0.11} position={[0, 0, 0]}>
        <meshStandardMaterial color='#7c3aed' />
      </RoundedBox>
      <WindowStrip position={[0, 0.12, 0.47]} scale={[1.95, 0.22, 0.04]} />
      <RoundedBox args={[0.38, 0.42, 0.7]} radius={0.08} position={[1.02, 0.02, 0]}>
        <meshStandardMaterial color='#8b5cf6' />
      </RoundedBox>
      <Wheel position={[-0.9, -0.42, 0.44]} />
      <Wheel position={[0.9, -0.42, 0.44]} />
      <Wheel position={[-0.9, -0.42, -0.44]} />
      <Wheel position={[0.9, -0.42, -0.44]} />
    </group>
  );
}

function TaxiModel() {
  return (
    <group>
      <RoundedBox args={[1.8, 0.48, 0.92]} radius={0.12} position={[0, -0.02, 0]}>
        <meshStandardMaterial color='#f59e0b' />
      </RoundedBox>
      <RoundedBox args={[0.88, 0.32, 0.72]} radius={0.08} position={[0.08, 0.28, 0]}>
        <meshStandardMaterial color='#fb923c' />
      </RoundedBox>
      <WindowStrip position={[0.1, 0.22, 0.46]} scale={[0.8, 0.18, 0.04]} />
      <RoundedBox args={[0.38, 0.08, 0.4]} radius={0.04} position={[0.02, 0.52, 0]}>
        <meshStandardMaterial color='#fef08a' />
      </RoundedBox>
      <Wheel position={[-0.55, -0.32, 0.43]} />
      <Wheel position={[0.55, -0.32, 0.43]} />
      <Wheel position={[-0.55, -0.32, -0.43]} />
      <Wheel position={[0.55, -0.32, -0.43]} />
    </group>
  );
}

function RailModel() {
  return (
    <group>
      <RoundedBox args={[2.95, 0.58, 0.9]} radius={0.08} position={[0, -0.04, 0]}>
        <meshStandardMaterial color='#14b8a6' />
      </RoundedBox>
      <RoundedBox args={[0.52, 0.5, 0.82]} radius={0.08} position={[1.1, 0.05, 0]}>
        <meshStandardMaterial color='#0f766e' />
      </RoundedBox>
      <WindowStrip position={[-0.2, 0.08, 0.46]} scale={[1.9, 0.18, 0.04]} />
      <mesh position={[0, -0.48, 0]}> 
        <boxGeometry args={[3.3, 0.08, 0.18]} />
        <meshStandardMaterial color='#475569' />
      </mesh>
      <Wheel position={[-0.95, -0.34, 0.44]} />
      <Wheel position={[0.1, -0.34, 0.44]} />
      <Wheel position={[1.05, -0.34, 0.44]} />
      <Wheel position={[-0.95, -0.34, -0.44]} />
      <Wheel position={[0.1, -0.34, -0.44]} />
      <Wheel position={[1.05, -0.34, -0.44]} />
    </group>
  );
}

function Model({ type }: { type: TransportType }) {
  if (type === 'bus') return <BusModel />;
  if (type === 'metro') return <MetroModel />;
  if (type === 'taxi') return <TaxiModel />;
  return <RailModel />;
}

export function TransportSelectorScene({ type }: { type: TransportType }) {
  return (
    <div className='h-64 overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.18),transparent_48%),linear-gradient(180deg,#0f172a_0%,#020617_100%)]'>
      <Canvas camera={{ position: [0, 1.2, 4.4], fov: 42 }}>
        <ambientLight intensity={1.3} />
        <directionalLight position={[5, 4, 4]} intensity={2} />
        <directionalLight position={[-3, 3, -2]} intensity={0.6} color='#93c5fd' />
        <Float speed={1.8} rotationIntensity={0.35} floatIntensity={0.5}>
          <group rotation={[-0.08, -0.45, 0.02]}>
            <Model type={type} />
          </group>
        </Float>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.74, 0]}>
          <circleGeometry args={[5, 64]} />
          <meshStandardMaterial color='#020617' />
        </mesh>
        <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={1.2} />
      </Canvas>
    </div>
  );
}
