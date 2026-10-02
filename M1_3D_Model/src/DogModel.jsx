import { useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { Box3, Sphere, Vector3 } from 'three'

// Vite resolves this existing file in development and copies it into the build.
// The original GLB stays in its original directory; its texture is embedded.
import dogUrl from '../low-poly-german-shepherd-dog-3d-model-free/source/German shepherd_glb.glb?url'

export default function DogModel({ selected, onSelect, onGround }) {
  // useGLTF loads and caches the GLB. Suspense shows a message while it loads.
  const { scene } = useGLTF(dogUrl)
  const { model, scale, offset, groundY } = useMemo(() => {
    const model = scene.clone(true)
    const bounds = new Box3().setFromObject(model)
    const center = bounds.getCenter(new Vector3())
    // Normalize the bounding sphere to radius 1.5, independent of asset units.
    const scale = 1.5 / Math.max(bounds.getBoundingSphere(new Sphere()).radius, 0.001)
    return {
      model,
      scale,
      offset: center.clone().multiplyScalar(-scale),
      groundY: (bounds.min.y - center.y) * scale,
    }
  }, [scene])

  useEffect(() => { onGround(groundY) }, [groundY, onGround])

  useEffect(() => {
    if (!selected) return
    const mesh = model.getObjectByProperty('uuid', selected.id)
    if (!mesh?.isMesh) return
    const original = mesh.material
    // Only temporary material copies are tinted. Cached GLB materials stay intact.
    const highlight = (material) => {
      const copy = material.clone()
      copy.color?.lerp({ r: 0.03, g: 0.65, b: 0.57 }, 0.45)
      copy.emissive?.set('#087f78')
      if (copy.emissive) copy.emissiveIntensity = 0.35
      return copy
    }
    mesh.material = Array.isArray(original) ? original.map(highlight) : highlight(original)
    const copies = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    return () => {
      mesh.material = original
      copies.forEach(material => material.dispose())
    }
  }, [model, selected])

  return (
    <group scale={scale} position={offset}>
      {/* primitive places the loaded Three.js scene in the React scene graph.
          R3F raycasts clicks and gives us the actual intersected mesh. */}
      <primitive object={model} dispose={null} onClick={event => {
        if (event.delta > 4 || event.button !== 0) return
        event.stopPropagation()
        onSelect({ id: event.object.uuid, name: event.object.name || 'Unnamed mesh' })
      }} />
    </group>
  )
}
