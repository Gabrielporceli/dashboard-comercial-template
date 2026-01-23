import { Card } from "@/components/ui/card";
import { Users, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import { Lead } from "@/types/lead";

interface MetricsCardsProps {
  leads: Lead[];
}

export const MetricsCards = ({ leads }: MetricsCardsProps) => {
  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter(l => l.conversion === "Qualificado").length;
  const disqualifiedLeads = leads.filter(l => l.conversion === "Desqualificado").length;
  const qualificationRate = totalLeads > 0 ? ((qualifiedLeads / totalLeads) * 100).toFixed(1) : "0";

  const metrics = [
    {
      title: "Total de Leads",
      value: totalLeads,
      icon: Users,
      bgColor: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      title: "Qualificados",
      value: qualifiedLeads,
      icon: CheckCircle2,
      bgColor: "bg-success/10",
      iconColor: "text-success"
    },
    {
      title: "Desqualificados",
      value: disqualifiedLeads,
      icon: XCircle,
      bgColor: "bg-destructive/10",
      iconColor: "text-destructive"
    },
    {
      title: "Taxa de Qualificação",
      value: `${qualificationRate}%`,
      icon: TrendingUp,
      bgColor: "bg-warning/10",
      iconColor: "text-warning"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className="p-6 transition-all duration-200 hover:shadow-lg hover:border-primary/20 cursor-default">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{metric.title}</p>
                <p className="text-3xl font-bold text-foreground">{metric.value}</p>
              </div>
              <div className={`${metric.bgColor} p-3 rounded-lg`}>
                <Icon className={`w-6 h-6 ${metric.iconColor}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
