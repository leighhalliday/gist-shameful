// import { useState, useEffect, FormEvent } from "react";
// import SyntaxHighlighter from "react-syntax-highlighter";
// import { atomOneDark as style } from "react-syntax-highlighter/dist/cjs/styles/hljs";
// import { firebase } from "src/initFirebase";
import FirebaseAuth from "src/firebaseAuth";
import { useAuth } from "src/authProvider";

export default function Home() {
  const { user, loading, logout } = useAuth();

  if (loading) return null;
  if (!user) return <FirebaseAuth />;

  return (
    <main>
      <button type="button" onClick={logout} className="link">
        Logout
      </button>
    </main>
  );
}
