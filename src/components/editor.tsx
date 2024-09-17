"use client";
import { memo, useCallback, useEffect, useRef, useState } from "react";

import { AutoLinkNode } from "@lexical/link";
import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
// import { CharacterLimitPlugin } from "@lexical/react/LexicalCharacterLimitPlugin";
// import { OverflowNode } from "@lexical/overflow";

import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  type EditorState,
} from "lexical";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";

import { PLACEHOLDER, URL_REGEX } from "@/lib/constants";
import { getCharCount } from "@/lib/getCharCount";
import { useTweetStore } from "@/lib/store";
import {
  useDocument,
  useHandle,
  useRepo,
} from "@automerge/automerge-repo-react-hooks";
import type { LocalTweet } from "@/lib/types";

import { Doc, getHeads, view } from "@automerge/automerge/next";

const theme = {
  link: "autolink",
};

const MATCHERS = [
  (text: string) => {
    const match = URL_REGEX.exec(text);
    if (match === null) {
      return null;
    }
    const fullMatch = match[0];

    return {
      index: match.index,
      length: fullMatch.length,
      text: fullMatch,
      attributes: { rel: "theme-link" },
      url: fullMatch.startsWith("http") ? fullMatch : `https://${fullMatch}`,
    };
  },
];

function BottomBar({ selection }: { selection: string }) {
  return (
    <div className="flex flex-col gap-3 md:w-[675px] min-w-full md:min-w-1">
      <SelectionCount selection={selection} />
    </div>
  );
}

function RestoreFromLocalStoragePlugin() {
  const [editor] = useLexicalComposerContext();
  const updateTweet = useTweetStore((state) => state.updateTweet);
  const allTweets = useTweetStore((state) => state.allTweets);
  const createTweet = useTweetStore((state) => state.createTweet);
  const setCurrentTweetId = useTweetStore((state) => state.setCurrentTweetId);
  const currentTweetId = useTweetStore((state) => state.currentTweetId);

  const isFirstRender = useRef(true);

  const repo = useRepo();
  const document = useDocument<LocalTweet>(currentTweetId);
  const handle = useHandle<LocalTweet>(currentTweetId);

  const isReady = handle?.isReady();

  // console.log(
  //   "DOCUMENT: ",
  //   document[0],
  //   "URL: ",
  //   currentTweetId,
  //   "HANDLE: ",
  //   handle,
  // );
  // // console.log("handle isready", handle?.isReady());

  // useEffect(() => {
  //   console.log("handle isready", handle?.isReady());
  // }, [handle]);

  const currentTweet = document[0];

  useEffect(() => {
    console.log("ready check");
    handle?.whenReady().then(async () => {
      // if (isReady) {
      const doc = await handle.doc();
      const heads = getHeads(doc);
      console.log("heads: ", heads);
      console.log(doc.text);
      // console.log("views: ", view(currentTweet, heads));
      // }
    });
  }, [handle]);

  // load the tweet from local storage when changing the current tweet
  useEffect(() => {
    if (
      currentTweet &&
      !isFirstRender.current &&
      currentTweet?.text !==
        editor.getEditorState().read(() => $getRoot().getTextContent())
    ) {
      // &&
      // currentTweet?.text !== JSON.stringify(editor.getEditorState())
      editor.update(() => {
        const paragraph = $createParagraphNode();
        const textNode = $createTextNode(currentTweet.text);

        paragraph.append(textNode);
        $getRoot().clear().append(paragraph);
      });
    }
  }, [editor, currentTweet]);

  useEffect(() => {
    if (isFirstRender.current && currentTweet) {
      isFirstRender.current = false;

      // if there is a selected tweet, load it
      if (currentTweet) {
        editor.update(() => {
          const paragraph = $createParagraphNode();
          const textNode = $createTextNode(currentTweet.text);

          paragraph.append(textNode);
          $getRoot().clear().append(paragraph);
        });
      }

      // if there are no tweets, create a new one
      if (allTweets.length === 0) {
        const handle = createTweet(repo);
        setCurrentTweetId(handle);
      }
    }
  }, [allTweets, createTweet, setCurrentTweetId, editor, currentTweet, repo]);

  const onChange = useCallback(
    (editorState: EditorState) => {
      handle?.whenReady().then(async () => {
        // if (isReady) {
        // const doc = await handle.doc();
        // const heads = getHeads(document);
        // console.log("heads: ", heads);
        // console.log(doc.text);
        // console.log(currentTweetId);
        // console.log("views: ", view(currentTweet, heads));
        // }
      });

      updateTweet(
        currentTweetId,
        editorState.read(() => {
          return $getRoot().getTextContent() ?? "";
        }),
        repo,
      );
    },
    [updateTweet, currentTweetId, repo],
  );

  return <OnChangePlugin ignoreSelectionChange onChange={onChange} />;
}

function AutoFocusPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.focus();
  }, [editor]);

  return null;
}

const SelectionCount = memo(({ selection }: { selection: string }) => {
  return (
    <span className="text-gray-500 mt-3 text-md">
      {getCharCount(selection)} characters selected{" "}
    </span>
  );
});

function onError(error: Error) {
  console.error(error);
}

const initialConfig = {
  namespace: "TweetEditor",
  theme: theme,
  onError,
  nodes: [AutoLinkNode],
};

function Editor() {
  const [selection, setSelection] = useState("");

  const onSelection = useCallback((editorState: EditorState) => {
    editorState.read(() => {
      const selection = $getSelection();
      setSelection(selection?.getTextContent() ?? "");
    });
  }, []);

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="relative">
        <PlainTextPlugin
          contentEditable={
            <ContentEditable
              spellCheck={true}
              className="md:w-[60ch] mt-5 min-h-[200px] text-lg flex w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 relative"
            />
          }
          placeholder={<Placeholder />}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin onChange={onSelection} />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <AutoLinkPlugin matchers={MATCHERS} />
        <RestoreFromLocalStoragePlugin />
        <BottomBar selection={selection} />
        <ClearEditorPlugin />
        {/* <CharacterLimitPlugin maxLength={280} charset="UTF-16" /> */}
      </div>
    </LexicalComposer>
  );
}

const Placeholder = memo(() => {
  return (
    <div className="absolute top-2 left-3 text-lg text-muted-foreground select-none cursor-text">
      {PLACEHOLDER}
    </div>
  );
});

export default Editor;
