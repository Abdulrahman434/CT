import { useState, useCallback } from "react";
import { useTheme, TYPE_SCALE, WEIGHT, SHADOW } from "../ThemeContext";
import { useLocale } from "../i18n";
import { ArrowLeft, Plus, Bell, Check, Trash2, Clock } from "lucide-react";

interface Reminder {
  id: string;
  title: string;
  time: string;
  completed: boolean;
  category: "medication" | "appointment" | "general";
}

export function RemindersTool({ onClose, onBackToTools }: { onClose: () => void; onBackToTools: () => void }) {
  const { theme } = useTheme();
  const { fontFamily } = useLocale();
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: "1",
      title: "Take morning medication",
      time: "08:00 AM",
      completed: false,
      category: "medication",
    },
    {
      id: "2",
      title: "Doctor's visit",
      time: "02:30 PM",
      completed: false,
      category: "appointment",
    },
    {
      id: "3",
      title: "Call family",
      time: "05:00 PM",
      completed: false,
      category: "general",
    },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newCategory, setNewCategory] = useState<"medication" | "appointment" | "general">("general");

  const handleToggleComplete = useCallback(
    (id: string) => {
      setReminders(
        reminders.map((reminder) =>
          reminder.id === id ? { ...reminder, completed: !reminder.completed } : reminder
        )
      );
    },
    [reminders]
  );

  const handleDeleteReminder = useCallback(
    (id: string) => {
      setReminders(reminders.filter((reminder) => reminder.id !== id));
    },
    [reminders]
  );

  const handleAddReminder = useCallback(() => {
    if (!newTitle || !newTime) return;

    const newReminder: Reminder = {
      id: Date.now().toString(),
      title: newTitle,
      time: newTime,
      completed: false,
      category: newCategory,
    };

    setReminders([...reminders, newReminder]);
    setNewTitle("");
    setNewTime("");
    setNewCategory("general");
    setShowAddForm(false);
  }, [reminders, newTitle, newTime, newCategory]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "medication":
        return "#4ECDC4";
      case "appointment":
        return "#FF6B6B";
      case "general":
        return "#FFA07A";
      default:
        return theme.primary;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "medication":
        return "💊";
      case "appointment":
        return "🏥";
      case "general":
        return "📌";
      default:
        return "📌";
    }
  };

  const activeReminders = reminders.filter((r) => !r.completed);
  const completedReminders = reminders.filter((r) => r.completed);

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
            Reminders
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
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
              Add Reminder
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

      {/* Reminders Content */}
      <div className="flex-1 flex flex-col gap-6 px-16 py-8 overflow-y-auto">
        {/* Add Form */}
        {showAddForm && (
          <div
            className="p-6"
            style={{
              backgroundColor: theme.surface,
              borderRadius: theme.radiusCard,
              border: theme.cardBorder,
              boxShadow: SHADOW.md,
            }}
          >
            <h3
              className="mb-4"
              style={{
                fontFamily: fontFamily,
                fontSize: TYPE_SCALE.md,
                fontWeight: WEIGHT.bold,
                color: theme.textHeading,
              }}
            >
              New Reminder
            </h3>
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Reminder title"
                className="flex-1"
                style={{
                  fontFamily: fontFamily,
                  fontSize: TYPE_SCALE.base,
                  color: theme.textBody,
                  backgroundColor: theme.background,
                  borderRadius: theme.radiusMd,
                  border: theme.cardBorder,
                  padding: "12px 16px",
                  outline: "none",
                }}
              />
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                style={{
                  fontFamily: fontFamily,
                  fontSize: TYPE_SCALE.base,
                  color: theme.textBody,
                  backgroundColor: theme.background,
                  borderRadius: theme.radiusMd,
                  border: theme.cardBorder,
                  padding: "12px 16px",
                  outline: "none",
                }}
              />
            </div>
            <div className="flex gap-3 mb-4">
              {(["medication", "appointment", "general"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setNewCategory(cat)}
                  className="cursor-pointer transition-all"
                  style={{
                    padding: "8px 16px",
                    backgroundColor: newCategory === cat ? getCategoryColor(cat) : theme.surfaceElevated,
                    borderRadius: theme.radiusFull,
                    border: "none",
                    outline: "none",
                    fontFamily: fontFamily,
                    fontSize: TYPE_SCALE.sm,
                    fontWeight: WEIGHT.semibold,
                    color: newCategory === cat ? "#fff" : theme.textMuted,
                  }}
                >
                  {getCategoryIcon(cat)} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
            <button
              onClick={handleAddReminder}
              disabled={!newTitle || !newTime}
              className="cursor-pointer active:scale-95 transition-transform"
              style={{
                padding: "12px 24px",
                backgroundColor: theme.primary,
                borderRadius: theme.radiusMd,
                border: "none",
                outline: "none",
                fontFamily: fontFamily,
                fontSize: TYPE_SCALE.base,
                fontWeight: WEIGHT.semibold,
                color: theme.textInverse,
                opacity: !newTitle || !newTime ? 0.5 : 1,
              }}
            >
              Add Reminder
            </button>
          </div>
        )}

        {/* Active Reminders */}
        {activeReminders.length > 0 && (
          <div>
            <h2
              className="mb-4"
              style={{
                fontFamily: fontFamily,
                fontSize: TYPE_SCALE.lg,
                fontWeight: WEIGHT.bold,
                color: theme.textHeading,
              }}
            >
              Upcoming
            </h2>
            <div className="flex flex-col gap-3">
              {activeReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center gap-4 p-5"
                  style={{
                    backgroundColor: theme.surface,
                    borderRadius: theme.radiusMd,
                    border: theme.cardBorder,
                    boxShadow: SHADOW.sm,
                  }}
                >
                  <button
                    onClick={() => handleToggleComplete(reminder.id)}
                    className="cursor-pointer transition-all"
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: theme.surfaceElevated,
                      borderRadius: "50%",
                      border: `2px solid ${getCategoryColor(reminder.category)}`,
                      outline: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {reminder.completed && <Check size={24} color={getCategoryColor(reminder.category)} />}
                  </button>
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: `${getCategoryColor(reminder.category)}20`,
                      borderRadius: theme.radiusMd,
                      fontSize: "24px",
                    }}
                  >
                    {getCategoryIcon(reminder.category)}
                  </div>
                  <div className="flex-1">
                    <h3
                      style={{
                        fontFamily: fontFamily,
                        fontSize: TYPE_SCALE.md,
                        fontWeight: WEIGHT.semibold,
                        color: theme.textHeading,
                      }}
                    >
                      {reminder.title}
                    </h3>
                    <p
                      className="flex items-center gap-1 mt-1"
                      style={{
                        fontFamily: fontFamily,
                        fontSize: TYPE_SCALE.sm,
                        color: theme.textMuted,
                      }}
                    >
                      <Clock size={14} />
                      {reminder.time}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteReminder(reminder.id)}
                    className="cursor-pointer transition-all"
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "transparent",
                      border: "none",
                      outline: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Trash2 size={20} color="#D10044" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Reminders */}
        {completedReminders.length > 0 && (
          <div>
            <h2
              className="mb-4"
              style={{
                fontFamily: fontFamily,
                fontSize: TYPE_SCALE.lg,
                fontWeight: WEIGHT.bold,
                color: theme.textMuted,
              }}
            >
              Completed
            </h2>
            <div className="flex flex-col gap-3">
              {completedReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center gap-4 p-5"
                  style={{
                    backgroundColor: theme.surface,
                    borderRadius: theme.radiusMd,
                    border: theme.cardBorder,
                    boxShadow: SHADOW.sm,
                    opacity: 0.6,
                  }}
                >
                  <button
                    onClick={() => handleToggleComplete(reminder.id)}
                    className="cursor-pointer transition-all"
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: getCategoryColor(reminder.category),
                      borderRadius: "50%",
                      border: "none",
                      outline: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Check size={24} color="#fff" />
                  </button>
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: `${getCategoryColor(reminder.category)}20`,
                      borderRadius: theme.radiusMd,
                      fontSize: "24px",
                    }}
                  >
                    {getCategoryIcon(reminder.category)}
                  </div>
                  <div className="flex-1">
                    <h3
                      style={{
                        fontFamily: fontFamily,
                        fontSize: TYPE_SCALE.md,
                        fontWeight: WEIGHT.semibold,
                        color: theme.textHeading,
                        textDecoration: "line-through",
                      }}
                    >
                      {reminder.title}
                    </h3>
                    <p
                      className="flex items-center gap-1 mt-1"
                      style={{
                        fontFamily: fontFamily,
                        fontSize: TYPE_SCALE.sm,
                        color: theme.textMuted,
                      }}
                    >
                      <Clock size={14} />
                      {reminder.time}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteReminder(reminder.id)}
                    className="cursor-pointer transition-all"
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "transparent",
                      border: "none",
                      outline: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Trash2 size={20} color="#D10044" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {reminders.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-16"
            style={{
              backgroundColor: theme.surface,
              borderRadius: theme.radiusCard,
              border: theme.cardBorder,
            }}
          >
            <Bell size={64} color={theme.textMuted} strokeWidth={1.5} />
            <p
              className="mt-4"
              style={{
                fontFamily: fontFamily,
                fontSize: TYPE_SCALE.md,
                color: theme.textMuted,
              }}
            >
              No reminders yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
