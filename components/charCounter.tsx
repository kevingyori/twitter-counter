"use client";
import { useEffect, useState } from "react";
import { Textarea } from "./ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CharCounter = () => {
  const [charCount, setCharCount] = useState(0);
  const [over280, setOver280] = useState(false);
  const [over4000, setOver4000] = useState(false);
  const [content, setContent] = useState("");

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
    setCharCount(e.target.value.length);
  };

  return (
    <div className=" flex-col ">
      <h1 className="text-2xl text-center">Character Counter</h1>
      <div className="flex gap-6 mt-8">
        <Card
          className={cn(
            "flex-auto",
            over280 ? "border-red-400 shadow-red-400" : ""
          )}
        >
          <CardHeader className="text-center">
            <CardTitle>Free Twitter</CardTitle>
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
            <CardTitle>Twitter Blue</CardTitle>
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
      <Textarea
        className="w-[60ch] mt-5 min-h-[200px] text-lg"
        onChange={handleContentChange}
        placeholder="Type here..."
        value={content}
      />
      <div className="flex mt-5 gap-5">
        <Button
          className="flex-auto"
          variant="destructive"
          onClick={handleClear}
        >
          Clear
        </Button>
        <Button className="flex-auto" variant="default" onClick={handleCopy}>
          Copy
        </Button>
      </div>
    </div>
  );
};

export default CharCounter;
