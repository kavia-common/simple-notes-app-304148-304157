import React from "react";

/**
 * PUBLIC_INTERFACE
 * Top navigation bar for the notes app.
 *
 * Props:
 * - title?: string - Brand title text shown on the left.
 * - searchValue?: string - Controlled value for the search input (optional).
 * - onSearchChange?: (value: string) => void - Called when search input changes.
 * - onNewNote?: () => void - Optional handler for a future "New Note" action.
 * - actions?: React.ReactNode - Optional right-side action area override/extension.
 * - apiEnabled?: boolean - Optional status flag (kept for current app behavior).
 */
export default function Navbar({
  title = "Simple Notes",
  searchValue = "",
  onSearchChange,
  onNewNote,
  actions,
  apiEnabled,
}) {
  return (
    <header className="Navbar" role="banner">
      <div className="Navbar__left">
        <div className="Navbar__brand" aria-label={`${title} App`}>
          {title}
        </div>
        {typeof apiEnabled === "boolean" ? (
          <div className="Navbar__meta" aria-live="polite">
            {apiEnabled ? "API mode (placeholder)" : "Local mode"}
          </div>
        ) : null}
      </div>

      <div className="Navbar__center" aria-label="Global search">
        <label className="srOnly" htmlFor="global-search">
          Search notes
        </label>
        <input
          id="global-search"
          className="input Navbar__searchInput"
          value={searchValue}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          placeholder="Search notes..."
          aria-label="Search notes"
        />
      </div>

      <div className="Navbar__right" aria-label="Actions">
        {actions}
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => onNewNote && onNewNote()}
          disabled={!onNewNote}
          aria-disabled={!onNewNote ? "true" : "false"}
          title={onNewNote ? "Create a new note" : "New note (coming soon)"}
        >
          New note
        </button>
      </div>
    </header>
  );
}
