import { HackathonProfileSetup } from "@/components/HackathonProfileSetup";
import { SessionManager } from "@/components/SessionManager";

export default function HackathonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SessionManager />
      <HackathonProfileSetup>
        {children}
      </HackathonProfileSetup>
    </>
  );
}
