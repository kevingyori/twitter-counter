import { redirect } from "next/navigation";
import { randomName } from "@/lib/utils";

export async function GET() {
  redirect(`/editor/${randomName()}`);
}
