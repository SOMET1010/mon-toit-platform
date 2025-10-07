import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from './DataTable';
import { MoreVertical, Shield, AlertTriangle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';

interface Certificate {
  id: string;
  user_id: string;
  certificate_id: string;
  certificate_status: 'active' | 'expired' | 'revoked';
  expires_at: string;
  created_at: string;
  user?: {
    full_name: string;
  };
}

export const CertificateManager = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    
    const { data } = await supabase
      .from('digital_certificates')
      .select('*, user:profiles(full_name)')
      .order('created_at', { ascending: false });

    if (data) {
      setCertificates(data as any);
    }
    
    setLoading(false);
  };

  const handleRevokeCertificate = async (certificateId: string) => {
    const { error } = await supabase
      .from('digital_certificates')
      .update({ certificate_status: 'revoked' })
      .eq('id', certificateId);

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de révoquer le certificat',
        variant: 'destructive'
      });
    } else {
      toast({ title: 'Certificat révoqué' });
      fetchCertificates();
    }
  };

  const handleRegenerateCertificate = async (userId: string) => {
    try {
      const { error } = await supabase.functions.invoke('cryptoneo-generate-certificate', {
        body: { userId }
      });

      if (error) throw error;

      toast({ title: 'Régénération lancée' });
      setTimeout(fetchCertificates, 2000);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de régénérer le certificat',
        variant: 'destructive'
      });
    }
  };

  const columns: any[] = [
    {
      header: 'Utilisateur',
      accessorKey: 'user.full_name',
      cell: ({ row }: any) => row.original.user?.full_name || 'N/A'
    },
    {
      header: 'Certificat ID',
      accessorKey: 'certificate_id',
      cell: ({ row }: any) => (
        <code className="text-xs">{row.original.certificate_id.substring(0, 16)}...</code>
      )
    },
    {
      header: 'Statut',
      accessorKey: 'certificate_status',
      cell: ({ row }: any) => {
        const status = row.original.certificate_status;
        return (
          <Badge variant={
            status === 'active' ? 'default' :
            status === 'expired' ? 'secondary' :
            'destructive'
          }>
            {status === 'active' ? 'Actif' :
             status === 'expired' ? 'Expiré' : 'Révoqué'}
          </Badge>
        );
      }
    },
    {
      header: 'Expire le',
      accessorKey: 'expires_at',
      cell: ({ row }: any) => {
        const date = new Date(row.original.expires_at);
        const isExpiringSoon = date.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000;
        return (
          <div className="flex items-center gap-2">
            {isExpiringSoon && <AlertTriangle className="h-3 w-3 text-orange-500" />}
            <span>{date.toLocaleDateString('fr-FR')}</span>
          </div>
        );
      }
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => handleRegenerateCertificate(row.original.user_id)}
            >
              <Shield className="h-4 w-4 mr-2" />
              Régénérer
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleRevokeCertificate(row.original.id)}
              className="text-destructive"
            >
              Révoquer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des Certificats</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Chargement...</div>
        ) : (
          <DataTable 
            columns={columns}
            data={certificates}
          />
        )}
      </CardContent>
    </Card>
  );
};
