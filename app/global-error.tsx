"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>Something went wrong | Elaris</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        style={{
          margin: 0,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          backgroundColor: "#09090b",
          color: "#fafafa",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: "32rem",
            width: "100%",
            backgroundColor: "#18181b",
            border: "1px solid #27272a",
            borderRadius: "0.75rem",
            padding: "2rem",
            textAlign: "center",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div
            style={{
              width: "3.5rem",
              height: "3.5rem",
              margin: "0 auto 1.25rem",
              borderRadius: "50%",
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              color: "#ef4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.75rem",
              fontWeight: 700,
            }}
          >
            !
          </div>

          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              margin: "0 0 0.5rem 0",
              color: "#ffffff",
            }}
          >
            Something went wrong
          </h1>

          <p
            style={{
              fontSize: "0.9375rem",
              color: "#a1a1aa",
              lineHeight: 1.6,
              margin: "0 0 1.5rem 0",
            }}
          >
            An unexpected error occurred. Our team has been automatically notified and is looking into the issue.
          </p>

          {error.digest && (
            <div
              style={{
                fontSize: "0.75rem",
                color: "#71717a",
                backgroundColor: "#09090b",
                padding: "0.5rem 0.75rem",
                borderRadius: "0.375rem",
                marginBottom: "1.5rem",
                wordBreak: "break-all",
                fontFamily: "monospace",
              }}
            >
              Error ID: {error.digest}
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => reset()}
              type="button"
              style={{
                backgroundColor: "#ffffff",
                color: "#09090b",
                fontWeight: 600,
                fontSize: "0.875rem",
                padding: "0.625rem 1.25rem",
                borderRadius: "0.5rem",
                border: "none",
                cursor: "pointer",
                transition: "opacity 0.15s ease",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                backgroundColor: "transparent",
                color: "#e4e4e7",
                border: "1px solid #3f3f46",
                fontWeight: 500,
                fontSize: "0.875rem",
                padding: "0.625rem 1.25rem",
                borderRadius: "0.5rem",
                textDecoration: "none",
                display: "inline-block",
                transition: "background-color 0.15s ease",
              }}
            >
              Back to Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
