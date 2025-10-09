import ConvexClientProvider from "@/components/ConvexClientProvider";
import { HackathonProfileSetup } from "@/components/HackathonProfileSetup";
import { SessionManager } from "@/components/SessionManager";

export default function HackathonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexClientProvider>
      <SessionManager />
      <HackathonProfileSetup>
        {children}
      </HackathonProfileSetup>
    </ConvexClientProvider>
  );
}
