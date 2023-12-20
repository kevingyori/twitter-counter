"use client";
import CharCounter from "@/components/charCounter";
import { ListOfTweets } from "@/components/listOfTweets";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col gap-3 items-center md:pt-24 pt-10 mb-10">
      <CharCounter />
      <ListOfTweets />
    </main>
  );
}
