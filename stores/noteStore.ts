import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface NoteItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface Note {
  id: string;
  title: string;
  items: NoteItem[];
  mode: "list" | "text";
  textContent: string;
  createdAt: number;
  updatedAt: number;
}

export type ThemeMode = "light" | "dark" | "system";

interface NoteState {
  notes: Note[];
  activeNoteId: string | null;
  isPremium: boolean;
  drawerPeekHeight: number;
  themeMode: ThemeMode;
  hapticsEnabled: boolean;
  shakeToClearEnabled: boolean;
  hasSeenOnboarding: boolean;

  // Actions
  createNote: () => string;
  deleteNote: (id: string) => void;
  setActiveNote: (id: string) => void;
  updateNoteTitle: (id: string, title: string) => void;
  setNoteMode: (id: string, mode: "list" | "text") => void;
  updateTextContent: (id: string, content: string) => void;
  addItem: (noteId: string, text: string) => void;
  updateItem: (noteId: string, itemId: string, text: string) => void;
  toggleItem: (noteId: string, itemId: string) => void;
  deleteItem: (noteId: string, itemId: string) => void;
  reorderItems: (noteId: string, fromIndex: number, toIndex: number) => void;
  clearCheckedItems: (noteId: string) => void;
  setDrawerPeekHeight: (height: number) => void;
  setPremium: (isPremium: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  setShakeToClearEnabled: (enabled: boolean) => void;
  setHasSeenOnboarding: (seen: boolean) => void;
  resetAllData: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useNoteStore = create<NoteState>()(
  persist(
    (set, get) => ({
      notes: [],
      activeNoteId: null,
      isPremium: false,
      drawerPeekHeight: 80,
      themeMode: "system" as ThemeMode,
      hapticsEnabled: true,
      shakeToClearEnabled: true,
      hasSeenOnboarding: false,

      createNote: () => {
        const { notes, isPremium } = get();

        // Free users can only have 1 note
        if (!isPremium && notes.length >= 1) {
          return notes[0].id;
        }

        const newNote: Note = {
          id: generateId(),
          title: "",
          items: [],
          mode: "list",
          textContent: "",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({
          notes: [...state.notes, newNote],
          activeNoteId: newNote.id,
        }));

        return newNote.id;
      },

      deleteNote: (id) => {
        set((state) => {
          const newNotes = state.notes.filter((n) => n.id !== id);
          return {
            notes: newNotes,
            activeNoteId:
              state.activeNoteId === id
                ? newNotes[0]?.id || null
                : state.activeNoteId,
          };
        });
      },

      setActiveNote: (id) => {
        set({ activeNoteId: id });
      },

      updateNoteTitle: (id, title) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, title, updatedAt: Date.now() } : n,
          ),
        }));
      },

      setNoteMode: (id, mode) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, mode, updatedAt: Date.now() } : n,
          ),
        }));
      },

      updateTextContent: (id, content) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id
              ? { ...n, textContent: content, updatedAt: Date.now() }
              : n,
          ),
        }));
      },

      addItem: (noteId, text) => {
        const newItem: NoteItem = {
          id: generateId(),
          text,
          checked: false,
        };

        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === noteId
              ? { ...n, items: [...n.items, newItem], updatedAt: Date.now() }
              : n,
          ),
        }));
      },

      updateItem: (noteId, itemId, text) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === noteId
              ? {
                  ...n,
                  items: n.items.map((item) =>
                    item.id === itemId ? { ...item, text } : item,
                  ),
                  updatedAt: Date.now(),
                }
              : n,
          ),
        }));
      },

      toggleItem: (noteId, itemId) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === noteId
              ? {
                  ...n,
                  items: n.items.map((item) =>
                    item.id === itemId
                      ? { ...item, checked: !item.checked }
                      : item,
                  ),
                  updatedAt: Date.now(),
                }
              : n,
          ),
        }));
      },

      deleteItem: (noteId, itemId) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === noteId
              ? {
                  ...n,
                  items: n.items.filter((item) => item.id !== itemId),
                  updatedAt: Date.now(),
                }
              : n,
          ),
        }));
      },

      reorderItems: (noteId, fromIndex, toIndex) => {
        set((state) => ({
          notes: state.notes.map((n) => {
            if (n.id !== noteId) return n;

            const items = [...n.items];
            const [removed] = items.splice(fromIndex, 1);
            items.splice(toIndex, 0, removed);

            return { ...n, items, updatedAt: Date.now() };
          }),
        }));
      },

      clearCheckedItems: (noteId) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === noteId
              ? {
                  ...n,
                  items: n.items.filter((item) => !item.checked),
                  updatedAt: Date.now(),
                }
              : n,
          ),
        }));
      },

      setDrawerPeekHeight: (height) => {
        set({ drawerPeekHeight: height });
      },

      setPremium: (isPremium) => {
        set({ isPremium });
      },

      setThemeMode: (mode) => {
        set({ themeMode: mode });
      },

      setHapticsEnabled: (enabled) => {
        set({ hapticsEnabled: enabled });
      },

      setShakeToClearEnabled: (enabled) => {
        set({ shakeToClearEnabled: enabled });
      },

      setHasSeenOnboarding: (seen) => {
        set({ hasSeenOnboarding: seen });
      },

      resetAllData: () => {
        set({
          notes: [],
          activeNoteId: null,
          isPremium: false,
          drawerPeekHeight: 80,
          themeMode: "system",
          hapticsEnabled: true,
          shakeToClearEnabled: true,
          hasSeenOnboarding: false,
        });
      },
    }),
    {
      name: "notted-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
