"use client";

import { useState } from "react";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errorMessage";

export function ExportResultsCard() {
  const convex = useConvex();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // One-off fetch, not a subscription: the CSV is only needed when the button is pressed.
      const csv = await convex.query(api.leaderboard.exportCsv, {});
      const url = URL.createObjectURL(
        new Blob([csv], { type: "text/csv;charset=utf-8" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `hackathon-results-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to export results"));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="bg-black/40 backdrop-blur-xs border-cyan-400/20">
      <CardHeader>
        <CardTitle className="text-yellow-400 font-mono">📤 Results</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <div className="text-xs text-gray-500">
          Current points leaderboard: rank, team, title, total points and voter
          count.
        </div>
        <Button
          size="sm"
          onClick={handleExport}
          disabled={isExporting}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          {isExporting ? "Exporting..." : "Export results (CSV)"}
        </Button>
      </CardContent>
    </Card>
  );
}
