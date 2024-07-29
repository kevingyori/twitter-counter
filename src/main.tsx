import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb";
import { Repo } from "@automerge/automerge-repo";
import { RepoContext } from "@automerge/automerge-repo-react-hooks";

const indexedDB = new IndexedDBStorageAdapter();

const repo = new Repo({
  storage: indexedDB,
  network: [],
});

// biome-ignore lint/style/noNonNullAssertion: <explanation>
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RepoContext.Provider value={repo}>
      <App />
    </RepoContext.Provider>
  </React.StrictMode>,
);
