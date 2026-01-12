import React from "react";

/**
 * PUBLIC_INTERFACE
 * Top navigation bar for the notes app.
 */
export default function Navbar({ onNewNote, apiEnabled }) {
  return (
    <div className="Navbar" role="banner">
      <div className="Navbar__left">
        <div className="Navbar__brand" aria-label="Simple Notes App">
          Simple Notes
        </div>
        <div className="Navbar__meta" aria-live="polite">
          {apiEnabled ? "API mode (placeholder)" : "Local mode"}
        </div>
      </div>

      <div className="Navbar__right">
        <button className="btn btn-primary" type="button" onClick={onNewNote}>
          New note
        </button>
      </div>
    </div>
  );
}
