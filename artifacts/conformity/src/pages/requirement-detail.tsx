import { useGetRequirement, getGetRequirementQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getRegColor, getRegBorderColor } from "@/lib/utils";
import { ArrowLeft, GitMerge, FileText, Share2, Tag } from "lucide-react";

export default function RequirementDetail() {
  const params = useParams();
  const id = Number(params.id);

  const { data: req, isLoading, isError } = useGetRequirement(id, {
    query: {
      enabled: !!id,
      queryKey: getGetRequirementQueryKey(id)
    }
  });

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-8 w-32 mb-6" />
        <Card className="rounded-md">
          <CardContent className="p-4 sm:p-6 lg:p-8 space-y-4">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-32 w-full mt-6" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !req) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-destructive border border-destructive/20 p-4 bg-destructive/5">
          Requirement not found or failed to load.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      <Link href="/requirements" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Explorer
      </Link>

      <Card className={`rounded-md border-t-4 ${getRegBorderColor(req.regulationKey)} shadow-md`}>
        <CardHeader className="bg-muted/10 border-b border-border p-6 md:p-8 space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <Link href={`/regulations/${req.regulationKey}`}>
              <Badge className={`${getRegColor(req.regulationKey)} font-mono border-none px-3 py-1 rounded-md hover:opacity-80 cursor-pointer`}>
                {req.regulationShortName}
              </Badge>
            </Link>
            <Badge variant="outline" className="font-mono text-sm bg-background rounded-md">
              {req.refCode}
            </Badge>
            {req.themeName && (
              <Badge variant="secondary" className="rounded-md border border-border/50 text-xs font-normal">
                <Tag className="w-3 h-3 mr-1.5 inline-block opacity-70" />
                {req.themeName}
              </Badge>
            )}
            <Badge variant="outline" className="rounded-md ml-auto uppercase tracking-wider text-[10px] text-muted-foreground">
              {req.obligationType}
            </Badge>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold leading-tight pt-2">
            {req.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-foreground/90 font-serif leading-relaxed">
            {req.description.split('\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          {req.appliesTo.length > 0 && (
            <div className="mt-8 pt-6 border-t border-border">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                <FileText className="w-4 h-4" /> Applies to Product Classes
              </h4>
              <div className="flex flex-wrap gap-2">
                {req.appliesTo.map(cls => (
                  <Badge key={cls} variant="outline" className="font-mono text-xs bg-muted/30">
                    {cls}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <GitMerge className="w-5 h-5 text-muted-foreground" />
          Cross-Regulation Mappings
          <Badge variant="secondary" className="ml-2 font-mono">{req.mappingCount}</Badge>
        </h3>
        
        {req.mappings.length === 0 ? (
          <div className="border border-dashed border-border p-4 sm:p-6 lg:p-8 text-center text-muted-foreground bg-muted/10">
            No established mappings to other frameworks.
          </div>
        ) : (
          <div className="grid gap-4">
            {req.mappings.map((mapping, idx) => (
              <Card key={idx} className="rounded-md hover:border-primary/50 transition-colors group">
                <CardContent className="p-0 flex flex-col md:flex-row items-stretch">
                  <div className={`w-full md:w-48 p-4 border-b md:border-b-0 md:border-r border-border flex flex-col justify-center bg-muted/20`}>
                    <Badge className={`${getRegColor(mapping.regulationKey)} self-start text-[10px] px-1.5 py-0 border-none font-mono rounded-md mb-2`}>
                      {mapping.regulationShortName}
                    </Badge>
                    <span className="font-mono text-sm font-semibold">{mapping.refCode}</span>
                    <div className="mt-auto pt-4 flex items-center text-xs text-muted-foreground uppercase tracking-widest font-bold">
                      <Share2 className="w-3 h-3 mr-1.5" />
                      {mapping.relationship === "supports" && mapping.direction === "inbound"
                        ? "supported by"
                        : mapping.relationship}
                    </div>
                  </div>
                  <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
                    <div>
                      <Link href={`/requirements/${mapping.requirementId}`} className="text-base font-semibold group-hover:text-primary transition-colors block mb-2">
                        {mapping.title}
                      </Link>
                      {mapping.note && (
                        <p className="text-sm text-muted-foreground border-l-2 border-primary/30 pl-3 py-1 bg-muted/10">
                          Note: {mapping.note}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <Link href={`/requirements/${mapping.requirementId}`} className="text-xs font-medium text-primary hover:underline">
                        Explore Full Requirement &rarr;
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
