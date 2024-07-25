"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import Editor from "./editor";

const CharCounter = () => {
  const [charCount, setCharCount] = useState(0);

  const over280 = charCount > 280;
  const over4000 = charCount > 4000;

  return (
    <div
      className="flex-col min-w-full md:min-w-1"
      // onKeyUp={() => {
      //   setSelection(window?.getSelection()?.toString() ?? "");
      // }}
    >
      <div className="flex gap-6 select-none">
        <Card
          className={cn(
            "flex-auto",
            over280 ? "border-red-400 shadow-red-400" : "",
          )}
        >
          <CardHeader className="text-center">
            <CardTitle>𝕏</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center md:text-4xl text-xl">
              {charCount}/280
            </div>
          </CardContent>
        </Card>
        <Card
          className={cn(
            "flex-auto",
            over4000 ? "border-red-400 shadow-red-400" : "",
          )}
        >
          <CardHeader className="text-center">
            <CardTitle>𝕏 Premium</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center md:text-4xl text-xl">
              {charCount}/4000
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col gap-2">
        <Editor setCharCount={setCharCount} />
      </div>
    </div>
  );
};

export default CharCounter;
