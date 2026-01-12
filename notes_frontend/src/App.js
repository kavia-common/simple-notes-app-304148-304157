import React, { useMemo } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import NotesList from "./components/NotesList";
import Editor from "./components/Editor";
import { useNotesStore } from "./hooks/useNotesStore";
import { api } from "./lib/api";

// PUBLIC_INTERFACE
function App() {
  const { notes, selectedId, selectedNote, createNote, selectNote, updateNote, deleteNote } = useNotesStore();

  const apiEnabled = useMemo(() => api.isEnabled(), []);

  function handleNewNote() {
    createNote();
  }

  function handleDelete(id) {
    const note = notes.find((n) => n.id === id);
    const title = (note?.title || "").trim() || "Untitled";
    const ok = window.confirm(`Delete "${title}"? This cannot be undone.`);
    if (!ok) return;

    deleteNote(id);
  }

  function handleSearchChange(value) {
    // Placeholder hook: NavBar search is not wired to filtering yet.
    // Keeping handler in place so consumers can integrate later without changing NavBar API.
    void value;
  }

  return (
    <div className="AppShell">
      <Navbar title="Simple Notes" onNewNote={handleNewNote} onSearchChange={handleSearchChange} apiEnabled={apiEnabled} />

      <main className="Main" role="main">
        <div className="Split">
          <div className="Split__left">
            <NotesList
              notes={notes}
              selectedId={selectedId}
              onSelect={selectNote}
              onDelete={handleDelete}
              onTogglePinned={(id) => {
                const n = notes.find((x) => x.id === id);
                if (!n) return;
                updateNote(id, { pinned: !n.pinned });
              }}
            />
          </div>

          <div className="Split__right">
            {notes.length === 0 ? (
              <div className="Editor">
                <div className="emptyState emptyState--center">
                  <div className="emptyState__title">No notes yet</div>
                  <div className="emptyState__desc">Create your first note to get started.</div>
                  <div style={{ marginTop: 12 }}>
                    <button className="btn btn-primary" type="button" onClick={handleNewNote}>
                      Create a note
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Editor
                note={selectedNote}
                onTogglePinned={() => selectedNote && updateNote(selectedNote.id, { pinned: !selectedNote.pinned })}
                onChangeTitle={(title) => selectedNote && updateNote(selectedNote.id, { title })}
                onChangeContent={(content) => selectedNote && updateNote(selectedNote.id, { content })}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
