"use client";
import { useEffect, useRef, useState } from "react";
import { Textarea } from "./ui/textarea";
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

const CharCounter = () => {
  const [charCount, setCharCount] = useState(0);
  const [over280, setOver280] = useState(false);
  const [over4000, setOver4000] = useState(false);
  const [content, setContent] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const [selection, setSelection] = useState("");

  // useEffect(() => {
  //   console.log(window?.getSelection()?.toString());
  // });

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
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setCharCount(getCharCount(e.target.value));
  };

  return (
    <div className="flex-col"
      onKeyUp={() => {
        setSelection(window?.getSelection()?.toString() ?? "");
      }}
    >
      <div className="flex gap-6">
        <Card
          className={cn(
            "flex-auto",
            over280 ? "border-red-400 shadow-red-400" : ""
          )}
        >
          <CardHeader className="text-center">
            <CardTitle>𝕏</CardTitle>
            {/* <CardDescription>No money to Elon</CardDescription> */}
          </CardHeader>
          <CardContent>
            <div className="text-center text-4xl">{charCount}/280</div>
          </CardContent>
          {/* <CardFooter>
            <p>Card Footer</p>
          </CardFooter> */}
        </Card>
        <Card
          className={cn(
            "flex-auto",
            over4000 ? "border-red-400 shadow-red-400" : ""
          )}
        >
          <CardHeader className="text-center">
            <CardTitle>𝕏 Premium</CardTitle>
            {/* <CardDescription>Actively fueling Elon</CardDescription> */}
          </CardHeader>
          <CardContent>
            <div className="text-center text-4xl">{charCount}/4000</div>
          </CardContent>
          {/* <CardFooter>
            <p>Card Footer</p>
          </CardFooter> */}
        </Card>
      </div>
      <div className="flex flex-col gap-2">
        <Textarea
          className="md:w-[60ch] mt-5 min-h-[200px] text-lg"
          onChange={handleContentChange}
          placeholder="Start typing!"
          value={content}
          ref={ref}
          onSelectCapture={() => {
            setSelection(window?.getSelection()?.toString() ?? "");
          }}
          onMouseUpCapture={() => {
            setSelection(window?.getSelection()?.toString() ?? "");
          }}
          onBlurCapture={() => {
            console.log("blur", window?.getSelection()?.toString());
            setSelection(window?.getSelection()?.toString() ?? "");
          }}
        />
        <span className="text-gray-500" > {getCharCount(selection)} characters selected </span >
      </div>
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
    </div >
  );
};

export default CharCounter;
