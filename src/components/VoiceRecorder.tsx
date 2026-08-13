"use client";

import { useEffect } from "react";
import { useSpeechRecognition } from "@/lib/useSpeechRecognition";

export default function VoiceRecorder({
  value,
  onChange,
  onModeChange,
}: {
  value: string;
  onChange: (text: string) => void;
  onModeChange: (mode: "voice" | "typed") => void;
}) {
  const { isSupported, isListening, transcript, start, stop, reset } = useSpeechRecognition();

  // Push live transcript up as it streams in.
  useEffect(() => {
    if (isListening) {
      onChange(transcript);
      onModeChange("voice");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript, isListening]);

  return (
    <div>
      <div className="flex items-center gap-3">
        {isSupported ? (
          <button
            type="button"
            onClick={() => {
              if (isListening) {
                stop();
              } else {
                reset();
                start();
              }
            }}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isListening ? "bg-red-600 text-white" : "bg-ink text-paper hover:bg-signal"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${isListening ? "bg-white animate-pulse" : "bg-accent"}`} />
            {isListening ? "Stop recording" : "Record answer"}
          </button>
        ) : (
          <span className="text-xs text-muted italic">
            Voice input isn't supported in this browser — type your answer instead.
          </span>
        )}
      </div>

      <textarea
        className="field-input h-40 resize-none mt-3"
        placeholder="Your answer will appear here as you speak, or type it directly."
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          onModeChange("typed");
        }}
      />
    </div>
  );
}
