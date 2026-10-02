import { useState } from 'react'
import DogViewer from './DogViewer'

export default function App() {
  const [selected, setSelected] = useState(null)
  const [resetVersion, setResetVersion] = useState(0)

  return (
    <div className="app">
      <header className="brand-bar">
        <div className="brand"><span className="brand-mark" aria-hidden="true">A</span><div><strong>ARTEMIS</strong><span>VET TECHNOLOGIES</span></div></div>
        <span className="badge">Capstone prototype</span>
      </header>
      <main>
        <div className="page-heading"><div><p className="eyebrow">VETERINARY VISUALIZATION</p><h1>Canine model explorer</h1><p>Explore the model. Select a mesh. See a new perspective.</p></div><span className="species-tag">Canine / German shepherd</span></div>
        <div className="workspace">
          <section className="viewer-card" aria-label="Interactive 3D dog viewer">
            <div className="viewer-toolbar"><span><span className="status-dot" />3D workspace</span><button onClick={() => setResetVersion(v => v + 1)}>↺ Reset View</button></div>
            <DogViewer selected={selected} onSelect={setSelected} resetVersion={resetVersion} />
            <div className="viewer-footer"><span>Exterior model</span><span>Interactive • Orbit view</span></div>
          </section>
          <aside>
            <section className="panel"><p className="eyebrow">INSPECT</p><h2>Selection</h2><div className={`selection ${selected ? 'active' : ''}`} aria-live="polite"><span>{selected ? 'SELECTED MESH' : 'NO MESH SELECTED'}</span><strong>{selected?.name || 'Click the dog to inspect'}</strong></div><p>A selected mesh is highlighted in teal. Click empty space to clear it.</p>{selected && <button className="clear-button" onClick={() => setSelected(null)}>Clear selection</button>}<div className="note">This asset has one exterior mesh. Anatomical layers are not included.</div></section>
            <section className="panel"><p className="eyebrow">NAVIGATE</p><h2>Viewer controls</h2><dl><div><dt>Drag</dt><dd>Rotate</dd></div><div><dt>Scroll</dt><dd>Zoom</dd></div><div><dt>Right Drag</dt><dd>Pan</dd></div><div><dt>Click model</dt><dd>Select</dd></div></dl><p className="small">Touch: one finger rotates; pinch to zoom and use two fingers to pan.</p></section>
          </aside>
        </div>
        <footer className="page-footer">ARTEMIS Vet Technologies<span>Technical proof of concept • Not for clinical use</span></footer>
      </main>
    </div>
  )

}
