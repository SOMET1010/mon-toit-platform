import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Star, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  review_type: string;
  moderation_status: string;
  moderation_notes: string | null;
  created_at: string;
  reviewer: { full_name: string };
  reviewee: { full_name: string };
}

const ReviewModeration = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [moderationNotes, setModerationNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const fetchPendingReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:reviewer_id(full_name),
          reviewee:reviewee_id(full_name)
        `)
        .eq('moderation_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReviews(data as any || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const moderateReview = async (reviewId: string, action: 'approved' | 'rejected') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('reviews')
        .update({
          moderation_status: action,
          moderation_notes: moderationNotes,
          moderated_by: user.id,
          moderated_at: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: action === 'approved' ? "Avis approuvé" : "Avis rejeté",
        description: `L'avis a été ${action === 'approved' ? 'approuvé' : 'rejeté'} avec succès`,
      });

      fetchPendingReviews();
      setSelectedReview(null);
      setModerationNotes('');
    } catch (error) {
      console.error('Error moderating review:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modérer l'avis",
        variant: "destructive",
      });
    }
  };

  const analyzeContent = (comment: string | null): { isSuspicious: boolean; reasons: string[] } => {
    if (!comment) return { isSuspicious: false, reasons: [] };

    const reasons: string[] = [];
    
    // Check for inappropriate language
    const inappropriateWords = ['mot1', 'mot2']; // Add actual inappropriate words
    if (inappropriateWords.some(word => comment.toLowerCase().includes(word))) {
      reasons.push('Contient un langage inapproprié');
    }

    // Check for personal info (basic patterns)
    if (/\d{10}/.test(comment)) {
      reasons.push('Contient un numéro de téléphone');
    }
    if (/[\w.-]+@[\w.-]+\.\w+/.test(comment)) {
      reasons.push('Contient une adresse email');
    }

    // Check for short/generic content
    if (comment.length < 20) {
      reasons.push('Commentaire trop court');
    }

    return {
      isSuspicious: reasons.length > 0,
      reasons
    };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Modération des avis</h2>
        <Badge variant="secondary">{reviews.length} en attente</Badge>
      </div>

      <div className="grid gap-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Aucun avis en attente de modération</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => {
            const analysis = analyzeContent(review.comment);
            
            return (
              <Card key={review.id} className={analysis.isSuspicious ? 'border-yellow-500' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">
                        {review.reviewer.full_name} → {review.reviewee.full_name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <Badge variant="outline">{review.review_type}</Badge>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedReview(review)}>
                          Modérer
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Modération de l'avis</DialogTitle>
                        </DialogHeader>
                        {selectedReview && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Auteur</Label>
                                <p className="text-sm">{selectedReview.reviewer.full_name}</p>
                              </div>
                              <div>
                                <Label>À propos de</Label>
                                <p className="text-sm">{selectedReview.reviewee.full_name}</p>
                              </div>
                            </div>

                            <div>
                              <Label>Note</Label>
                              <div className="flex items-center gap-2 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-5 w-5 ${
                                      i < selectedReview.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>

                            <div>
                              <Label>Commentaire</Label>
                              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                                {selectedReview.comment || 'Aucun commentaire'}
                              </p>
                            </div>

                            <div>
                              <Label>Date</Label>
                              <p className="text-sm">
                                {format(new Date(selectedReview.created_at), 'PPP à HH:mm', { locale: fr })}
                              </p>
                            </div>

                            {analysis.isSuspicious && (
                              <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 font-medium mb-2">
                                  <AlertTriangle className="h-4 w-4" />
                                  Contenu suspect détecté
                                </div>
                                <ul className="text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside">
                                  {analysis.reasons.map((reason, i) => (
                                    <li key={i}>{reason}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <div className="space-y-2">
                              <Label>Notes de modération</Label>
                              <Textarea
                                value={moderationNotes}
                                onChange={(e) => setModerationNotes(e.target.value)}
                                placeholder="Ajouter des notes de modération (optionnel)..."
                              />
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="default"
                                className="flex-1"
                                onClick={() => moderateReview(selectedReview.id, 'approved')}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approuver
                              </Button>
                              <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={() => moderateReview(selectedReview.id, 'rejected')}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Rejeter
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {review.comment || 'Aucun commentaire'}
                  </p>
                  {analysis.isSuspicious && (
                    <div className="flex items-center gap-2 mt-2 text-yellow-600 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      Contenu suspect
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-2">
                    {format(new Date(review.created_at), 'PPP', { locale: fr })}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ReviewModeration;