"use client";
import { useTweetStore } from "@/lib/store";
import { memo } from "react";

import { DataTable } from "./data-table";
import { columns } from "./columns";

import { useDocument, useRepo } from "@automerge/automerge-repo-react-hooks";

const ListOfTweets = memo(() => {
  const allTweets = useTweetStore((state) => state.allTweets);
  const repo = useRepo();
  // const [doc, changeDoc] = useDocument<TaskList>(docUrl);

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
