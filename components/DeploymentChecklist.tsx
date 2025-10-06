"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface EnvVar {
  name: string;
  value: string | undefined;
  required: boolean;
  description: string;
}

export function DeploymentChecklist() {
  const [envVars, setEnvVars] = useState<EnvVar[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== "development") return;

    const vars: EnvVar[] = [
      {
        name: "NEXT_PUBLIC_CONVEX_URL",
        value: process.env.NEXT_PUBLIC_CONVEX_URL,
        required: true,
        description: "Convex backend URL for database and auth"
      },
      {
        name: "CONVEX_SITE_URL", 
        value: process.env.CONVEX_SITE_URL,
        required: true,
        description: "Your production domain for auth redirects"
      },
      {
        name: "CONVEX_DEPLOYMENT",
        value: process.env.CONVEX_DEPLOYMENT,
        required: false,
        description: "Convex deployment name (optional)"
      }
    ];

    setEnvVars(vars);
    setIsVisible(true);
  }, []);

  if (!isVisible) return null;

  const missingRequired = envVars.filter(v => v.required && !v.value);
  const hasIssues = missingRequired.length > 0;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className={`border-2 ${hasIssues ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-mono">
              🚀 Deployment Checklist
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {envVars.map((envVar) => (
            <div key={envVar.name} className="flex items-center justify-between text-xs">
              <div className="flex-1">
                <code className="text-xs font-mono">{envVar.name}</code>
                <div className="text-gray-600 text-xs">{envVar.description}</div>
              </div>
              <Badge 
                variant={envVar.value ? "default" : envVar.required ? "destructive" : "secondary"}
                className="ml-2 text-xs"
              >
                {envVar.value ? "✅ Set" : envVar.required ? "❌ Missing" : "⚠️ Optional"}
              </Badge>
            </div>
          ))}
          
          {hasIssues && (
            <div className="mt-3 p-2 bg-red-100 rounded text-xs">
              <strong>⚠️ Issues Found:</strong>
              <ul className="mt-1 list-disc list-inside">
                {missingRequired.map(v => (
                  <li key={v.name}>Set {v.name} in your deployment platform</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-3 text-xs text-gray-600">
            <strong>Deployment Platforms:</strong>
            <ul className="mt-1 list-disc list-inside">
              <li>Vercel: Project Settings → Environment Variables</li>
              <li>Netlify: Site Settings → Environment Variables</li>
              <li>Railway: Project → Variables</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
