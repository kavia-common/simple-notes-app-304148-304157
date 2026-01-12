import React, { useEffect, useState } from "react";

function titleForHeader(note) {
  const t = (note?.title || "").trim();
  return t.length ? t : "Untitled";
}

/**
 * PUBLIC_INTERFACE
 * Right pane editor for viewing/editing a single note.
 */
export default function Editor({ note, onChangeTitle, onChangeContent }) {
  const [localTitle, setLocalTitle] = useState(note?.title || "");
  const [localContent, setLocalContent] = useState(note?.content || "");

  // Keep local input state synced when selection changes.
  useEffect(() => {
    setLocalTitle(note?.title || "");
    setLocalContent(note?.content || "");
  }, [note?.id]); // key on id to avoid resetting while typing

  if (!note) {
    return (
      <section className="Editor" aria-label="Note editor">
        <div className="emptyState emptyState--center">
          <div className="emptyState__title">Select a note</div>
          <div className="emptyState__desc">Choose a note from the list, or create a new one.</div>
        </div>
      </section>
    );
  }

  return (
    <section className="Editor" aria-label="Note editor">
      <div className="Editor__header">
        <div className="Editor__headerTitle" aria-label="Current note">
          {titleForHeader(note)}
        </div>
        <div className="Editor__headerMeta">
          Updated:{" "}
          {new Date(note.updatedAt).toLocaleString([], {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      <div className="Editor__fields">
        <label className="label" htmlFor="note-title">
          Title
        </label>
        <input
          id="note-title"
          className="input input--title"
          value={localTitle}
          onChange={(e) => {
            const v = e.target.value;
            setLocalTitle(v);
            onChangeTitle(v);
          }}
          placeholder="Untitled"
        />

        <label className="label" htmlFor="note-content">
          Content
        </label>
        <textarea
          id="note-content"
          className="textarea"
          value={localContent}
          onChange={(e) => {
            const v = e.target.value;
            setLocalContent(v);
            onChangeContent(v);
          }}
          placeholder="Write your note here... (markdown-ready plain text)"
        />
      </div>
    </section>
  );
}
