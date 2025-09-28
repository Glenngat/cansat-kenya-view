import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConnectionStatus } from '@/types/telemetry';
import { RotateCcw, Satellite } from 'lucide-react';
import * as THREE from 'three';

interface OrientationWindow3DProps {
  orientation?: {
    pitch: number;
    roll: number;
    yaw: number;
  };
  connectionStatus: ConnectionStatus;
}

const OrientationWindow3D: React.FC<OrientationWindow3DProps> = ({ 
  orientation, 
  connectionStatus 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const canSatRef = useRef<THREE.Group | null>(null);
  const animationRef = useRef<number | null>(null);
  const controlsRef = useRef<any>(null);

  const pitch = orientation?.pitch || 0;
  const roll = orientation?.roll || 0;
  const yaw = orientation?.yaw || 0;

  const getStatusColor = (status: ConnectionStatus) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'disconnected': return 'bg-red-500';
      case 'connecting': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: ConnectionStatus) => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'disconnected': return 'Disconnected';
      case 'connecting': return 'Connecting...';
      default: return 'Unknown';
    }
  };

  // Mouse controls
  useEffect(() => {
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let cameraPosition = { theta: 0, phi: Math.PI / 4, radius: 6 };

    const onMouseDown = (event: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isDragging || !cameraRef.current) return;

      const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y
      };

      cameraPosition.theta -= deltaMove.x * 0.01;
      cameraPosition.phi += deltaMove.y * 0.01;
      cameraPosition.phi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraPosition.phi));

      const x = cameraPosition.radius * Math.sin(cameraPosition.phi) * Math.cos(cameraPosition.theta);
      const y = cameraPosition.radius * Math.cos(cameraPosition.phi);
      const z = cameraPosition.radius * Math.sin(cameraPosition.phi) * Math.sin(cameraPosition.theta);

      cameraRef.current.position.set(x, y, z);
      cameraRef.current.lookAt(0, 0, 0);

      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (!cameraRef.current) return;

      cameraPosition.radius += event.deltaY * 0.01;
      cameraPosition.radius = Math.max(3, Math.min(15, cameraPosition.radius));

      const x = cameraPosition.radius * Math.sin(cameraPosition.phi) * Math.cos(cameraPosition.theta);
      const y = cameraPosition.radius * Math.cos(cameraPosition.phi);
      const z = cameraPosition.radius * Math.sin(cameraPosition.phi) * Math.sin(cameraPosition.theta);

      cameraRef.current.position.set(x, y, z);
      cameraRef.current.lookAt(0, 0, 0);
    };

    if (mountRef.current) {
      const element = mountRef.current;
      element.addEventListener('mousedown', onMouseDown);
      element.addEventListener('mousemove', onMouseMove);
      element.addEventListener('mouseup', onMouseUp);
      element.addEventListener('wheel', onWheel);

      return () => {
        element.removeEventListener('mousedown', onMouseDown);
        element.removeEventListener('mousemove', onMouseMove);
        element.removeEventListener('mouseup', onMouseUp);
        element.removeEventListener('wheel', onWheel);
      };
    }
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = 300; // Increased height for better visualization

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f); // Dark space-like background
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(4, 3, 6);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Advanced Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(5, 5, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 500;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x4080ff, 0.4);
    fillLight.position.set(-3, 2, -3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xff8040, 0.3);
    rimLight.position.set(0, -2, 5);
    scene.add(rimLight);

    // Create Enhanced CanSat Model
    const canSatGroup = new THREE.Group();
    
    // Main body (cylinder with metallic finish)
    const bodyGeometry = new THREE.CylinderGeometry(0.8, 0.8, 2.5, 32);
    const bodyMaterial = new THREE.MeshPhysicalMaterial({ 
      color: 0x2f7d32,
      metalness: 0.7,
      roughness: 0.3,
      clearcoat: 0.1,
      envMapIntensity: 1
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    canSatGroup.add(body);

    // Top antenna/sensor (bright red indicator)
    const topGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const topMaterial = new THREE.MeshPhysicalMaterial({ 
      color: 0xff1744,
      emissive: 0x440000,
      metalness: 0.2,
      roughness: 0.1
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = 1.4;
    top.castShadow = true;
    canSatGroup.add(top);

    // Solar panels (dark blue/black panels)
    const panelGeometry = new THREE.BoxGeometry(1.8, 0.05, 0.4);
    const panelMaterial = new THREE.MeshPhysicalMaterial({ 
      color: 0x0d47a1,
      metalness: 0.9,
      roughness: 0.1,
      reflectivity: 0.8
    });
    
    // Top panels
    for (let i = 0; i < 4; i++) {
      const panel = new THREE.Mesh(panelGeometry, panelMaterial);
      panel.position.y = 1.0;
      panel.rotation.y = (i * Math.PI) / 2;
      panel.castShadow = true;
      canSatGroup.add(panel);
    }

    // Bottom panels
    for (let i = 0; i < 4; i++) {
      const panel = new THREE.Mesh(panelGeometry, panelMaterial);
      panel.position.y = -1.0;
      panel.rotation.y = (i * Math.PI) / 2;
      panel.castShadow = true;
      canSatGroup.add(panel);
    }

    // Body details/sensors
    const detailGeometry = new THREE.BoxGeometry(1.6, 0.1, 0.1);
    const detailMaterial = new THREE.MeshPhysicalMaterial({ 
      color: 0x1b5e20,
      metalness: 0.8,
      roughness: 0.2
    });
    
    for (let i = 0; i < 3; i++) {
      const detail = new THREE.Mesh(detailGeometry, detailMaterial);
      detail.position.y = 0.5 - i * 0.5;
      detail.castShadow = true;
      canSatGroup.add(detail);
    }

    // Parachute compartment (top section)
    const parachuteGeometry = new THREE.CylinderGeometry(0.85, 0.8, 0.3, 16);
    const parachuteMaterial = new THREE.MeshPhysicalMaterial({ 
      color: 0xff6f00,
      metalness: 0.6,
      roughness: 0.4
    });
    const parachuteCompartment = new THREE.Mesh(parachuteGeometry, parachuteMaterial);
    parachuteCompartment.position.y = 1.1;
    parachuteCompartment.castShadow = true;
    canSatGroup.add(parachuteCompartment);

    canSatRef.current = canSatGroup;
    scene.add(canSatGroup);

    // Enhanced coordinate axes with labels
    const axesHelper = new THREE.AxesHelper(2.5);
    scene.add(axesHelper);

    // Add reference grid
    const gridHelper = new THREE.GridHelper(8, 8, 0x444444, 0x222222);
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    // Stars background
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 200;
    const starsPositions = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount * 3; i++) {
      starsPositions[i] = (Math.random() - 0.5) * 100;
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Animation loop with smooth transitions
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      if (canSatRef.current) {
        // Smooth rotation interpolation
        const targetRotationX = (pitch * Math.PI) / 180;
        const targetRotationZ = (roll * Math.PI) / 180;
        const targetRotationY = (yaw * Math.PI) / 180;

        // Linear interpolation for smooth movement
        const lerpFactor = 0.1;
        canSatRef.current.rotation.x += (targetRotationX - canSatRef.current.rotation.x) * lerpFactor;
        canSatRef.current.rotation.z += (targetRotationZ - canSatRef.current.rotation.z) * lerpFactor;
        canSatRef.current.rotation.y += (targetRotationY - canSatRef.current.rotation.y) * lerpFactor;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      
      const newWidth = mountRef.current.clientWidth;
      const newHeight = 300;
      
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Satellite className="h-5 w-5" />
            CanSat Orientation (3D)
          </CardTitle>
          <Badge 
            variant={connectionStatus === 'connected' ? 'default' : 'destructive'}
            className={`${getStatusColor(connectionStatus)} text-white`}
          >
            {getStatusText(connectionStatus)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enhanced 3D Visualization */}
        <div className="relative">
          <div 
            ref={mountRef}
            className="w-full h-[300px] bg-gray-900 rounded-lg border border-gray-700 cursor-grab active:cursor-grabbing overflow-hidden"
            style={{ minHeight: '300px' }}
          />
          <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
            Click and drag to rotate • Scroll to zoom
          </div>
        </div>

        {/* Enhanced Orientation Values */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600 font-mono">
              {pitch.toFixed(1)}°
            </div>
            <div className="text-sm font-medium text-gray-700">Pitch</div>
            <div className="text-xs text-blue-600">X-axis rotation</div>
          </div>
          
          <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600 font-mono">
              {roll.toFixed(1)}°
            </div>
            <div className="text-sm font-medium text-gray-700">Roll</div>
            <div className="text-xs text-green-600">Z-axis rotation</div>
          </div>
          
          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600 font-mono">
              {yaw.toFixed(1)}°
            </div>
            <div className="text-sm font-medium text-gray-700">Yaw</div>
            <div className="text-xs text-purple-600">Y-axis rotation</div>
          </div>
        </div>

        {/* Enhanced Status Display */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 
              connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
              'bg-red-500'
            }`}></div>
            <span className="text-sm font-medium">
              {connectionStatus === 'connected' ? 'Live telemetry data' : 
               connectionStatus === 'connecting' ? 'Establishing connection...' : 
               'No telemetry data'}
            </span>
          </div>
          
          <button 
            className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-md transition-colors duration-200 text-sm"
            onClick={() => {
              console.log('Reset orientation view');
              // Reset camera position
              if (cameraRef.current) {
                cameraRef.current.position.set(4, 3, 6);
                cameraRef.current.lookAt(0, 0, 0);
              }
            }}
          >
            <RotateCcw className="h-3 w-3" />
            Reset View
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrientationWindow3D;
