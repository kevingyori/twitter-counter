"use client";
import CharCounter from "@/components/charCounter";
import Editor from "@/components/editor";
import { ListOfTweets } from "@/components/listOfTweets";
import Toaster from "@/components/ui/sonner";

export default function Home() {
  return (
    <main className="flex min-h-screen w-auto flex-col px-2 items-center md:scroll-pt-12 pt-10 pb-10 relative">
      <div className="flex-col min-w-full md:min-w-1">
        <CharCounter />
        <Editor />
      </div>
      <ListOfTweets />
      <Toaster closeButton />
    </main>
  );
}
