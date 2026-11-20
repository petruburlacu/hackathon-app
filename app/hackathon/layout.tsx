import { HackathonProfileSetup } from "@/components/HackathonProfileSetup";

export default function HackathonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HackathonProfileSetup>{children}</HackathonProfileSetup>;
}
