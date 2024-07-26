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
import { $getRoot, $getSelection, type EditorState } from "lexical";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";

import { PLACEHOLDER, URL_REGEX } from "@/lib/constants";
import { getCharCount } from "@/lib/getCharCount";
import { useTweetStore } from "@/lib/store";
import { randomName } from "@/lib/utils";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

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
  const [editor] = useLexicalComposerContext();
  const createTweet = useTweetStore((state) => state.createTweet);
  const setCurrentTweetId = useTweetStore((state) => state.setCurrentTweetId);

  const newTweet = useCallback(
    function newTweet() {
      const id = randomName();
      const tweet = {
        id: id,
        createdAt: new Date().getTime().toString(),
        content:
          '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":0}],"direction":null,"format":"","indent":0,"type":"root","version":1}}',
        text: "",
      };
      console.log("new:", tweet);
      createTweet(tweet);
      setCurrentTweetId(id);
    },
    [createTweet, setCurrentTweetId, editor],
  );

  return (
    <div className="flex flex-col gap-3 md:w-[675px] min-w-full md:min-w-1">
      <SelectionCount selection={selection} />
      <Button onClick={newTweet} variant="outline">
        <Plus className="mr-2 h-4 w-4" /> New
      </Button>
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
  const currentTweet = allTweets.find((tweet) => tweet.id === currentTweetId);
  const isFirstRender = useRef(true);

  // load the tweet from local storage when changing the current tweet
  useEffect(() => {
    if (
      currentTweet &&
      currentTweet?.content !== JSON.stringify(editor.getEditorState())
    ) {
      const content = editor.parseEditorState(currentTweet.content);
      editor.setEditorState(content);
    }
  }, [editor, currentTweet]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;

      // if there is a selected tweet, load it
      if (currentTweet) {
        const content = editor.parseEditorState(
          JSON.parse(currentTweet.content),
        );
        editor.setEditorState(content);
      }

      console.log(allTweets);
      // if there are no tweets, create a new one
      if (allTweets.length === 0) {
        console.log("creating new tweet");
        const tweetId = randomName();
        createTweet({
          id: tweetId,
          createdAt: new Date().getTime().toString(),
          content: JSON.stringify(editor.getEditorState()),
          text: editor.getEditorState().read(() => {
            const root = $getRoot();
            return root.getTextContent() ?? "";
          }),
        });
        setCurrentTweetId(tweetId);
      }
    }
  }, [allTweets, createTweet, setCurrentTweetId, editor, currentTweet]);

  const onChange = useCallback(
    (editorState: EditorState) => {
      updateTweet(currentTweetId, {
        content: JSON.stringify(editorState),
        text: editorState.read(() => {
          const root = $getRoot();
          return root.getTextContent() ?? "";
        }),
      });
      console.log(currentTweet);
    },
    [updateTweet, currentTweet, currentTweetId],
  );

  return <OnChangePlugin onChange={onChange} />;
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
    <span className="text-gray-500 mt-5">
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
