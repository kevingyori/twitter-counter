"use client";
import CharCounter from "@/components/charCounter";
import Editor from "@/components/editor";
import { ListOfTweets } from "@/components/listOfTweets";
import { TweetName } from "@/components/tweetName";
import { ModeToggle } from "@/components/ui/theme-toggle";
import dynamic from "next/dynamic";
import { useState } from "react";

const Toaster = dynamic(() => import("@/components/ui/sonner"));

export default function Home() {
  const [charCount, setCharCount] = useState(0);

  return (
    <main className="flex min-h-screen w-auto flex-col px-2 items-center md:scroll-pt-12 pt-10 pb-10 relative">
      <ModeToggle />
      <TweetName />
      <div className="flex-col min-w-full md:min-w-1">
        <CharCounter />
        <Editor />
      </div>
      <ListOfTweets />
      <Toaster closeButton />
    </main>
  );
}
