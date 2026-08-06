import { useListRegulations } from "@workspace/api-client-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { getRegBorderColor, getRegColor } from "@/lib/utils";
import { ExternalLink, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Regulations() {
  const { data: regulations, isLoading, isError } = useListRegulations();

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-64 w-full" />)}
        </div>
      </div>
    );
  }

  if (isError || !regulations) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-destructive">Failed to load regulations.</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="border-b border-border pb-6">
        <span className="oxot-kicker block mb-1">EU &amp; INTERNATIONAL REGULATORY FRAMEWORKS</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-foreground">Regulations</h1>
        <p className="text-sm text-muted-foreground mt-1 font-sans">Frameworks mapped in the current conformity scope.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {regulations.map((reg) => (
          <Card key={reg.key} className={`rounded-md border-t-4 ${getRegBorderColor(reg.key)} flex flex-col`}>
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className={`font-mono ${getRegColor(reg.key)} border-none`}>{reg.shortName}</Badge>
                <Badge variant="secondary" className="font-mono">{reg.jurisdiction}</Badge>
              </div>
              <CardTitle className="text-xl leading-tight">{reg.fullTitle}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground mb-6 line-clamp-3">{reg.summary}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 border border-border/50">
                <div>
                  <div className="text-muted-foreground mb-1">In Force</div>
                  <div className="font-mono">{reg.inForceDate ? new Date(reg.inForceDate).getFullYear() : 'Pending'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Requirements</div>
                  <div className="font-mono font-bold">{reg.requirementCount}</div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-border pt-4">
              <a 
                href={reg.sourceUrl} 
                target="_blank" 
                rel="noreferrer"
                className="text-sm inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                Official Text <ExternalLink className="w-3 h-3" />
              </a>
              <Link href={`/regulations/${reg.key}`} className="text-sm inline-flex items-center gap-1.5 font-medium hover:text-primary transition-colors">
                View Details <ArrowRight className="w-4 h-4" />
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
