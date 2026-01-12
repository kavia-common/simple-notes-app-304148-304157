import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../lib/api";

const STORAGE_KEY = "notes_v1";

/**
 * Generate a lightweight UUID (RFC4122-ish) without external deps.
 * Falls back to Math.random when crypto is unavailable.
 */
function uuid() {
  // Prefer crypto.randomUUID when available (modern browsers).
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();

  // Fallback: not cryptographically secure but fine for local note IDs.
  const hex = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return `${hex()}${hex()}-${hex()}-${hex()}-${hex()}-${hex()}${hex()}${hex()}`;
}

function now() {
  return Date.now();
}

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

function loadFromLocalStorage() {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  const parsed = safeParse(raw, []);
  return Array.isArray(parsed) ? parsed : [];
}

function saveToLocalStorage(notes) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function sortNotesDesc(notes) {
  return [...notes].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

/**
 * PUBLIC_INTERFACE
 * Hook that manages notes state (CRUD + selection) with localStorage persistence.
 * Structured so API integration can later be enabled via REACT_APP_API_BASE.
 */
export function useNotesStore() {
  /** @type {[Array<{id:string,title:string,content:string,createdAt:number,updatedAt:number}>, Function]} */
  const [notes, setNotes] = useState(() => sortNotesDesc(loadFromLocalStorage()));
  const [selectedId, setSelectedId] = useState(() => (loadFromLocalStorage()[0]?.id ? loadFromLocalStorage()[0].id : null));
  const didHydrateRef = useRef(false);

  // Hydrate once on mount: if API exists in future, this is where we'd fetch.
  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      // Always start from local to keep app fast ensures offline mode.
      const localNotes = sortNotesDesc(loadFromLocalStorage());
      if (!cancelled) {
        setNotes(localNotes);
        setSelectedId((prev) => prev ?? localNotes[0]?.id ?? null);
        didHydrateRef.current = true;
      }

      // Optional API load: guarded; app must not depend on backend availability.
      if (api.isEnabled()) {
        try {
          const apiNotes = await api.listNotes();
          if (cancelled) return;
          if (Array.isArray(apiNotes) && apiNotes.length > 0) {
            // For now, do not overwrite local data automatically.
            // This is a deliberate choice to avoid unexpected data loss.
            // A future iteration can add merge/sync strategy.
          }
        } catch {
          // Swallow errors: backend may not exist.
        }
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist on every change after initial hydration.
  useEffect(() => {
    if (!didHydrateRef.current) return;
    saveToLocalStorage(notes);
  }, [notes]);

  const selectedNote = useMemo(() => notes.find((n) => n.id === selectedId) || null, [notes, selectedId]);

  // Keep selection valid if current note gets deleted.
  useEffect(() => {
    if (!selectedId) return;
    const stillExists = notes.some((n) => n.id === selectedId);
    if (stillExists) return;

    setSelectedId(notes[0]?.id ?? null);
  }, [notes, selectedId]);

  /**
   * PUBLIC_INTERFACE
   * Create a new empty note and select it.
   */
  function createNote() {
    const ts = now();
    const note = {
      id: uuid(),
      title: "",
      content: "",
      createdAt: ts,
      updatedAt: ts,
    };

    setNotes((prev) => sortNotesDesc([note, ...prev]));
    setSelectedId(note.id);

    // Fire-and-forget API (guarded).
    api.createNote(note).catch(() => {});
    return note.id;
  }

  /**
   * PUBLIC_INTERFACE
   * Select an existing note.
   * @param {string} id
   */
  function selectNote(id) {
    setSelectedId(id);
  }

  /**
   * PUBLIC_INTERFACE
   * Update title/content for the selected note (autosave behavior).
   * @param {string} id
   * @param {{title?: string, content?: string}} patch
   */
  function updateNote(id, patch) {
    const ts = now();
    setNotes((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: ts } : n));
      return sortNotesDesc(next);
    });

    api.updateNote(id, { ...patch, updatedAt: ts }).catch(() => {});
  }

  /**
   * PUBLIC_INTERFACE
   * Delete a note by id.
   * @param {string} id
   * @returns {void}
   */
  function deleteNote(id) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    api.deleteNote(id).catch(() => {});
  }

  return {
    notes,
    selectedId,
    selectedNote,
    createNote,
    selectNote,
    updateNote,
    deleteNote,
  };
}
