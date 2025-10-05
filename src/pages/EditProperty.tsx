import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, X, Trash2 } from 'lucide-react';

const propertySchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères').max(100),
  description: z.string().min(20, 'La description doit contenir au moins 20 caractères'),
  property_type: z.string().min(1, 'Veuillez sélectionner un type de bien'),
  address: z.string().min(5, 'L\'adresse est requise'),
  city: z.string().min(2, 'La ville est requise'),
  neighborhood: z.string().optional(),
  monthly_rent: z.number().positive('Le loyer doit être positif'),
  deposit_amount: z.number().nonnegative('La caution ne peut être négative').optional(),
  charges_amount: z.number().nonnegative('Les charges ne peuvent être négatives').optional(),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  surface_area: z.number().positive('La surface doit être positive').optional(),
  floor_number: z.number().int().optional(),
  is_furnished: z.boolean().default(false),
  has_ac: z.boolean().default(false),
  has_parking: z.boolean().default(false),
  has_garden: z.boolean().default(false),
  status: z.string(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

const EditProperty = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      is_furnished: false,
      has_ac: false,
      has_parking: false,
      has_garden: false,
      status: 'disponible',
    },
  });

  useEffect(() => {
    const loadProperty = async () => {
      if (!id) {
        toast({ title: 'Erreur', description: 'ID de bien invalide', variant: 'destructive' });
        navigate('/mes-biens');
        return;
      }

      const { data: property, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !property) {
        toast({ title: 'Erreur', description: 'Bien introuvable', variant: 'destructive' });
        navigate('/mes-biens');
        return;
      }

      if (property.owner_id !== user?.id) {
        toast({ title: 'Accès refusé', description: 'Vous ne pouvez pas modifier ce bien', variant: 'destructive' });
        navigate('/mes-biens');
        return;
      }

      form.reset({
        title: property.title,
        description: property.description || '',
        property_type: property.property_type,
        address: property.address,
        city: property.city,
        neighborhood: property.neighborhood || '',
        monthly_rent: property.monthly_rent,
        deposit_amount: property.deposit_amount || 0,
        charges_amount: property.charges_amount || 0,
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        surface_area: property.surface_area || 0,
        floor_number: property.floor_number || 0,
        is_furnished: property.is_furnished || false,
        has_ac: property.has_ac || false,
        has_parking: property.has_parking || false,
        has_garden: property.has_garden || false,
        status: property.status,
      });

      setExistingImages(property.images || []);
      setLoading(false);
    };

    loadProperty();
  }, [id, user, navigate, form]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length - imagesToDelete.length + imageFiles.length + files.length;
    
    if (totalImages > 10) {
      toast({ title: 'Limite atteinte', description: 'Maximum 10 images par bien', variant: 'destructive' });
      return;
    }

    setImageFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const markExistingImageForDeletion = (imageUrl: string) => {
    setImagesToDelete(prev => [...prev, imageUrl]);
  };

  const unmarkImageForDeletion = (imageUrl: string) => {
    setImagesToDelete(prev => prev.filter(url => url !== imageUrl));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return [];

    const uploadedUrls: string[] = [];
    
    for (const file of imageFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  const deleteImages = async (imageUrls: string[]) => {
    for (const url of imageUrls) {
      const path = url.split('/property-images/').pop();
      if (path) {
        await supabase.storage.from('property-images').remove([path]);
      }
    }
  };

  const handleDeleteProperty = async () => {
    if (!id) return;
    
    setDeleting(true);
    try {
      // Delete all images
      await deleteImages(existingImages);

      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: 'Succès', description: 'Bien supprimé avec succès' });
      navigate('/mes-biens');
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({ title: 'Erreur', description: 'Erreur lors de la suppression', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  const onSubmit = async (data: PropertyFormData) => {
    if (!id) return;

    setUploading(true);
    try {
      // Upload new images
      const newImageUrls = await uploadImages();

      // Delete marked images
      await deleteImages(imagesToDelete);

      // Combine existing (not deleted) and new images
      const finalImages = [
        ...existingImages.filter(url => !imagesToDelete.includes(url)),
        ...newImageUrls
      ];

      const { error } = await supabase
        .from('properties')
        .update({
          ...data,
          images: finalImages,
          main_image: finalImages[0] || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      toast({ title: 'Succès', description: 'Bien mis à jour avec succès' });
      navigate('/mes-biens');
    } catch (error) {
      console.error('Error updating property:', error);
      toast({ title: 'Erreur', description: 'Erreur lors de la mise à jour', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  if (!user || (profile?.user_type !== 'proprietaire' && profile?.user_type !== 'agence')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Accès refusé. Cette page est réservée aux propriétaires et agences.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Modifier le bien</h1>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={deleting}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer le bien
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Le bien et toutes ses images seront supprimés définitivement.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteProperty}>
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations générales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre de l'annonce</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ex: Appartement moderne 2 pièces" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={5} placeholder="Décrivez votre bien..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="property_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de bien</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="appartement">Appartement</SelectItem>
                            <SelectItem value="maison">Maison</SelectItem>
                            <SelectItem value="studio">Studio</SelectItem>
                            <SelectItem value="villa">Villa</SelectItem>
                            <SelectItem value="bureau">Bureau</SelectItem>
                            <SelectItem value="commerce">Commerce</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Statut</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un statut" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="disponible">Disponible</SelectItem>
                            <SelectItem value="loué">Loué</SelectItem>
                            <SelectItem value="retiré">Retiré</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Localisation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ex: 123 Rue des Jardins" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ville</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="ex: Abidjan" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="neighborhood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quartier</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="ex: Cocody" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Caractéristiques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chambres</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Salles de bain</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="surface_area"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Surface (m²)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="floor_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Étage</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="is_furnished"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="!mt-0">Meublé</FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="has_ac"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="!mt-0">Climatisation</FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="has_parking"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="!mt-0">Parking</FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="has_garden"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="!mt-0">Jardin</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tarifs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="monthly_rent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loyer mensuel (FCFA)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deposit_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Caution (FCFA)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="charges_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Charges mensuelles (FCFA)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Photos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Images actuelles</Label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      {existingImages.map((url, index) => (
                        <div key={index} className="relative">
                          <img src={url} alt={`Image ${index + 1}`} className="w-full h-32 object-cover rounded" />
                          {imagesToDelete.includes(url) ? (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                              <Button type="button" size="sm" variant="secondary" onClick={() => unmarkImageForDeletion(url)}>
                                Annuler
                              </Button>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2"
                              onClick={() => markExistingImageForDeletion(url)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {imagePreviews.length > 0 && (
                    <div>
                      <Label>Nouvelles images</Label>
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img src={preview} alt={`Nouvelle ${index + 1}`} className="w-full h-32 object-cover rounded" />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2"
                              onClick={() => removeNewImage(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      disabled={uploading}
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Maximum 10 images au total
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button type="submit" disabled={uploading} className="flex-1">
                  {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enregistrer les modifications
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/mes-biens')}>
                  Annuler
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EditProperty;
