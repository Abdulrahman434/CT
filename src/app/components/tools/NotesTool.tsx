import { useState, useCallback } from "react";
import { useTheme, TYPE_SCALE, WEIGHT, SHADOW } from "../ThemeContext";
import { useLocale } from "../i18n";
import { ArrowLeft, Plus, Trash2, FileText } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  timestamp: string;
}

export function NotesTool({ onClose, onBackToTools }: { onClose: () => void; onBackToTools: () => void }) {
  const { theme } = useTheme();
  const { fontFamily } = useLocale();
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Medication Schedule",
      content: "Take morning pills at 8 AM\nEvening pills at 6 PM",
      timestamp: "Today at 9:30 AM",
    },
  ]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingContent, setEditingContent] = useState("");

  const handleCreateNote = useCallback(() => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "New Note",
      content: "",
      timestamp: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    setEditingTitle(newNote.title);
    setEditingContent(newNote.content);
  }, [notes]);

  const handleSelectNote = useCallback((note: Note) => {
    setSelectedNote(note);
    setEditingTitle(note.title);
    setEditingContent(note.content);
  }, []);

  const handleSaveNote = useCallback(() => {
    if (!selectedNote) return;
    
    setNotes(
      notes.map((note) =>
        note.id === selectedNote.id
          ? {
              ...note,
              title: editingTitle,
              content: editingContent,
              timestamp: new Date().toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              }),
            }
          : note
      )
    );
  }, [selectedNote, notes, editingTitle, editingContent]);

  const handleDeleteNote = useCallback(
    (noteId: string) => {
      setNotes(notes.filter((note) => note.id !== noteId));
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
        setEditingTitle("");
        setEditingContent("");
      }
    },
    [notes, selectedNote]
  );

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col"
      style={{
        backgroundColor: theme.background,
      }}
    >
      {/* Header */}
      <div
        className="shrink-0 flex items-center justify-between px-8"
        style={{
          height: "88px",
          backgroundColor: theme.surface,
          borderBottom: theme.cardBorder,
          boxShadow: SHADOW.lg,
        }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToTools}
            className="flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
            style={{
              width: "56px",
              height: "56px",
              backgroundColor: theme.surfaceElevated,
              borderRadius: theme.radiusMd,
              border: "none",
              outline: "none",
            }}
          >
            <ArrowLeft size={24} color={theme.textHeading} />
          </button>
          <h1
            style={{
              fontFamily: fontFamily,
              fontSize: TYPE_SCALE.xl,
              fontWeight: WEIGHT.bold,
              color: theme.textHeading,
            }}
          >
            Notes
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleCreateNote}
            className="flex items-center gap-2 px-6 py-3 cursor-pointer active:scale-95 transition-transform"
            style={{
              backgroundColor: theme.primary,
              borderRadius: theme.radiusMd,
              border: "none",
              outline: "none",
            }}
          >
            <Plus size={20} color={theme.textInverse} />
            <span
              style={{
                fontFamily: fontFamily,
                fontSize: TYPE_SCALE.base,
                fontWeight: WEIGHT.semibold,
                color: theme.textInverse,
              }}
            >
              New Note
            </span>
          </button>
          <button
            onClick={onClose}
            className="flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
            style={{
              width: "56px",
              height: "56px",
              backgroundColor: theme.surfaceElevated,
              borderRadius: theme.radiusMd,
              border: "none",
              outline: "none",
            }}
          >
            <span style={{ fontSize: "24px", color: theme.textHeading }}>×</span>
          </button>
        </div>
      </div>

      {/* Notes Content */}
      <div className="flex-1 flex gap-6 px-8 py-6 overflow-hidden">
        {/* Notes List */}
        <div
          className="flex flex-col gap-3 overflow-y-auto"
          style={{
            width: "400px",
            padding: "8px",
          }}
        >
          {notes.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16"
              style={{
                backgroundColor: theme.surface,
                borderRadius: theme.radiusCard,
                border: theme.cardBorder,
              }}
            >
              <FileText size={48} color={theme.textMuted} strokeWidth={1.5} />
              <p
                className="mt-4"
                style={{
                  fontFamily: fontFamily,
                  fontSize: TYPE_SCALE.base,
                  color: theme.textMuted,
                }}
              >
                No notes yet
              </p>
            </div>
          ) : (
            notes.map((note) => (
              <button
                key={note.id}
                onClick={() => handleSelectNote(note)}
                className="cursor-pointer text-left transition-all"
                style={{
                  padding: "20px",
                  backgroundColor: selectedNote?.id === note.id ? theme.primarySubtle : theme.surface,
                  borderRadius: theme.radiusMd,
                  border: selectedNote?.id === note.id ? `2px solid ${theme.primary}` : theme.cardBorder,
                  boxShadow: SHADOW.sm,
                  outline: "none",
                }}
              >
                <h3
                  style={{
                    fontFamily: fontFamily,
                    fontSize: TYPE_SCALE.md,
                    fontWeight: WEIGHT.bold,
                    color: theme.textHeading,
                    marginBottom: "4px",
                  }}
                >
                  {note.title}
                </h3>
                <p
                  style={{
                    fontFamily: fontFamily,
                    fontSize: TYPE_SCALE.sm,
                    color: theme.textMuted,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    marginBottom: "8px",
                  }}
                >
                  {note.content || "No content"}
                </p>
                <p
                  style={{
                    fontFamily: fontFamily,
                    fontSize: TYPE_SCALE.xs,
                    color: theme.textMuted,
                  }}
                >
                  {note.timestamp}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Note Editor */}
        <div className="flex-1 flex flex-col gap-4">
          {selectedNote ? (
            <div
              className="flex-1 flex flex-col"
              style={{
                backgroundColor: theme.surface,
                borderRadius: theme.radiusCard,
                border: theme.cardBorder,
                boxShadow: SHADOW.md,
                padding: "32px",
              }}
            >
              {/* Title Input */}
              <input
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={handleSaveNote}
                placeholder="Note title"
                className="mb-4"
                style={{
                  fontFamily: fontFamily,
                  fontSize: TYPE_SCALE.xl,
                  fontWeight: WEIGHT.bold,
                  color: theme.textHeading,
                  backgroundColor: "transparent",
                  border: "none",
                  outline: "none",
                  padding: "0",
                }}
              />

              {/* Content Textarea */}
              <textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                onBlur={handleSaveNote}
                placeholder="Start typing..."
                className="flex-1 resize-none"
                style={{
                  fontFamily: fontFamily,
                  fontSize: TYPE_SCALE.base,
                  color: theme.textBody,
                  backgroundColor: "transparent",
                  border: "none",
                  outline: "none",
                  lineHeight: 1.6,
                }}
              />

              {/* Delete Button */}
              <button
                onClick={() => handleDeleteNote(selectedNote.id)}
                className="self-end flex items-center gap-2 px-6 py-3 cursor-pointer active:scale-95 transition-transform"
                style={{
                  backgroundColor: "#D10044",
                  borderRadius: theme.radiusMd,
                  border: "none",
                  outline: "none",
                }}
              >
                <Trash2 size={18} color="#fff" />
                <span
                  style={{
                    fontFamily: fontFamily,
                    fontSize: TYPE_SCALE.base,
                    fontWeight: WEIGHT.semibold,
                    color: "#fff",
                  }}
                >
                  Delete Note
                </span>
              </button>
            </div>
          ) : (
            <div
              className="flex-1 flex flex-col items-center justify-center"
              style={{
                backgroundColor: theme.surface,
                borderRadius: theme.radiusCard,
                border: theme.cardBorder,
              }}
            >
              <FileText size={64} color={theme.textMuted} strokeWidth={1.5} />
              <p
                className="mt-4"
                style={{
                  fontFamily: fontFamily,
                  fontSize: TYPE_SCALE.md,
                  color: theme.textMuted,
                }}
              >
                Select a note to view or edit
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
