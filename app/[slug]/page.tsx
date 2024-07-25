"use client";
import CharCounter from "@/components/charCounter";
import Editor from "@/components/editor";
import { TweetName } from "@/components/tweetName";
import dynamic from "next/dynamic";
import { useState } from "react";

const Toaster = dynamic(() => import("@/components/ui/toaster"));
const ListOfTweets = dynamic(() => import("@/components/listOfTweets"), {
  loading: () => (
    <div className="flex flex-col gap-3 md:w-[675px] min-w-full md:min-w-1 fade-in animate-in duration-200">
      <div className="bg-gray-100 w-full h-10 rounded animate-pulse" />
      <div className="bg-gray-100 h-20 rounded-lg" />
      <div className="bg-gray-100 h-20 rounded-lg" />
    </div>
  ),
});

export default function Home() {
  const [charCount, setCharCount] = useState(0);

  return (
    <main className="flex min-h-screen w-auto flex-col gap-3 px-2 items-center md:pt-24 pt-10 pb-10">
      <TweetName />
      <div className="flex-col min-w-full md:min-w-1">
        <CharCounter charCount={charCount} />
        <Editor setCharCount={setCharCount} />
      </div>
      <ListOfTweets />
      <Toaster />
    </main>
  );
}
