"use client";
import { useEffect, useState } from "react";

import { $getRoot, $getSelection, $isRangeSelection } from "lexical";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { AutoLinkNode } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";

import { PLACEHOLDER, URL_REGEX } from "@/lib/constants";
import { getCharCount } from "@/lib/getCharCount";
import { Button } from "./ui/button";
import { ClipboardCopy, Eraser } from "lucide-react";
import { loadLocalContent } from "@/lib/loadLocalState";
import { usePathname } from "next/navigation";
import { useLocalStorage } from "@uidotdev/usehooks";
import { LocalTweet, LocalTweets } from "./types";
import { formatTweetName } from "@/lib/utils";
import { useToast } from "./ui/use-toast";

const theme = {
  link: "highlight",
};

const URL_MATCHER = URL_REGEX;

const MATCHERS = [
  (text: string) => {
    const match = URL_MATCHER.exec(text);
    if (match === null) {
      return null;
    }
    const fullMatch = match[0];
    return {
      index: match.index,
      length: fullMatch.length,
      text: fullMatch,
      class: "text-blue-500",
      url: fullMatch.startsWith("http") ? fullMatch : `https://${fullMatch}`,
    };
  },
];

function AutoFocusPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.focus();
  }, [editor]);

  return null;
}

function Toolbar({ selection }: { selection: string }) {
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
    <div className="pt-2">
      <span className="text-gray-500">
        {" "}
        {getCharCount(selection)} characters selected{" "}
      </span>
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
    </div>
  );
}

function onError(error: Error) {
  console.error(error);
}

const defaultValue =
  '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';

type EditorProps = {
  setContent: React.Dispatch<React.SetStateAction<string>>;
  setCharCount: React.Dispatch<React.SetStateAction<number>>;
};

function Editor({ setContent, setCharCount }: EditorProps) {
  const [selection, setSelection] = useState("");
  const pathname = usePathname();
  const tweetId = pathname.split("/").pop() as string;
  const [content] = useLocalStorage<string>(tweetId, defaultValue);
  const [tweets, setTweets] = useLocalStorage<LocalTweets>("tweets", []);

  const initialConfig = {
    namespace: "MyEditor",
    theme,
    onError,
    nodes: [AutoLinkNode],
    editorState: content,
  };

  function onChange(editorState: any) {
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

    localStorage.setItem(`tweet-${tweetId}`, JSON.stringify(editorState));

    editorState.read(() => {
      const root = $getRoot();
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        const anchorOffset = selection.anchor.offset;
        const anchorKey = selection.anchor.key;
        const focusOffset = selection.focus.offset;
        const focusKey = selection.focus.key;
        const nodes = selection.getNodes();

        // go through each node and get the text
        // if the node is the anchor node, get the text from the anchor offset to the
        let selectedText = "";
        nodes.forEach((node: any) => {
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
        });
        console.log(selectedText);
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

      setContent(root.__cachedText ?? "");
      setCharCount(getCharCount(root.__cachedText ?? ""));
    });
  }

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
        <OnChangePlugin onChange={onChange} />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <AutoLinkPlugin matchers={MATCHERS} />
        <ClearEditorPlugin />
        <Toolbar selection={selection} />
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
