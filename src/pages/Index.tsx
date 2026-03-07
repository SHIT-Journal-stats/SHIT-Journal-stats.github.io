import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FaSquareGithub } from "react-icons/fa6";

const Index = () => {
  const [paperId, setPaperId] = useState("");
  const navigate = useNavigate();

  const handleGo = () => {
    const trimmed = paperId.trim();
    if (trimmed) navigate(`/${trimmed}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Preprint Statistics Viewer 4 SSMH</CardTitle>
          <CardDescription>
            Enter a preprint ID to view its metadata and metrics history.
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
              placeholder="e.g. 0928f19e-927f-4bd5-ad22-1bc4a9f3e37f"
              value={paperId}
              onChange={(e) => setPaperId(e.target.value)}
            />
            <Button type="submit">Go</Button>
            <Button><a href={"https://github.com/SHIT-Journal-stats/SHIT-Journal-stats.github.io"} className={"flex whitespace-pre"}>Project at <FaSquareGithub/></a></Button>
          </form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Try <button type="button" onClick={() => navigate("/0928f19e-927f-4bd5-ad22-1bc4a9f3e37f")} className="text-primary underline-offset-4 hover:underline">0928f19e-927f-4bd5-ad22-1bc4a9f3e37f</button> for a demo.
            Or <Button variant="outline" type="button" onClick={() => navigate("/search")}>Search</Button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
