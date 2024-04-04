import { permanentRedirect, redirect } from "next/navigation";
import { randomName } from "@/lib/utils";

export async function GET() {
  permanentRedirect(`/${randomName()}`);
}
