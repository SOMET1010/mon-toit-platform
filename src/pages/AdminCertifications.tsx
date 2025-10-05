import { useRequireRole } from "@/hooks/useRequireRole";
import Navbar from "@/components/Navbar";
import { CertificationStats } from "@/components/admin/CertificationStats";
import LeaseCertificationQueue from "@/components/admin/LeaseCertificationQueue";

const AdminCertifications = () => {
  useRequireRole('admin');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Certifications ANSUT</h1>
          <p className="text-muted-foreground">
            Gérez les demandes de certification des baux
          </p>
        </div>

        <div className="space-y-8">
          <CertificationStats />
          <LeaseCertificationQueue />
        </div>
      </div>
    </div>
  );
};

export default AdminCertifications;