import { Card, CardContent } from "@/components/ui/card";

export function Leaderboard() {
  return (
    <div className="flex-1 p-3 sm:p-4 lg:p-6">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <Card className="bg-black/40 backdrop-blur-xs border-cyan-400/20">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400 font-mono">
              Points leaderboard opens when voting opens
            </h1>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
