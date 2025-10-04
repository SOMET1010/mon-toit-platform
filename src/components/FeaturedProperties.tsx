import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, BedDouble, Bath, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";

const properties = [
  {
    id: 1,
    title: "Appartement moderne à Cocody",
    location: "Cocody, Abidjan",
    price: "350 000",
    period: "mois",
    bedrooms: 3,
    bathrooms: 2,
    surface: 95,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    type: "Appartement",
    featured: true,
  },
  {
    id: 2,
    title: "Villa spacieuse à Riviera",
    location: "Riviera Golf, Abidjan",
    price: "750 000",
    period: "mois",
    bedrooms: 5,
    bathrooms: 4,
    surface: 220,
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80",
    type: "Villa",
    featured: true,
  },
  {
    id: 3,
    title: "Studio meublé - Plateau",
    location: "Plateau, Abidjan",
    price: "180 000",
    period: "mois",
    bedrooms: 1,
    bathrooms: 1,
    surface: 35,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    type: "Studio",
    featured: false,
  },
  {
    id: 4,
    title: "Duplex avec jardin",
    location: "Marcory, Abidjan",
    price: "450 000",
    period: "mois",
    bedrooms: 4,
    bathrooms: 3,
    surface: 150,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    type: "Duplex",
    featured: true,
  },
];

const FeaturedProperties = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Biens en vedette
          </h2>
          <p className="text-muted-foreground text-lg">
            Découvrez notre sélection de biens immobiliers de qualité
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="group overflow-hidden hover:shadow-card transition-smooth">
              <div className="relative overflow-hidden">
                <img
                  src={property.image}
                  alt={`${property.type} à ${property.location} - ${property.bedrooms} chambres`}
                  loading="lazy"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-smooth duration-500"
                />
                {property.featured && (
                  <Badge className="absolute top-3 left-3 bg-secondary">
                    En vedette
                  </Badge>
                )}
                <Badge className="absolute top-3 right-3 bg-background/90 text-foreground">
                  {property.type}
                </Badge>
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                  {property.title}
                </h3>
                <div className="flex items-center gap-1 text-muted-foreground mb-3">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{property.location}</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <BedDouble className="h-4 w-4" />
                    <span>{property.bedrooms}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="h-4 w-4" />
                    <span>{property.bathrooms}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Maximize className="h-4 w-4" />
                    <span>{property.surface}m²</span>
                  </div>
                </div>

                <div className="text-2xl font-bold text-primary">
                  {property.price.toLocaleString()} FCFA
                  <span className="text-sm font-normal text-muted-foreground">/{property.period}</span>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Button variant="outline" className="w-full">
                  Voir les détails
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline">
            Voir toutes les annonces
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
