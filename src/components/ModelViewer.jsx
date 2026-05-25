import React, { Suspense, useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Center, Html } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RotateCcw, Play, Pause, Grid, Sun, Loader2, Maximize } from 'lucide-react';

// Loader helper inside canvas
function CanvasLoader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 px-6 py-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 backdrop-blur-md shadow-2xl">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <span className="text-sm font-semibold text-neutral-200">Streaming GLB Assets...</span>
      </div>
    </Html>
  );
}

// Model component — GLTFLoader gives reliable error callbacks (no Suspense try/catch)
function Model({ url, onLoadError }) {
  const [scene, setScene] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setScene(null);
    const loader = new GLTFLoader();

    loader.load(
      url,
      (gltf) => {
        if (cancelled) return;
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        setScene(gltf.scene);
      },
      undefined,
      (error) => {
        if (!cancelled) {
          onLoadError(error?.message || 'Failed to load GLB model.');
        }
      }
    );

    return () => {
      cancelled = true;
    };
  }, [url, onLoadError]);

  if (!scene) return null;
  return <primitive object={scene} dispose={null} />;
}

// Inner scene manager to align camera & sync changes
function SceneController({ 
  url, 
  initialState, 
  onStateChange, 
  controlsRef,
  lightingProfile,
  showGrid,
  autoRotate,
  onLoadError
}) {
  const { camera } = useThree();
  const isInitializedRef = useRef(false);

  // Sync state only on initial mount or specific state load
  useEffect(() => {
    if (!controlsRef.current || !initialState || isInitializedRef.current) return;

    const { cameraPosition, targetPosition, zoomLevel } = initialState;

    if (cameraPosition && cameraPosition.length === 3) {
      camera.position.set(cameraPosition[0], cameraPosition[1], cameraPosition[2]);
    } else {
      camera.position.set(0, 0, 5);
    }

    if (targetPosition && targetPosition.length === 3) {
      controlsRef.current.target.set(targetPosition[0], targetPosition[1], targetPosition[2]);
    } else {
      controlsRef.current.target.set(0, 0, 0);
    }

    if (zoomLevel) {
      camera.zoom = zoomLevel;
    }

    camera.updateProjectionMatrix();
    controlsRef.current.update();
    isInitializedRef.current = true;
  }, [camera, initialState, controlsRef]);

  // Handle movements and propagate coordinates
  const handleControlsChange = () => {
    if (!controlsRef.current || !onStateChange || !isInitializedRef.current) return;

    const camPos = [camera.position.x, camera.position.y, camera.position.z];
    const targetPos = [
      controlsRef.current.target.x,
      controlsRef.current.target.y,
      controlsRef.current.target.z,
    ];
    const zoom = camera.zoom;

    onStateChange({
      cameraPosition: camPos,
      targetPosition: targetPos,
      zoomLevel: zoom,
    });
  };

  // Render custom light setups
  const renderLighting = () => {
    switch (lightingProfile) {
      case 'sunset':
        return (
          <>
            <ambientLight intensity={0.4} color="#fca5a5" />
            <directionalLight position={[5, 5, 5]} intensity={1.5} color="#fdba74" castShadow />
            <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#93c5fd" />
          </>
        );
      case 'neon':
        return (
          <>
            <ambientLight intensity={0.3} />
            <directionalLight position={[3, 10, 3]} intensity={1} color="#f472b6" />
            <directionalLight position={[-3, -5, -3]} intensity={0.8} color="#c084fc" />
            <pointLight position={[0, 0, 5]} intensity={1} color="#38bdf8" />
          </>
        );
      case 'studio':
      default:
        return (
          <>
            <ambientLight intensity={0.6} color="#f8fafc" />
            <directionalLight position={[10, 10, 10]} intensity={1.2} castShadow />
            <directionalLight position={[-10, 5, -10]} intensity={0.4} />
          </>
        );
    }
  };

  return (
    <>
      {renderLighting()}
      {showGrid && <gridHelper args={[20, 20, '#4b5563', '#1f2937']} position={[0, -1, 0]} />}
      
      <Center>
        <Model url={url} onLoadError={onLoadError} />
      </Center>

      <OrbitControls
        ref={controlsRef}
        onChange={handleControlsChange}
        autoRotate={autoRotate}
        autoRotateSpeed={0.8}
        enableDamping
        dampingFactor={0.05}
        maxPolarAngle={Math.PI / 1.5}
        minDistance={1}
        maxDistance={50}
      />
    </>
  );
}

export const ModelViewer = ({ modelUrl, initialState, onStateChange, isSaving }) => {
  const controlsRef = useRef();
  const [lightingProfile, setLightingProfile] = useState('studio');
  const [showGrid, setShowGrid] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const handleLoadError = useCallback((message) => {
    setLoadError(message);
  }, []);

  useEffect(() => {
    setLoadError(null);
  }, [modelUrl]);

  // Resets OrbitControls and Camera back to their default vantage points
  const handleResetCamera = () => {
    if (!controlsRef.current) return;
    
    // Animate or reset camera positions
    const controls = controlsRef.current;
    controls.reset();
    
    // Explicit coordinates reset
    controls.target.set(0, 0, 0);
    controls.object.position.set(0, 0, 5);
    controls.object.zoom = 1;
    controls.object.updateProjectionMatrix();
    controls.update();

    // Trigger state change save immediately
    if (onStateChange) {
      onStateChange({
        cameraPosition: [0, 0, 5],
        targetPosition: [0, 0, 0],
        zoomLevel: 1,
      });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px] border border-neutral-800 bg-neutral-950 rounded-2xl overflow-hidden group shadow-2xl">
      {/* Floating Canvas UI controls overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
        <button
          onClick={handleResetCamera}
          className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900/80 border border-neutral-800 backdrop-blur rounded-xl text-xs font-semibold text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800 transition shadow-lg cursor-pointer"
          title="Reset Camera Vantage Point"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Camera</span>
        </button>

        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`flex items-center gap-1.5 px-3 py-2 border backdrop-blur rounded-xl text-xs font-semibold transition shadow-lg cursor-pointer ${
            autoRotate
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-neutral-900/80 border-neutral-800 text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800'
          }`}
          title="Toggle Auto Rotation Mode"
        >
          {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>Auto Rotate</span>
        </button>

        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`flex items-center gap-1.5 px-3 py-2 border backdrop-blur rounded-xl text-xs font-semibold transition shadow-lg cursor-pointer ${
            showGrid
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-neutral-900/80 border-neutral-800 text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Grid Helper</span>
        </button>
      </div>

      {/* Right controls - Lighting selector */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {/* Saving coordination status */}
        {isSaving && (
          <div className="flex items-center gap-2 px-3 py-2 bg-neutral-900/90 border border-emerald-500/20 backdrop-blur rounded-xl text-xs font-semibold text-emerald-400 animate-pulse shadow-lg">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            <span>Autosaving State...</span>
          </div>
        )}

        <div className="relative flex bg-neutral-900/80 border border-neutral-800 backdrop-blur rounded-xl p-0.5 shadow-lg">
          <button
            onClick={() => setLightingProfile('studio')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              lightingProfile === 'studio' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Studio Lighting"
          >
            Studio
          </button>
          <button
            onClick={() => setLightingProfile('sunset')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              lightingProfile === 'sunset' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Sunset Mood"
          >
            Sunset
          </button>
          <button
            onClick={() => setLightingProfile('neon')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              lightingProfile === 'neon' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Cyber Neon Light"
          >
            Neon
          </button>
        </div>
      </div>

      {/* Center Viewer Instructions overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 hidden sm:flex items-center gap-4 px-4 py-2 rounded-xl bg-neutral-900/60 border border-neutral-800/40 backdrop-blur-sm text-[10px] text-neutral-400 uppercase tracking-widest pointer-events-none select-none">
        <span>🖱️ Drag to rotate</span>
        <span>•</span>
        <span>↔️ Shift+Drag to pan</span>
        <span>•</span>
        <span>🔍 Scroll to zoom</span>
      </div>

      {loadError ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-950 p-6">
          <div className="text-center p-6 border border-neutral-800 bg-neutral-900/20 max-w-md rounded-2xl flex flex-col items-center gap-3">
            <span className="text-3xl">⚠️</span>
            <h3 className="font-bold text-neutral-200 text-base">Geometry Loading Failed</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              The 3D engine failed to parse the uploaded `.glb` asset. Ensure the file is a valid binary glTF model.
            </p>
            <p className="text-xs text-rose-500/80 bg-rose-950/20 px-3 py-2 rounded-lg mt-2 font-mono w-full truncate">
              {loadError}
            </p>
          </div>
        </div>
      ) : (
        <Canvas
          shadows
          camera={{ position: [0, 0, 5], fov: 45 }}
          gl={{ preserveDrawingBuffer: true, antialias: true }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          <Suspense fallback={<CanvasLoader />}>
            <SceneController
              url={modelUrl}
              initialState={initialState}
              onStateChange={onStateChange}
              controlsRef={controlsRef}
              lightingProfile={lightingProfile}
              showGrid={showGrid}
              autoRotate={autoRotate}
              onLoadError={handleLoadError}
            />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
};
