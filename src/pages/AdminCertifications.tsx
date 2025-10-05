import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield } from "lucide-react";
import CertificationStats from "@/components/admin/CertificationStats";
import LeaseCertificationQueue from "@/components/admin/LeaseCertificationQueue";
import AdminLeases from "@/components/admin/AdminLeases";

const AdminCertifications = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-secondary" />
        <div>
          <h1 className="text-3xl font-bold">Certifications ANSUT</h1>
          <p className="text-muted-foreground">
            Gérez les demandes de certification et suivez les statistiques
          </p>
        </div>
      </div>

      <CertificationStats />

      <Tabs defaultValue="queue" className="mt-8">
        <TabsList>
          <TabsTrigger value="queue">File d'attente</TabsTrigger>
          <TabsTrigger value="all">Tous les baux</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="mt-6">
          <LeaseCertificationQueue />
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <AdminLeases />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCertifications;