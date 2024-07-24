import { randomName } from "@/lib/utils";
import { permanentRedirect } from "next/navigation";

export async function GET() {
	permanentRedirect(`/${randomName()}`);
}
