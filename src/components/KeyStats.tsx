import { Home, Users, MapPin } from "lucide-react";

const stats = [
  {
    icon: Home,
    value: "+2 000",
    label: "biens sécurisés",
  },
  {
    icon: Users,
    value: "500",
    label: "propriétaires actifs",
  },
  {
    icon: MapPin,
    value: "100%",
    label: "local",
  },
];

const KeyStats = () => {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 via-white to-secondary/5 border-t-2 border-primary/20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const iconBgColor = 
              index === 0 ? "bg-blue-600" : 
              index === 1 ? "bg-primary" : 
              "bg-secondary";
            
            return (
              <div key={index} className="flex flex-col items-center gap-4">
                <div className={`p-4 rounded-full ${iconBgColor}`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                    {stat.value}
                  </div>
                  <div className="text-base text-muted-foreground">{stat.label}</div>
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
