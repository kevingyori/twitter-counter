"use client";
import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ClipboardCopy, Eraser } from "lucide-react";
import { getCharCount } from "@/lib/getCharCount";
import { PLACEHOLDER } from "@/lib/constants";
import Editor from "./editor";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { CLEAR_EDITOR_COMMAND } from "lexical";

const CharCounter = () => {
  const [charCount, setCharCount] = useState(0);
  const [over280, setOver280] = useState(false);
  const [over4000, setOver4000] = useState(false);
  const [content, setContent] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState("");

  useEffect(() => {
    // console.log(selection);
  }, [selection]);

  useEffect(() => {
    if (charCount > 280) {
      setOver280(true);
    } else {
      setOver280(false);
    }
    if (charCount > 4000) {
      setOver4000(true);
    } else {
      setOver4000(false);
    }
  }, [charCount]);

  const handleClear = () => {
    setCharCount(0);
    setContent("");
    if (ref.current) {
      ref.current.innerText = PLACEHOLDER;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="flex-col"
      onKeyUp={() => {
        setSelection(window?.getSelection()?.toString() ?? "");
      }}
    >
      <div className="flex gap-6 select-none">
        <Card
          className={cn(
            "flex-auto",
            over280 ? "border-red-400 shadow-red-400" : ""
          )}
        >
          <CardHeader className="text-center">
            <CardTitle>𝕏</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-4xl">{charCount}/280</div>
          </CardContent>
        </Card>
        <Card
          className={cn(
            "flex-auto",
            over4000 ? "border-red-400 shadow-red-400" : ""
          )}
        >
          <CardHeader className="text-center">
            <CardTitle>𝕏 Premium</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-4xl">{charCount}/4000</div>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col gap-2">
        {/* <InputField inputRef={ref} content={content} setContent={setContent} setCharCount={setCharCount} setSelection={setSelection} /> */}
        <Editor setContent={setContent} setCharCount={setCharCount} />
      </div>
    </div >
  );
};

export default CharCounter;
