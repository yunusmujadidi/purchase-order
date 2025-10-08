import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStageColor } from "@/lib/order-colors";
import Link from "next/link";
import { Layers } from "lucide-react";

interface StageCount {
  stage: string;
  count: number;
  percentage: number;
}

interface OrdersByStageProps {
  stages: StageCount[];
  loading?: boolean;
}

export function OrdersByStage({ stages, loading = false }: OrdersByStageProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Orders by Stage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stages || stages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Orders by Stage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No orders to display
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Orders by Stage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stages.map((item) => {
            const color = getStageColor(item.stage);
            return (
              <Link
                key={item.stage}
                href={`/orders?stage=${item.stage}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-2 h-12 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {item.stage === "PENDING" ? "Pending" : item.stage}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {item.percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="ml-3"
                  style={{
                    backgroundColor: `${color}20`,
                    color: color,
                    borderColor: `${color}40`,
                  }}
                >
                  {item.count}
                </Badge>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
