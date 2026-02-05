import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Note {
  id: string;
  title: string;
  content: string; // Lines starting with "- " are unchecked items, "+ " are checked
  createdAt: number;
  updatedAt: number;
}

export interface Template {
  id: string;
  title: string;
  content: string;
  isBuiltIn: boolean; // true = pre-made, false = user-created
  createdAt: number;
}

// Built-in template IDs
export const BUILT_IN_TEMPLATE_IDS = {
  SHOPPING_LIST: "builtin-shopping",
  WEEKLY_TASKS: "builtin-weekly",
  MEETING_NOTES: "builtin-meeting",
  PACKING_LIST: "builtin-packing",
  PROJECT_CHECKLIST: "builtin-project",
} as const;

export type ThemeMode = "light" | "dark" | "system";
export type LanguageCode = "en" | "es" | "sv" | "de";

interface NoteState {
  notes: Note[];
  templates: Template[]; // User-created templates
  activeNoteId: string | null;
  isPremium: boolean;
  purchaseEmail: string | null;
  drawerPeekHeight: number;
  themeMode: ThemeMode;
  language: LanguageCode | null;
  hapticsEnabled: boolean;
  shakeToClearEnabled: boolean;
  hasSeenOnboarding: boolean;

  // Note Actions
  createNote: () => string;
  createNoteFromTemplate: (templateId: string, builtInContent?: { title: string; content: string }) => string;
  deleteNote: (id: string) => void;
  setActiveNote: (id: string) => void;
  updateNoteTitle: (id: string, title: string) => void;
  updateContent: (id: string, content: string) => void;
  toggleLine: (noteId: string, lineIndex: number) => void;
  clearCheckedItems: (noteId: string) => void;

  // Template Actions
  saveAsTemplate: (noteId: string) => void;
  deleteTemplate: (id: string) => void;

  // Settings Actions
  setDrawerPeekHeight: (height: number) => void;
  setPremium: (isPremium: boolean, email?: string) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (lang: LanguageCode | null) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  setShakeToClearEnabled: (enabled: boolean) => void;
  setHasSeenOnboarding: (seen: boolean) => void;
  resetAllData: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

// Helper to check if a line is a checklist item
export const isChecklistItem = (line: string): boolean => {
  return line.startsWith("- ") || line.startsWith("+ ");
};

export const isCheckedItem = (line: string): boolean => {
  return line.startsWith("+ ");
};

export const getItemText = (line: string): string => {
  if (line.startsWith("- ") || line.startsWith("+ ")) {
    return line.substring(2);
  }
  return line;
};

export const useNoteStore = create<NoteState>()(
  persist(
    (set, get) => ({
      notes: [],
      templates: [],
      activeNoteId: null,
      isPremium: false,
      purchaseEmail: null,
      drawerPeekHeight: 80,
      themeMode: "system" as ThemeMode,
      language: null,
      hapticsEnabled: true,
      shakeToClearEnabled: true,
      hasSeenOnboarding: false,

      createNote: () => {
        const { notes, isPremium } = get();

        if (!isPremium && notes.length >= 1) {
          return notes[0].id;
        }

        const newNote: Note = {
          id: generateId(),
          title: "",
          content: "",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({
          notes: [...state.notes, newNote],
          activeNoteId: newNote.id,
        }));

        return newNote.id;
      },

      createNoteFromTemplate: (templateId: string, builtInContent?: { title: string; content: string }) => {
        const { notes, templates, isPremium } = get();

        if (!isPremium && notes.length >= 1) {
          return notes[0].id;
        }

        // Find template content
        let title = "";
        let content = "";

        if (builtInContent) {
          // Built-in template - content passed directly
          title = builtInContent.title;
          content = builtInContent.content;
        } else {
          // User template - find in templates array
          const template = templates.find((t) => t.id === templateId);
          if (template) {
            title = template.title;
            content = template.content;
          }
        }

        const newNote: Note = {
          id: generateId(),
          title,
          content,
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

      updateContent: (id, content) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, content, updatedAt: Date.now() } : n,
          ),
        }));
      },

      toggleLine: (noteId, lineIndex) => {
        set((state) => ({
          notes: state.notes.map((n) => {
            if (n.id !== noteId) return n;
            
            const lines = n.content.split("\n");
            const line = lines[lineIndex];
            
            if (line.startsWith("- ")) {
              lines[lineIndex] = "+ " + line.substring(2);
            } else if (line.startsWith("+ ")) {
              lines[lineIndex] = "- " + line.substring(2);
            }
            
            return { ...n, content: lines.join("\n"), updatedAt: Date.now() };
          }),
        }));
      },

      clearCheckedItems: (noteId) => {
        set((state) => ({
          notes: state.notes.map((n) => {
            if (n.id !== noteId) return n;
            
            const lines = n.content.split("\n");
            const filteredLines = lines.filter((line) => !line.startsWith("+ "));
            
            return { ...n, content: filteredLines.join("\n"), updatedAt: Date.now() };
          }),
        }));
      },

      saveAsTemplate: (noteId) => {
        const { notes } = get();
        const note = notes.find((n) => n.id === noteId);
        
        if (!note) return;

        // Reset all checklist items to unchecked for the template
        const resetContent = note.content
          .split("\n")
          .map((line) => (line.startsWith("+ ") ? "- " + line.substring(2) : line))
          .join("\n");

        const newTemplate: Template = {
          id: generateId(),
          title: note.title || "Untitled Template",
          content: resetContent,
          isBuiltIn: false,
          createdAt: Date.now(),
        };

        set((state) => ({
          templates: [...state.templates, newTemplate],
        }));
      },

      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }));
      },

      setDrawerPeekHeight: (height) => {
        set({ drawerPeekHeight: height });
      },

      setPremium: (isPremium, email) => {
        set({ isPremium, ...(email && { purchaseEmail: email }) });
      },

      setThemeMode: (mode) => {
        set({ themeMode: mode });
      },

      setLanguage: (lang) => {
        set({ language: lang });
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
          templates: [],
          activeNoteId: null,
          isPremium: false,
          purchaseEmail: null,
          drawerPeekHeight: 80,
          themeMode: "system",
          language: null,
          hapticsEnabled: true,
          shakeToClearEnabled: true,
          hasSeenOnboarding: false,
        });
      },
    }),
    {
      name: "notted-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Migration from old format to new format
      migrate: (persistedState: any, _version: number) => {
        // Ensure templates array exists
        if (persistedState && !persistedState.templates) {
          persistedState.templates = [];
        }

        if (persistedState && persistedState.notes) {
          persistedState.notes = persistedState.notes.map((note: any) => {
            // If note has old format (items array), convert to new format
            if (note.items && Array.isArray(note.items)) {
              const itemLines = note.items.map((item: any) => 
                (item.checked ? "+ " : "- ") + item.text
              ).join("\n");
              
              const textContent = note.textContent || "";
              
              // Combine: text content first, then items
              let content = "";
              if (textContent.trim()) {
                content = textContent;
                if (itemLines) {
                  content += "\n" + itemLines;
                }
              } else {
                content = itemLines;
              }
              
              return {
                id: note.id,
                title: note.title,
                content,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt,
              };
            }
            return note;
          });
        }
        return persistedState;
      },
      version: 1,
    },
  ),
);
