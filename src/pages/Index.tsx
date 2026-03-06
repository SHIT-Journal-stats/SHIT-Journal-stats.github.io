import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const Index = () => {
  const [paperId, setPaperId] = useState("");
  const navigate = useNavigate();

  const handleGo = () => {
    const trimmed = paperId.trim();
    if (trimmed) navigate(`/${trimmed}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Paper Statistics Viewer</CardTitle>
          <CardDescription>
            Enter a paper ID to view its metadata and metrics history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGo();
            }}
            className="flex gap-2"
          >
            <Input
              placeholder="e.g. sample-paper"
              value={paperId}
              onChange={(e) => setPaperId(e.target.value)}
            />
            <Button type="submit">Go</Button>
          </form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Try <button type="button" onClick={() => navigate("/sample-paper")} className="text-primary underline-offset-4 hover:underline">sample-paper</button> for a demo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
