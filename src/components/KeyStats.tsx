import { Users, Building2, Zap, TrendingUp } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "15,000+",
    label: "dossiers créés",
  },
  {
    icon: Zap,
    value: "48h",
    label: "vérification moyenne",
  },
  {
    icon: Building2,
    value: "3,500+",
    label: "logements vérifiés",
  },
  {
    icon: TrendingUp,
    value: "98%",
    label: "satisfaction",
  },
];

const KeyStats = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const iconBgColor = 
              index === 0 ? "bg-blue-600" : 
              index === 1 ? "bg-primary" : 
              "bg-secondary";
            
            return (
              <div 
                key={index} 
                className="flex flex-col items-center gap-3 p-4 bg-white rounded-lg border border-primary/10 shadow-sm hover:shadow-md transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`p-3 rounded-full ${iconBgColor}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default KeyStats;
