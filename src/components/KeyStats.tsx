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
    <section className="py-12 bg-background border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="flex flex-col items-center gap-3">
                <div className="p-3 rounded-full bg-gradient-primary">
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-1">
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
