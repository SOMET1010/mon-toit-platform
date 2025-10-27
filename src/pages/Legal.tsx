import { ReactNode } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { Scale } from 'lucide-react';

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

/**
 * LegalPage - Template unifié pour toutes les pages légales
 * (Confidentialité, Conditions, Mentions légales)
 */
const LegalPage = ({ title, lastUpdated, children }: LegalPageProps) => {
  return (
    <MainLayout>
      <PageHeader
        title={title}
        description={`Dernière mise à jour : ${lastUpdated}`}
        badge="Informations légales"
        icon={<Scale className="h-10 w-10" />}
      />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            {children}
          </div>
        </div>
      </main>
    </MainLayout>
  );
};

export default LegalPage;

