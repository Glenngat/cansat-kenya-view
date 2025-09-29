import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface CanSat3DProps {
  orientation?: {
    pitch: number;
    roll: number;
    yaw: number;
  };
}

const CanSatModel: React.FC<{ orientation?: { pitch: number; roll: number; yaw: number } }> = ({ orientation }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current && orientation) {
      // Convert degrees to radians and apply rotations
      groupRef.current.rotation.x = (orientation.pitch * Math.PI) / 180;
      groupRef.current.rotation.z = (orientation.roll * Math.PI) / 180;
      groupRef.current.rotation.y = (orientation.yaw * Math.PI) / 180;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main body - cylindrical */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 2, 16]} />
        <meshStandardMaterial color="#2563eb" />
      </mesh>

      {/* Top cap */}
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.2, 16]} />
        <meshStandardMaterial color="#1e40af" />
      </mesh>

      {/* Bottom cap */}
      <mesh position={[0, -1.1, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.2, 16]} />
        <meshStandardMaterial color="#1e40af" />
      </mesh>

      {/* Parachute compartment (top) */}
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.4, 8]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>

      {/* Sensor fins */}
      <mesh position={[0.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.2, 0.1, 0.8]} />
        <meshStandardMaterial color="#16a34a" />
      </mesh>
      <mesh position={[-0.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.2, 0.1, 0.8]} />
        <meshStandardMaterial color="#16a34a" />
      </mesh>
      <mesh position={[0, 0, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.2, 0.1, 0.8]} />
        <meshStandardMaterial color="#16a34a" />
      </mesh>
      <mesh position={[0, 0, -0.6]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.2, 0.1, 0.8]} />
        <meshStandardMaterial color="#16a34a" />
      </mesh>

      {/* Antenna */}
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>

      {/* Indicator lights */}
      <mesh position={[0, 0.5, 0.51]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, -0.5, 0.51]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
};

export const CanSat3D: React.FC<CanSat3DProps> = ({ orientation }) => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [3, 2, 3], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        <CanSatModel orientation={orientation} />
        
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={8}
          autoRotate={!orientation}
          autoRotateSpeed={0.5}
        />
        
        {/* Grid helper for reference */}
        <gridHelper args={[4, 10]} position={[0, -2, 0]} />
      </Canvas>
    </div>
  );
};