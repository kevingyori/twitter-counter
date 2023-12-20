import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  CLEAR_EDITOR_COMMAND,
} from "lexical";
import { useEffect, useRef, useState } from "react";

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

// Lexical React plugins are React components, which makes them
// highly composable. Furthermore, you can lazy load plugins if
// desired, so you don't pay the cost for plugins until you
// actually use them.
function MyCustomAutoFocusPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Focus the editor when the effect fires!
    editor.focus();
  }, [editor]);

  return null;
}

function Toolbar({ selection }: { selection: string }) {
  const [editor] = useLexicalComposerContext();

  const handleClear = () => {
    editor.update(() => {
      $getRoot().clear();
    });
  };

  const handleCopy = () => {
    editor.update(() => {
      const root = $getRoot();
      const text = root.__cachedText ?? "";
      navigator.clipboard.writeText(text);
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

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: Error) {
  console.error(error);
}
// <Editor content={content} setContent={setContent} setCharCount={setCharCount} setSelection={setSelection} />

type EditorProps = {
  setContent: React.Dispatch<React.SetStateAction<string>>;
  setCharCount: React.Dispatch<React.SetStateAction<number>>;
};

function Editor({ setContent, setCharCount }: EditorProps) {
  const [selection, setSelection] = useState("");
  // const [initialConfig, setInitialConfig] = useState({
  const pathname = usePathname();
  const initialConfig = {
    namespace: "MyEditor",
    theme,
    onError,
    nodes: [AutoLinkNode],
    editorState: loadLocalContent(pathname),
  };
  // const editorStateRef = useRef();

  // useEffect(() => {
  //   async () => {
  //     const initialEditorState = await loadLocalContent(pathname);
  //     setInitialConfig((config) => ({
  //       ...config,
  //       editorState: initialEditorState,
  //     }));
  //   };
  // }, [pathname]);

  // When the editor changes, you can get notified via the
  // LexicalOnChangePlugin!
  function onChange(editorState: any) {
    // editorStateRef.current = editorState
    localStorage.setItem(pathname, JSON.stringify(editorState));
    // pathname after last slash
    console.log("onChange", editorState, pathname.split("/").pop());
    editorState.read(() => {
      // Read the contents of the EditorState here.
      const root = $getRoot();
      const selection = $getSelection();
      console.log(editorState);

      // console.log(
      //   root,
      //   selection
      // );

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
          console.log(node);

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
        <MyCustomAutoFocusPlugin />
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
