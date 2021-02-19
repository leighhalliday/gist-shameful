import { useState, useEffect, FormEvent } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark as style } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import { firebase } from "src/initFirebase";
import FirebaseAuth from "src/firebaseAuth";
import { useAuth } from "src/authProvider";

const db = firebase.database();

export default function Home() {
  const { user, loading, logout } = useAuth();

  if (loading) return null;
  if (!user) return <FirebaseAuth />;

  return (
    <main>
      <button type="button" onClick={logout} className="link">
        Logout
      </button>
      <AddGist uid={user.uid} />
      <Gists uid={user.uid} />
    </main>
  );
}

interface IGist {
  uid: string;
  file: string;
  code: string;
}

const langs: Record<string, string> = {
  js: "javascript",
  rb: "ruby",
};

function getLanguage(file: string): string {
  const parts = file.split(".");
  const ext = parts[parts.length - 1];
  return langs[ext] || "text";
}

function Gists({ uid }: { uid: string }) {
  const [gists, setGists] = useState<Record<string, IGist>>({});
  const [editing, setEditing] = useState("");

  useEffect(() => {
    const userGistsRef = db.ref(`userGists/${uid}`);
    const refs = [userGistsRef];

    userGistsRef.on("child_added", (child) => {
      const key: string = child.key as string;
      const gistRef = db.ref(`gists/${key}`);
      refs.push(gistRef);
      gistRef.on("value", (snap) => {
        setGists((old) => {
          return { ...old, [key]: snap.val() };
        });
      });
    });

    return () => {
      refs.forEach((ref) => ref.off());
    };
  }, []);

  return (
    <ul>
      {Object.entries(gists).map(([id, gist]) => (
        <li key={id}>
          {id === editing ? (
            <EditGist id={id} gist={gist} close={() => setEditing("")} />
          ) : (
            <>
              <h3>{gist.file}</h3>

              <SyntaxHighlighter
                style={style}
                language={getLanguage(gist.file)}
              >
                {gist.code}
              </SyntaxHighlighter>

              <button type="button" onClick={() => setEditing(id)}>
                Edit
              </button>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

function AddGist({ uid }: { uid: string }) {
  const [file, setFile] = useState("");
  const [code, setCode] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const gistRef = db.ref("gists").push();
    await db.ref(`userGists/${uid}/${gistRef.key}`).set(true);
    await gistRef.set({
      uid,
      file,
      code,
    });

    setFile("");
    setCode("");
  };

  return (
    <form onSubmit={onSubmit}>
      <h2>Add Gist</h2>

      <input
        required
        type="text"
        value={file}
        onChange={(e) => setFile(e.target.value)}
        placeholder="file.js"
      />

      <textarea
        required
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <button type="submit">Save</button>
    </form>
  );
}

function EditGist({
  id,
  gist,
  close,
}: {
  id: string;
  gist: IGist;
  close: () => void;
}) {
  const [file, setFile] = useState(gist.file);
  const [code, setCode] = useState(gist.code);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const gistRef = db.ref(`gists/${id}`);
    gistRef.child("file").set(file);
    gistRef.child("code").set(code);

    close();
  };

  return (
    <form onSubmit={onSubmit}>
      <input
        required
        type="text"
        value={file}
        onChange={(e) => setFile(e.target.value)}
        placeholder="file.js"
      />

      <textarea
        required
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <button type="submit">Save</button>
    </form>
  );
}
