import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Mesh } from 'three';
import { ConnectionStatus } from '@/types/telemetry';
import { RotateCcw, Satellite } from 'lucide-react';

interface OrientationWindowProps {
  orientation?: {
    pitch: number;
    roll: number;
    yaw: number;
  };
  connectionStatus: ConnectionStatus;
}

// CanSat 3D Model Component (Soda Can Shape)
const CanSatModel: React.FC<{ orientation?: { pitch: number; roll: number; yaw: number } }> = ({ 
  orientation 
}) => {
  const meshRef = useRef<Mesh>(null);

  useFrame(() => {
    if (meshRef.current && orientation) {
      // Convert degrees to radians and apply rotations
      const pitch = (orientation.pitch * Math.PI) / 180;
      const roll = (orientation.roll * Math.PI) / 180;
      const yaw = (orientation.yaw * Math.PI) / 180;
      
      // Apply rotations with smooth interpolation
      meshRef.current.rotation.x = pitch;
      meshRef.current.rotation.z = roll;
      meshRef.current.rotation.y = yaw;
    }
  });

  return (
    <group>
      {/* Main CanSat Body (Cylinder) */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 2.5, 32]} />
        <meshStandardMaterial 
          color="#2f7d32" 
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* Top Cap */}
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.82, 0.82, 0.1, 32]} />
        <meshStandardMaterial 
          color="#1b5e20" 
          roughness={0.2}
          metalness={0.2}
        />
      </mesh>
      
      {/* Bottom Cap */}
      <mesh position={[0, -1.3, 0]}>
        <cylinderGeometry args={[0.82, 0.82, 0.1, 32]} />
        <meshStandardMaterial 
          color="#1b5e20" 
          roughness={0.2}
          metalness={0.2}
        />
      </mesh>
      
      {/* Antenna */}
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
        <meshStandardMaterial color="#424242" />
      </mesh>
      
      {/* Solar Panels */}
      <mesh position={[0.9, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.8, 0.02, 0.6]} />
        <meshStandardMaterial color="#1a237e" roughness={0.1} metalness={0.8} />
      </mesh>
      <mesh position={[-0.9, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.8, 0.02, 0.6]} />
        <meshStandardMaterial color="#1a237e" roughness={0.1} metalness={0.8} />
      </mesh>
      
      {/* Kenya Flag Stripe */}
      <mesh position={[0, 0.2, 0.81]}>
        <boxGeometry args={[1.5, 0.3, 0.01]} />
        <meshStandardMaterial color="#d32f2f" />
      </mesh>
      <mesh position={[0, -0.2, 0.81]}>
        <boxGeometry args={[1.5, 0.3, 0.01]} />
        <meshStandardMaterial color="#000" />
      </mesh>
    </group>
  );
};

// Orientation data display
const OrientationData: React.FC<{ orientation?: { pitch: number; roll: number; yaw: number } }> = ({ 
  orientation 
}) => {
  if (!orientation) return null;

  return (
    <div className="grid grid-cols-3 gap-2 text-xs">
      <div className="text-center">
        <div className="text-muted-foreground">Pitch</div>
        <div className="font-mono font-semibold">{orientation.pitch.toFixed(1)}°</div>
      </div>
      <div className="text-center">
        <div className="text-muted-foreground">Roll</div>
        <div className="font-mono font-semibold">{orientation.roll.toFixed(1)}°</div>
      </div>
      <div className="text-center">
        <div className="text-muted-foreground">Yaw</div>
        <div className="font-mono font-semibold">{orientation.yaw.toFixed(1)}°</div>
      </div>
    </div>
  );
};

export const OrientationWindow: React.FC<OrientationWindowProps> = ({ 
  orientation, 
  connectionStatus 
}) => {
  return (
    <Card className="orientation-window">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <RotateCcw className="h-5 w-5 cansat-green" />
          <CardTitle className="text-lg">Orientation</CardTitle>
        </div>
        <Badge 
          variant={connectionStatus.connected ? "outline" : "destructive"}
          className={connectionStatus.connected ? "status-connected border-current" : ""}
        >
          <Satellite className="h-3 w-3 mr-1" />
          {connectionStatus.connected ? "Live" : "No Data"}
        </Badge>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[280px] bg-gradient-to-b from-slate-900 to-slate-800 rounded-b-lg">
          <Canvas
            camera={{ 
              position: [0, 0, 8], 
              fov: 50,
              near: 0.1,
              far: 1000 
            }}
            style={{ width: '100%', height: '100%' }}
          >
            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={1} 
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <pointLight position={[-10, -10, -10]} intensity={0.3} />
            
            {/* 3D CanSat Model */}
            <CanSatModel orientation={orientation} />
            
            {/* Orbit Controls for manual interaction */}
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={3}
              maxDistance={15}
            />
            
            {/* Background stars effect */}
            <mesh position={[0, 0, -20]}>
              <sphereGeometry args={[30, 32, 32]} />
              <meshBasicMaterial color="#000011" side={2} />
            </mesh>
          </Canvas>
        </div>
        
        {/* Orientation Data */}
        <div className="p-4 border-t border-border">
          <OrientationData orientation={orientation} />
        </div>
      </CardContent>
    </Card>
  );
};