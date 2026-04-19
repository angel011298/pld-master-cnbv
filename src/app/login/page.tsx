"use client";

import { signIn } from "next-auth/react";

export default function SignIn() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: "1.5rem",
      }}
    >
      <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>
        Ingresa a Certifik PLD
      </h1>
      <button
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        style={{
          padding: "12px 32px",
          background: "#0052B4",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "1rem",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Login con Google
      </button>
    </div>
  );
}
