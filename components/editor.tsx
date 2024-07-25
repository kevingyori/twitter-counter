"use client";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AutoLinkNode } from "@lexical/link";
import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  type EditorState,
} from "lexical";

import { PLACEHOLDER, URL_REGEX } from "@/lib/constants";
import { getCharCount } from "@/lib/getCharCount";
import { loadLocalContent } from "@/lib/loadLocalState";
import { formatTweetName } from "@/lib/utils";
import { useLocalStorage } from "@uidotdev/usehooks";
import { ClipboardCopy, Eraser } from "lucide-react";
import { usePathname } from "next/navigation";
import type { LocalTweet, LocalTweets } from "./types";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

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

function RestoreFromLocalStoragePlugin() {
  const [editor] = useLexicalComposerContext();
  const pathname = usePathname();
  const tweetId = pathname.split("/").pop() as string;
  const [serializedEditorState, setSerializedEditorState] = useLocalStorage<
    string | null
  >(tweetId, null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;

      if (serializedEditorState) {
        const initialEditorState = editor.parseEditorState(
          serializedEditorState ?? "",
        );
        // TODO: error here wtf
        editor.setEditorState(initialEditorState);
      }
    }
  }, [serializedEditorState, editor]);

  const onChange = useCallback(
    (editorState: EditorState) => {
      setSerializedEditorState(JSON.stringify(editorState.toJSON()));
    },
    [setSerializedEditorState],
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

const CharCount = memo(({ selection }: { selection: string }) => {
  return (
    <span className="text-gray-500">
      {" "}
      {getCharCount(selection)} characters selected{" "}
    </span>
  );
});

const Toolbar = memo(() => {
  const [editor] = useLexicalComposerContext();
  const { toast } = useToast();

  const handleClear = () => {
    editor.update(() => {
      $getRoot().clear();

      toast({
        description: "The tweet has been cleared.",
        variant: "destructive",
      });
    });
  };

  const handleCopy = () => {
    editor.update(() => {
      const root = $getRoot();
      const text = root.__cachedText ?? "";
      navigator.clipboard.writeText(text);

      toast({
        description: "The tweet has been copied to your clipboard.",
      });
    });
  };

  return (
    <>
      <div className="flex flex-col md:flex-row mt-5 gap-5">
        <Button
          className="flex-auto"
          variant="destructive"
          onClick={handleClear}
        >
          <Eraser className="mr-2 h-4 w-4" />
          Clear
        </Button>
        <Button className="flex-auto" variant="default" onClick={handleCopy}>
          <ClipboardCopy className="mr-2 h-4 w-4" />
          Copy
        </Button>
      </div>
    </>
  );
});

function onError(error: Error) {
  console.error(error);
}

function Editor({ setCharCount }: { setCharCount: React.Dispatch<number> }) {
  const [selection, setSelection] = useState("");
  const pathname = usePathname();
  const tweetId = pathname.split("/").pop() as string;
  const [tweets, setTweets] = useLocalStorage<LocalTweets>("tweets", []);
  const [_, setSerializedEditorState] = useLocalStorage<string | null>(
    tweetId,
    null,
  );

  const initialConfig = {
    namespace: "MyEditor",
    theme: theme,
    onError,
    nodes: [AutoLinkNode],
    // editorState: content,
  };

  // function truncate(str: string, n: number) {
  //   // return str.length > n ? `${str.substr(0, n - 1)}...` : str;
  //   return str.length > n ? `${str.slice(0, n)}...` : str;
  // }

  const onSelection = useCallback(function onSelection(
    editorState: EditorState,
  ) {
    editorState.read(() => {
      const selection = $getSelection();

      if (
        selection !== null &&
        selection?.anchor?.offset !== selection?.focus?.offset
      ) {
        const anchorOffset = selection.anchor.offset;
        const anchorKey = selection.anchor.key;
        const focusOffset = selection.focus.offset;
        const focusKey = selection.focus.key;
        const nodes = selection.getNodes();

        // go through each node and get the text
        // if the node is the anchor node, get the text from the anchor offset to the
        let selectedText = "";
        for (const node of nodes) {
          // console.log(node);

          if (anchorKey === focusKey) {
            if (
              node.__key === anchorKey &&
              node.__type === "text" &&
              anchorOffset > focusOffset
            ) {
              // console.log('anchor:', node.__text);
              selectedText += node.__text.slice(focusOffset, anchorOffset);
            }
            if (
              node.__key === anchorKey &&
              node.__type === "text" &&
              anchorOffset < focusOffset
            ) {
              // console.log('anchor:', node.__text);
              selectedText += node.__text.slice(anchorOffset, focusOffset);
            }
          }

          if (anchorKey < focusKey) {
            if (
              node.__key > anchorKey &&
              node.__key < focusKey &&
              node.__type === "text"
            ) {
              // console.log('between:', node);
              selectedText += node.__text;
            }

            if (node.__key === anchorKey) {
              // console.log('anchor:', node.__text);
              selectedText += node.__text.slice(anchorOffset);
            }

            if (node.__key === focusKey) {
              // console.log('focus:', node.__text);
              selectedText += node.__text.slice(0, focusOffset);
            }
          }

          if (anchorKey > focusKey) {
            if (
              node.__key < anchorKey &&
              node.__key > focusKey &&
              node.__type === "text"
            ) {
              // console.log('between:', node);
              selectedText += node.__text;
            }

            if (node.__key === anchorKey) {
              // console.log('anchor:', node.__text);
              selectedText += node.__text.slice(0, anchorOffset);
            }

            if (node.__key === focusKey) {
              // console.log('focus:', node.__text);
              selectedText += node.__text.slice(focusOffset);
            }
          }
        }
        // console.log(selectedText);
        setSelection(selectedText);

        // if (anchorOffset !== focusOffset) {
        //   const start = Math.min(anchorOffset, focusOffset);
        //   const end = Math.max(anchorOffset, focusOffset);
        //   const selectedText = root.__cachedText?.slice(start, end);
        //   setSelection(selectedText ?? '');
        // }
      } else {
        setSelection("");
      }
    });
  }, []);

  const onEdit = useCallback(
    function onEdit(editorState: EditorState) {
      localStorage.setItem(`tweet-${tweetId}`, JSON.stringify(editorState));
      setSerializedEditorState(JSON.stringify(editorState.toJSON()));

      editorState.read(() => {
        const root = $getRoot();
        const selection = $getSelection();

        // create a new tweet if one doesn't exist in the local storage
        if (tweets.filter((tweet) => tweet?.id === tweetId).length === 0) {
          setTweets((t) => [
            ...t,
            {
              id: tweetId,
              displayName: formatTweetName(tweetId),
              createdAt: Date.now().toString(),
            } as LocalTweet,
          ]);
        }

        // setContent(root.__cachedText ?? "");
        setCharCount(getCharCount(root.__cachedText ?? ""));
      });
    },
    [setCharCount, setSerializedEditorState, setTweets, tweetId, tweets],
  );

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
        <OnChangePlugin ignoreSelectionChange onChange={onEdit} />
        <OnChangePlugin ignoreHistoryMergeTagChange onChange={onSelection} />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <AutoLinkPlugin matchers={MATCHERS} />
        <ClearEditorPlugin />
        <RestoreFromLocalStoragePlugin />
        <div className="pt-2">
          <CharCount selection={selection} />
          <Toolbar />
        </div>
      </div>
    </LexicalComposer>
  );
}

function Placeholder() {
  return (
    <div className="absolute top-7 left-3 text-lg text-muted-foreground select-none cursor-text">
      {PLACEHOLDER}
    </div>
  );
}

export default Editor;
