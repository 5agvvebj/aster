"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, Bookmark, Check, Clock3, Feather, Stars, Trash2 } from "lucide-react";
import { z } from "zod";
import type { FormEvent } from "react";
import { LanguageSelect } from "@/lib/locale";

const timelineSchema = z.object({
  timeline: z.array(z.object({
    id: z.string().uuid(),
    type: z.enum(["saved_answer", "journal"]),
    title: z.string(),
    body: z.string(),
    createdAt: z.string(),
    status: z.enum(["completed", "insufficient_evidence"]).nullable(),
  })),
});

type TimelineEntry = z.infer<typeof timelineSchema>["timeline"][number];

export default function JourneyPage() {
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadTimeline() {
    const response = await fetch("/api/journey");
    if (!response.ok) throw new Error("Your journey could not be loaded.");
    const parsed = timelineSchema.safeParse(await response.json());
    if (!parsed.success) throw new Error("Your journey returned an unexpected response.");
    setTimeline(parsed.data.timeline);
  }

  useEffect(() => {
    let active = true;
    void fetch("/api/journey")
      .then(async (response) => {
        if (!response.ok) throw new Error("Your journey could not be loaded.");
        const parsed = timelineSchema.safeParse(await response.json());
        if (!parsed.success) throw new Error("Your journey returned an unexpected response.");
        if (active) setTimeline(parsed.data.timeline);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Your journey could not be loaded.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, []);

  async function addNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsSaving(true);
    try {
      const response = await fetch("/api/journey", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, body }),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message = z.object({ error: z.object({ message: z.string() }) }).safeParse(result);
        throw new Error(message.success ? message.data.error.message : "Your note could not be saved.");
      }
      await loadTimeline();
      setTitle("");
      setBody("");
      setNotice("Reflection saved to your journey.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Your note could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteNote(entryId: string) {
    setError("");
    setDeletingId(entryId);
    try {
      const response = await fetch(`/api/journey/${entryId}`, { method: "DELETE" });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message = z.object({ error: z.object({ message: z.string() }) }).safeParse(result);
        throw new Error(message.success ? message.data.error.message : "Your note could not be deleted.");
      }
      setTimeline((items) => items.filter((item) => item.id !== entryId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Your note could not be deleted.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="rashi-page journey-page">
      <header className="rashi-topbar">
        <Link className="rashi-back-link" href="/">
          <ArrowLeft size={15} /> Back to your space
        </Link>
        <div className="rashi-header-actions">
          <Link className="rashi-brand" href="/"><Stars size={15} /> aster</Link>
          <LanguageSelect />
        </div>
      </header>

      <section className="journey-hero">
        <div>
          <p className="rashi-kicker"><Stars size={13} /> YOUR SAVED MOMENTS, IN ONE PLACE</p>
          <h1>Cosmic Journey</h1>
          <p>
            A private timeline made from readings you chose to save and
            reflections you wrote. No predicted milestones or invented
            planetary events.
          </p>
        </div>
        <div className="journey-orbit-art" aria-hidden="true"><span>✦</span><i>✧</i></div>
      </section>

      <div className="journey-layout">
        <section className="journey-timeline" aria-labelledby="timeline-heading">
          <div className="journey-section-heading">
            <div>
              <p className="rashi-kicker">YOUR HISTORY</p>
              <h2 id="timeline-heading">The path so far</h2>
            </div>
            <span className="journey-count">{timeline.length} {timeline.length === 1 ? "moment" : "moments"}</span>
          </div>
          {error && <p className="journey-feedback journey-error" role="alert">{error}</p>}
          {notice && <p className="journey-feedback journey-success" role="status"><Check size={14} /> {notice}</p>}
          {isLoading ? (
            <p className="journey-empty" role="status">Gathering your saved moments…</p>
          ) : timeline.length === 0 ? (
            <div className="journey-empty">
              <span className="journey-empty-icon"><Clock3 size={19} /></span>
              <h3>Your journey starts with a moment.</h3>
              <p>Save an answer or write a reflection. Your timeline only includes things you chose to keep.</p>
              <Link href="/#ask">Explore a question <ArrowUpRight size={13} /></Link>
            </div>
          ) : (
            <ol className="journey-list">
              {timeline.map((entry) => (
                <li className="journey-event" key={`${entry.type}-${entry.id}`}>
                  <span className={`journey-event-marker ${entry.type === "saved_answer" ? "journey-marker-reading" : ""}`}>
                    {entry.type === "saved_answer" ? <Bookmark size={12} /> : <Feather size={12} />}
                  </span>
                  <article className="journey-event-card">
                    <div className="journey-event-meta">
                      <span>{entry.type === "saved_answer" ? "SAVED READING" : "JOURNAL REFLECTION"}</span>
                      <time dateTime={entry.createdAt}>
                        {new Date(entry.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                    </div>
                    <h3>{entry.title}</h3>
                    <p>{entry.body}</p>
                    {entry.type === "saved_answer" ? (
                      <Link className="journey-event-action" href={`/?answer=${entry.id}#history`}>
                        Return to this answer <ArrowUpRight size={13} />
                      </Link>
                    ) : (
                      <button
                        className="journey-delete"
                        type="button"
                        aria-label={`Delete ${entry.title}`}
                        disabled={deletingId === entry.id}
                        onClick={() => void deleteNote(entry.id)}
                      >
                        <Trash2 size={13} /> {deletingId === entry.id ? "Deleting…" : "Delete note"}
                      </button>
                    )}
                  </article>
                </li>
              ))}
            </ol>
          )}
        </section>

        <aside className="journey-compose">
          <p className="rashi-kicker"><Feather size={13} /> MAKE A NOTE</p>
          <h2>Leave yourself a thought.</h2>
          <p className="journey-compose-copy">
            Capture a question, something you learned, or a thought you want to revisit.
          </p>
          <form onSubmit={addNote}>
            <label htmlFor="journey-title">Title</label>
            <input
              id="journey-title"
              maxLength={100}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="A thought to return to"
              required
              value={title}
            />
            <label htmlFor="journey-body">Reflection</label>
            <textarea
              id="journey-body"
              maxLength={2000}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Write a note for your future self…"
              required
              rows={5}
              value={body}
            />
            <span className="journey-character-count">{body.length}/2000</span>
            <button type="submit" className="journey-save-button" disabled={isSaving || !title.trim() || !body.trim()}>
              {isSaving ? "Saving…" : "Save reflection"} <ArrowUpRight size={14} />
            </button>
          </form>
          <p className="journey-private-note">Stored with your private demo session. No birth or chart details are needed.</p>
        </aside>
      </div>
      <footer className="rashi-footer journey-footer">
        <span>Only saved answers and notes you create appear here.</span>
        <span>Made by Grisha Lala</span>
      </footer>
    </main>
  );
}
