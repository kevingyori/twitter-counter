"use client";
import { useTweetStore } from "@/lib/store";
import { memo } from "react";

import { DataTable } from "./data-table";
import { columns } from "./columns";

const ListOfTweets = memo(() => {
  const allTweets = useTweetStore((state) => state.allTweets);

  return (
    <div className="md:w-[675px] min-w-full md:min-w-1">
      <DataTable
        columns={columns}
        data={allTweets.sort(
          (a, b) =>
            Number.parseInt(b.createdAt as string) -
            Number.parseInt(a.createdAt as string),
        )}
      />
    </div>
  );
});

export { ListOfTweets };
