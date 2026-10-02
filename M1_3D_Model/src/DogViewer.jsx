import { Component, Suspense, useLayoutEffect, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import { MOUSE, Vector3 } from 'three'
import DogModel from './DogModel'

function CameraControls() {
  const controls = useRef()
  const { camera, size } = useThree()
  // Fit the normalized sphere using the narrower field of view, including phones.
  const halfFov = Math.atan(Math.tan(camera.fov * Math.PI / 360) * Math.min(size.width / size.height, 1))
  const distance = Math.max(4.8, 1.5 / Math.sin(halfFov) * 1.2)

  useLayoutEffect(() => {
    camera.position.copy(new Vector3(0.65, 0.35, 1).normalize().multiplyScalar(distance))
    camera.lookAt(0, 0, 0)
    controls.current.target.set(0, 0, 0)
    controls.current.update()
  }, [camera, distance])

  return <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.08}
    minDistance={2.6} maxDistance={Math.max(9, distance * 1.5)}
    minPolarAngle={0.12} maxPolarAngle={Math.PI / 2 - 0.03}
    mouseButtons={{ LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN }}
    onChange={() => {
      // Limit panning so the camera's orbit cannot move inside the dog.
      // Radius 1.5 + maximum pan 0.65 stays below minDistance 2.6.
      const orbit = controls.current
      if (!orbit || orbit.target.length() <= 0.65) return
      const clamped = orbit.target.clone().clampLength(0, 0.65)
      camera.position.add(clamped.clone().sub(orbit.target))
      orbit.target.copy(clamped)
    }} />
}

class ViewerErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (this.state.failed) return <div className="viewer-message" role="alert"><strong>Unable to display the 3D model.</strong><p>Check that the GLB is present and WebGL is enabled, then reload the page.</p></div>
    return this.props.children
  }
}

export default function DogViewer({ selected, onSelect, resetVersion }) {
  const [groundY, setGroundY] = useState(-0.75)
  return (
    <div className="canvas-container" onContextMenu={event => event.preventDefault()}>
      <ViewerErrorBoundary>
        {/* Canvas creates the renderer, scene, camera, and animation loop.
            Elements inside it are 3D objects rather than HTML elements. */}
        <Canvas camera={{ position: [3, 2, 5], fov: 42, near: 0.05, far: 100 }} dpr={[1, 2]}
          onPointerMissed={event => { if (event.button === 0) onSelect(null) }}
          fallback={<div className="viewer-message">This browser does not support WebGL.</div>}>
          <color attach="background" args={['#edf3f3']} />
          <ambientLight intensity={1.2} />
          <directionalLight position={[3, 5, 4]} intensity={2} />
          <directionalLight position={[-4, 2, -3]} intensity={0.7} />
          <Suspense fallback={<Html center><div className="loading" role="status">Loading dog model…</div></Html>}>
            <DogModel selected={selected} onSelect={onSelect} onGround={setGroundY} />
          </Suspense>
          {/* A muted disk provides a ground reference without intercepting clicks. */}
          <mesh position={[0, groundY - 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
            <circleGeometry args={[2.1, 80]} /><meshStandardMaterial color="#dce8e7" roughness={1} />
          </mesh>
          {/* Remount controls to discard damping momentum when Reset View is pressed. */}
          <CameraControls key={resetVersion} />
        </Canvas>
      </ViewerErrorBoundary>
    </div>
  )
}
