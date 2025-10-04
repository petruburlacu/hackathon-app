import ConvexClientProvider from "@/components/ConvexClientProvider";
import { HackathonProfileSetup } from "@/components/HackathonProfileSetup";

export default function HackathonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexClientProvider>
      <HackathonProfileSetup>
        {children}
      </HackathonProfileSetup>
    </ConvexClientProvider>
  );
}
