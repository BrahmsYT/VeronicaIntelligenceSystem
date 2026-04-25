import { RoundedBox } from '@react-three/drei';
import { TransportType } from '@/lib/types';

function Wheel({ position, radius = 0.18, width = 0.18 }: { position: [number, number, number]; radius?: number; width?: number }) {
  return (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      <mesh>
        <cylinderGeometry args={[radius, radius, width, 28]} />
        <meshStandardMaterial color='#0f172a' roughness={0.86} metalness={0.08} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[radius * 0.56, radius * 0.56, width * 1.04, 24]} />
        <meshStandardMaterial color='#94a3b8' roughness={0.35} metalness={0.6} />
      </mesh>
    </group>
  );
}

function WindowStrip({ position, scale }: { position: [number, number, number]; scale: [number, number, number] }) {
  return (
    <RoundedBox args={scale} radius={0.03} position={position}>
      <meshStandardMaterial color='#bfdbfe' metalness={0.45} roughness={0.08} />
    </RoundedBox>
  );
}

function HeadLight({ position }: { position: [number, number, number] }) {
  return (
    <RoundedBox args={[0.14, 0.08, 0.02]} radius={0.015} position={position}>
      <meshStandardMaterial color='#fef9c3' emissive='#fef08a' emissiveIntensity={0.6} />
    </RoundedBox>
  );
}

function TailLight({ position }: { position: [number, number, number] }) {
  return (
    <RoundedBox args={[0.14, 0.08, 0.02]} radius={0.015} position={position}>
      <meshStandardMaterial color='#fca5a5' emissive='#ef4444' emissiveIntensity={0.3} />
    </RoundedBox>
  );
}

function BusRouteDisplay({ position, text = '3 28 MAY' }: { position: [number, number, number]; text?: string }) {
  return (
    <group position={position}>
      <RoundedBox args={[0.54, 0.16, 0.03]} radius={0.015}>
        <meshStandardMaterial color='#111827' metalness={0.35} roughness={0.28} />
      </RoundedBox>
      <mesh position={[0, 0, 0.018]}>
        <planeGeometry args={[0.46, 0.1]} />
        <meshStandardMaterial color='#facc15' emissive='#f59e0b' emissiveIntensity={0.55} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[0.4, 0.03]} />
        <meshStandardMaterial color='#111827' />
      </mesh>
      <mesh position={[0, -0.04, 0.02]}>
        <planeGeometry args={[0.4, 0.012]} />
        <meshStandardMaterial color='#111827' />
      </mesh>
      <mesh position={[0, -0.075, 0.02]}>
        <planeGeometry args={[Math.min(0.4, 0.05 + text.length * 0.012), 0.01]} />
        <meshStandardMaterial color='#111827' />
      </mesh>
    </group>
  );
}

function TaxiCheckerStripe({ z = 0.53 }: { z?: number }) {
  return (
    <group position={[0.03, 0.02, z]}>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[-0.62 + i * 0.18, 0, 0]}>
          <boxGeometry args={[0.1, 0.08, 0.02]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#111827' : '#f8fafc'} metalness={0.15} roughness={0.34} />
        </mesh>
      ))}
    </group>
  );
}

function RailDoorPanel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox args={[0.28, 0.46, 0.03]} radius={0.03} position={[-0.15, 0, 0]}>
        <meshStandardMaterial color='#99f6e4' metalness={0.3} roughness={0.2} />
      </RoundedBox>
      <RoundedBox args={[0.28, 0.46, 0.03]} radius={0.03} position={[0.15, 0, 0]}>
        <meshStandardMaterial color='#99f6e4' metalness={0.3} roughness={0.2} />
      </RoundedBox>
      <mesh>
        <boxGeometry args={[0.02, 0.48, 0.04]} />
        <meshStandardMaterial color='#0f172a' metalness={0.4} roughness={0.4} />
      </mesh>
    </group>
  );
}

function RailConnector() {
  return (
    <group position={[-1.54, -0.03, 0]}>
      <RoundedBox args={[0.1, 0.5, 0.82]} radius={0.03}>
        <meshStandardMaterial color='#1f2937' metalness={0.3} roughness={0.62} />
      </RoundedBox>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[0.05 + i * 0.024, 0, 0]}>
          <boxGeometry args={[0.018, 0.46, 0.72]} />
          <meshStandardMaterial color='#334155' metalness={0.28} roughness={0.54} />
        </mesh>
      ))}
    </group>
  );
}

export function BusModel() {
  return (
    <group>
      <RoundedBox args={[2.64, 0.78, 0.98]} radius={0.13}>
        <meshStandardMaterial color='#0284c7' metalness={0.35} roughness={0.28} />
      </RoundedBox>

      <RoundedBox args={[2.58, 0.1, 0.94]} radius={0.04} position={[0, 0.16, 0]}>
        <meshStandardMaterial color='#f59e0b' metalness={0.22} roughness={0.35} />
      </RoundedBox>

      <RoundedBox args={[1.18, 0.36, 0.86]} radius={0.08} position={[0.5, 0.44, 0]}>
        <meshStandardMaterial color='#0ea5e9' metalness={0.3} roughness={0.24} />
      </RoundedBox>

      <RoundedBox args={[0.52, 0.54, 0.03]} radius={0.03} position={[-0.52, 0.02, 0.5]}>
        <meshStandardMaterial color='#38bdf8' metalness={0.3} roughness={0.2} />
      </RoundedBox>

      <RoundedBox args={[0.48, 0.54, 0.03]} radius={0.03} position={[0.02, 0.02, 0.5]}>
        <meshStandardMaterial color='#38bdf8' metalness={0.3} roughness={0.2} />
      </RoundedBox>

      <WindowStrip position={[-0.38, 0.19, 0.5]} scale={[1.28, 0.22, 0.03]} />
      <WindowStrip position={[0.58, 0.31, 0.5]} scale={[0.66, 0.2, 0.03]} />
      <WindowStrip position={[-0.38, 0.19, -0.5]} scale={[1.28, 0.22, 0.03]} />
      <WindowStrip position={[0.58, 0.31, -0.5]} scale={[0.66, 0.2, 0.03]} />

      <RoundedBox args={[0.46, 0.24, 0.03]} radius={0.03} position={[1.2, 0.25, 0]}>
        <meshStandardMaterial color='#dbeafe' metalness={0.52} roughness={0.08} />
      </RoundedBox>

      <BusRouteDisplay position={[1.08, 0.48, 0]} text='3 28 MAY' />

      <HeadLight position={[1.33, -0.1, 0.29]} />
      <HeadLight position={[1.33, -0.1, -0.29]} />
      <TailLight position={[-1.33, -0.1, 0.29]} />
      <TailLight position={[-1.33, -0.1, -0.29]} />

      <Wheel position={[-0.82, -0.45, 0.5]} radius={0.2} width={0.2} />
      <Wheel position={[0.82, -0.45, 0.5]} radius={0.2} width={0.2} />
      <Wheel position={[-0.82, -0.45, -0.5]} radius={0.2} width={0.2} />
      <Wheel position={[0.82, -0.45, -0.5]} radius={0.2} width={0.2} />
    </group>
  );
}

export function MetroModel() {
  return (
    <group>
      <RoundedBox args={[2.86, 0.74, 1.02]} radius={0.12}>
        <meshStandardMaterial color='#6d28d9' metalness={0.36} roughness={0.23} />
      </RoundedBox>

      <RoundedBox args={[0.46, 0.56, 0.88]} radius={0.08} position={[1.2, 0.02, 0]}>
        <meshStandardMaterial color='#7c3aed' metalness={0.34} roughness={0.22} />
      </RoundedBox>

      <RoundedBox args={[2.7, 0.08, 0.98]} radius={0.03} position={[0, 0.18, 0]}>
        <meshStandardMaterial color='#a78bfa' metalness={0.2} roughness={0.35} />
      </RoundedBox>

      <WindowStrip position={[-0.22, 0.14, 0.52]} scale={[1.94, 0.2, 0.03]} />
      <WindowStrip position={[-0.22, 0.14, -0.52]} scale={[1.94, 0.2, 0.03]} />
      <WindowStrip position={[1.08, 0.18, 0]} scale={[0.24, 0.24, 0.84]} />

      <RoundedBox args={[2.18, 0.04, 0.06]} radius={0.01} position={[0, -0.24, 0.5]}>
        <meshStandardMaterial color='#1e293b' metalness={0.42} roughness={0.45} />
      </RoundedBox>
      <RoundedBox args={[2.18, 0.04, 0.06]} radius={0.01} position={[0, -0.24, -0.5]}>
        <meshStandardMaterial color='#1e293b' metalness={0.42} roughness={0.45} />
      </RoundedBox>

      <HeadLight position={[1.43, -0.04, 0.27]} />
      <HeadLight position={[1.43, -0.04, -0.27]} />

      <Wheel position={[-0.92, -0.43, 0.48]} radius={0.18} width={0.18} />
      <Wheel position={[0.18, -0.43, 0.48]} radius={0.18} width={0.18} />
      <Wheel position={[-0.92, -0.43, -0.48]} radius={0.18} width={0.18} />
      <Wheel position={[0.18, -0.43, -0.48]} radius={0.18} width={0.18} />
    </group>
  );
}

export function TaxiModel() {
  return (
    <group>
      <RoundedBox args={[2.02, 0.52, 1.02]} radius={0.14} position={[0, -0.02, 0]}>
        <meshStandardMaterial color='#facc15' metalness={0.28} roughness={0.26} />
      </RoundedBox>

      <RoundedBox args={[0.98, 0.34, 0.8]} radius={0.09} position={[0.12, 0.28, 0]}>
        <meshStandardMaterial color='#fbbf24' metalness={0.25} roughness={0.24} />
      </RoundedBox>

      <WindowStrip position={[0.12, 0.22, 0.52]} scale={[0.88, 0.18, 0.03]} />
      <WindowStrip position={[0.12, 0.22, -0.52]} scale={[0.88, 0.18, 0.03]} />

  <TaxiCheckerStripe z={0.53} />
  <TaxiCheckerStripe z={-0.53} />

      <RoundedBox args={[0.42, 0.08, 0.38]} radius={0.03} position={[0.03, 0.52, 0]}>
        <meshStandardMaterial color='#f8fafc' metalness={0.18} roughness={0.3} />
      </RoundedBox>
      <RoundedBox args={[0.24, 0.04, 0.2]} radius={0.02} position={[0.03, 0.58, 0]}>
        <meshStandardMaterial color='#0f172a' />
      </RoundedBox>

      <RoundedBox args={[0.24, 0.08, 0.03]} radius={0.02} position={[1.02, -0.04, 0]}>
        <meshStandardMaterial color='#1f2937' metalness={0.4} roughness={0.35} />
      </RoundedBox>
      <HeadLight position={[1.03, -0.04, 0.31]} />
      <HeadLight position={[1.03, -0.04, -0.31]} />
      <TailLight position={[-1.01, -0.06, 0.31]} />
      <TailLight position={[-1.01, -0.06, -0.31]} />

      <Wheel position={[-0.62, -0.34, 0.52]} radius={0.19} width={0.2} />
      <Wheel position={[0.62, -0.34, 0.52]} radius={0.19} width={0.2} />
      <Wheel position={[-0.62, -0.34, -0.52]} radius={0.19} width={0.2} />
      <Wheel position={[0.62, -0.34, -0.52]} radius={0.19} width={0.2} />
    </group>
  );
}

export function RailModel() {
  return (
    <group>
      <RoundedBox args={[3.1, 0.62, 0.98]} radius={0.1} position={[0, -0.02, 0]}>
        <meshStandardMaterial color='#0f766e' metalness={0.34} roughness={0.25} />
      </RoundedBox>

      <RoundedBox args={[0.56, 0.54, 0.9]} radius={0.08} position={[1.28, 0.04, 0]}>
        <meshStandardMaterial color='#0d9488' metalness={0.36} roughness={0.24} />
      </RoundedBox>

      <RoundedBox args={[2.46, 0.1, 0.96]} radius={0.03} position={[-0.1, 0.16, 0]}>
        <meshStandardMaterial color='#2dd4bf' metalness={0.25} roughness={0.32} />
      </RoundedBox>

      <WindowStrip position={[-0.36, 0.12, 0.5]} scale={[1.98, 0.2, 0.03]} />
      <WindowStrip position={[-0.36, 0.12, -0.5]} scale={[1.98, 0.2, 0.03]} />
      <WindowStrip position={[1.15, 0.14, 0]} scale={[0.26, 0.26, 0.84]} />

  <RailDoorPanel position={[-0.38, 0.02, 0.5]} />
  <RailDoorPanel position={[-0.38, 0.02, -0.5]} />
  <RailConnector />

      <mesh position={[0.15, -0.48, 0]}>
        <boxGeometry args={[3.5, 0.08, 0.22]} />
        <meshStandardMaterial color='#334155' metalness={0.48} roughness={0.45} />
      </mesh>
      <mesh position={[0.15, -0.54, 0.5]}>
        <boxGeometry args={[3.5, 0.05, 0.04]} />
        <meshStandardMaterial color='#64748b' metalness={0.62} roughness={0.38} />
      </mesh>
      <mesh position={[0.15, -0.54, -0.5]}>
        <boxGeometry args={[3.5, 0.05, 0.04]} />
        <meshStandardMaterial color='#64748b' metalness={0.62} roughness={0.38} />
      </mesh>

      <HeadLight position={[1.55, -0.06, 0.27]} />
      <HeadLight position={[1.55, -0.06, -0.27]} />

      <Wheel position={[-1.05, -0.37, 0.49]} radius={0.16} width={0.16} />
      <Wheel position={[-0.15, -0.37, 0.49]} radius={0.16} width={0.16} />
      <Wheel position={[0.95, -0.37, 0.49]} radius={0.16} width={0.16} />
      <Wheel position={[-1.05, -0.37, -0.49]} radius={0.16} width={0.16} />
      <Wheel position={[-0.15, -0.37, -0.49]} radius={0.16} width={0.16} />
      <Wheel position={[0.95, -0.37, -0.49]} radius={0.16} width={0.16} />
    </group>
  );
}

export function TransportModel({ type }: { type: TransportType }) {
  if (type === 'bus') return <BusModel />;
  if (type === 'metro') return <MetroModel />;
  if (type === 'taxi') return <TaxiModel />;
  return <RailModel />;
}
