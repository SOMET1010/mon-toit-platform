import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Key, Building2 } from "lucide-react";

const RoleSelector = () => {
  const roles = [
    {
      type: "locataire",
      icon: Home,
      title: "Locataire",
      description: "Je cherche un logement",
      color: "from-primary/20 to-primary/5",
    },
    {
      type: "proprietaire",
      icon: Key,
      title: "Propriétaire",
      description: "Je possède un bien à louer",
      color: "from-secondary/20 to-secondary/5",
    },
    {
      type: "agence",
      icon: Building2,
      title: "Agence",
      description: "Je gère plusieurs biens",
      color: "from-accent/20 to-accent/5",
    },
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Qui êtes-vous ?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choisissez votre profil pour une expérience personnalisée
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Link key={role.type} to={`/auth?type=${role.type}`}>
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer group">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${role.color} flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform`}>
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-center mb-2">{role.title}</h3>
                    <p className="text-muted-foreground text-center">{role.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RoleSelector;
