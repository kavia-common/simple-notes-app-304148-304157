import React, { useMemo, useState } from "react";

function formatUpdatedTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function noteTitle(note) {
  const t = (note.title || "").trim();
  return t.length ? t : "Untitled";
}

/**
 * PUBLIC_INTERFACE
 * Sidebar notes list with search and selection.
 */
export default function NotesList({ notes, selectedId, onSelect, onDelete, onTogglePinned }) {
  const [query, setQuery] = useState("");

  // Optional enhancement: add a filter control All / Pinned / Unpinned here if desired.
  // TODO: Keep it simple for now; implement if/when requested.

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((n) => {
      const title = (n.title || "").toLowerCase();
      const content = (n.content || "").toLowerCase();
      return title.includes(q) || content.includes(q);
    });
  }, [notes, query]);

  return (
    <aside className="NotesList" aria-label="Notes list">
      <div className="NotesList__header">
        <label className="NotesList__searchLabel" htmlFor="notes-search">
          Search
        </label>
        <input
          id="notes-search"
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes..."
          aria-label="Search notes"
        />
      </div>

      <div className="NotesList__body">
        {filtered.length === 0 ? (
          <div className="emptyState">
            <div className="emptyState__title">No notes found</div>
            <div className="emptyState__desc">Try a different search, or create a new note.</div>
          </div>
        ) : (
          <ul className="NotesList__items" role="list">
            {filtered.map((n) => {
              const isSelected = n.id === selectedId;

              return (
                <li key={n.id} className={`NotesList__item ${isSelected ? "is-selected" : ""}`}>
                  <button
                    type="button"
                    className="NotesList__itemButton"
                    onClick={() => onSelect(n.id)}
                    aria-current={isSelected ? "true" : "false"}
                  >
                    <div className="NotesList__itemTitle">
                      {noteTitle(n)}
                      {n.pinned ? (
                        <span className="PinBadge" aria-label="Pinned note">
                          Pinned
                        </span>
                      ) : null}
                    </div>
                    <div className="NotesList__itemMeta">{formatUpdatedTime(n.updatedAt)}</div>
                  </button>

                  <div className="NotesList__itemActions" aria-label="Note actions">
                    <button
                      type="button"
                      className={`IconButton ${n.pinned ? "is-active" : ""}`}
                      onClick={(e) => {
                        // Prevent triggering selection when clicking the pin control.
                        e.stopPropagation();
                        onTogglePinned && onTogglePinned(n.id);
                      }}
                      aria-pressed={n.pinned ? "true" : "false"}
                      aria-label={n.pinned ? `Unpin ${noteTitle(n)}` : `Pin ${noteTitle(n)}`}
                      title={n.pinned ? "Unpin" : "Pin"}
                      disabled={!onTogglePinned}
                    >
                      <span aria-hidden="true">{n.pinned ? "📌" : "📍"}</span>
                    </button>

                    <button
                      type="button"
                      className="NotesList__deleteButton"
                      onClick={(e) => {
                        // Prevent triggering selection when clicking delete.
                        e.stopPropagation();
                        onDelete(n.id);
                      }}
                      aria-label={`Delete ${noteTitle(n)}`}
                      title="Delete note"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
