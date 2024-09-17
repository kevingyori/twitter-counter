import type { LocalTweet } from "@/lib/types";
import { formatDate, formatTweetName, truncate } from "@/lib/utils";
import type { ColumnDef, Row } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon, TrashIcon } from "@radix-ui/react-icons";
import { useCallback } from "react";
import { useTweetStore } from "@/lib/store";
import { toast } from "sonner";

function ActionCell({ row }: { row: Row<LocalTweet> }) {
  const allTweets = useTweetStore((state) => state.allTweets);
  const deleteTweet = useTweetStore((state) => state.deleteTweet);
  const undoDelete = useTweetStore((state) => state.undoDelete);
  const setCurrentTweetId = useTweetStore((state) => state.setCurrentTweetId);

  const handleDelete = useCallback(
    function handleDelete(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
      e?.stopPropagation();
      console.log("deleting", row.original.id);
      deleteTweet(row.original.id);
      // setCurrentTweetId(
      //   allTweets.sort(
      //     (a, b) =>
      //       Number.parseInt(b.createdAt) - Number.parseInt(a.createdAt),
      //   )[allTweets.length]?.id,
      // );
      setCurrentTweetId(allTweets[0].id);
      // console.log("new active", allTweets[1].id);

      toast("Tweet deleted", {
        description: `${truncate(row.original.text, 20)}`,
        action: {
          label: "Undo",
          onClick: () => undoDelete(row.original.id),
        },
      });
    },
    [deleteTweet, row, allTweets, setCurrentTweetId, undoDelete],
  );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <DotsHorizontalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleDelete}>
          <TrashIcon className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
        {/* <DropdownMenuItem>
          <ClipboardCopyIcon className="h-4 w-4 mr-2" /> Duplicate
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const columns: ColumnDef<LocalTweet>[] = [
  {
    accessorKey: "text",
    header: "Tweet",
    cell: ({ row }) => (
      <div>{truncate(row.original.text || "Untitled Tweet", 120)}</div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <div className="whitespace-nowrap">
        {formatDate(row.original.createdAt)}
      </div>
    ),
  },
  {
    accessorKey: "actions",
    header: "",
    cell: ({ row }) => <ActionCell row={row} />,
  },
];
