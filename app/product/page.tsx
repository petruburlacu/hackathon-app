import { Chat } from "@/app/product/Chat/Chat";
import { ChatIntro } from "@/app/product/Chat/ChatIntro";
import { UserMenu } from "@/components/UserMenu";
import { api } from "@/convex/_generated/api";
import { convexAuthNextjsAccessToken } from "@/lib/convexAuth";
import { fetchQuery } from "convex/nextjs";

export default async function ProductPage() {
  const viewer = await fetchQuery(
    api.users.viewer,
    {},
    { token: (await convexAuthNextjsAccessToken()) ?? undefined },
  );
  return (
    <main className="flex max-h-screen grow flex-col overflow-hidden">
      <div className="flex items-start justify-between border-b p-4">
        <ChatIntro />
        <UserMenu>{viewer?.username}</UserMenu>
      </div>
      {viewer && <Chat viewer={viewer._id} />}
    </main>
  );
}
