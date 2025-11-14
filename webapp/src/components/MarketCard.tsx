import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MarketCardProps {
  id: string;
  title: string;
  description: string;
  deadline: string;
  prizePool: string;
  status: "active" | "pending" | "resolved";
  totalVotes?: number;
}

export const MarketCard = ({
  id,
  title,
  description,
  deadline,
  prizePool,
  status,
  totalVotes = 0,
}: MarketCardProps) => {
  const navigate = useNavigate();

  const statusConfig = {
    active: { label: "Active", color: "bg-success" },
    pending: { label: "Pending Reveal", color: "bg-warning" },
    resolved: { label: "Ended", color: "bg-muted" },
  };

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      
      <div className="relative p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "border-0 text-xs font-semibold",
                  statusConfig[status].color
                )}
              >
                {statusConfig[status].label}
              </Badge>
              <span className="text-xs text-muted-foreground">#{id}</span>
            </div>
            <h3 className="text-lg font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Deadline</span>
            </div>
            <p className="text-sm font-medium">{deadline}</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>Prize Pool</span>
            </div>
            <p className="text-sm font-bold text-accent">{prizePool}</p>
          </div>
        </div>

        {totalVotes > 0 && (
          <div className="flex items-center justify-between pt-2 text-xs">
            <span className="text-muted-foreground">
              {totalVotes} participants voted
            </span>
          </div>
        )}

        <Button
          onClick={() => navigate(`/market/${id}`)}
          className="w-full"
          variant="outline"
        >
          View Details
        </Button>
      </div>
    </Card>
  );
};

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
