import { useEffect, useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useHelpSystem } from '@/hooks/useHelpSystem';

interface InteractiveTourProps {
  userType: 'locataire' | 'proprietaire';
  onComplete?: () => void;
}

const TENANT_TOUR: Step[] = [
  {
    target: 'body',
    content: 'Bienvenue sur Mon Toit ! Laissez-nous vous guider dans vos premiers pas.',
    placement: 'center',
  },
  {
    target: '[data-tour="search"]',
    content: 'Utilisez la barre de recherche pour trouver votre futur logement.',
  },
  {
    target: '[data-tour="filters"]',
    content: 'Affinez vos résultats avec les filtres : ville, prix, nombre de chambres...',
  },
  {
    target: '[data-tour="profile"]',
    content: 'Complétez votre profil et obtenez votre vérification pour augmenter vos chances.',
  },
  {
    target: '[data-tour="applications"]',
    content: 'Suivez l\'état de vos candidatures ici.',
  },
];

const OWNER_TOUR: Step[] = [
  {
    target: 'body',
    content: 'Bienvenue sur Mon Toit ! Découvrez comment publier et gérer vos biens.',
    placement: 'center',
  },
  {
    target: '[data-tour="add-property"]',
    content: 'Cliquez ici pour publier un nouveau bien.',
  },
  {
    target: '[data-tour="my-properties"]',
    content: 'Gérez tous vos biens depuis cette page.',
  },
  {
    target: '[data-tour="applications"]',
    content: 'Consultez et gérez les candidatures reçues.',
  },
  {
    target: '[data-tour="profile"]',
    content: 'Complétez votre profil pour inspirer confiance aux locataires.',
  },
];

export const InteractiveTour = ({ userType, onComplete }: InteractiveTourProps) => {
  const [run, setRun] = useState(false);
  const { trackInteraction } = useHelpSystem();

  useEffect(() => {
    // Check if user has seen the tour
    const hasSeenTour = localStorage.getItem(`tour_completed_${userType}`);
    if (!hasSeenTour) {
      // Delay tour start to let the page load
      setTimeout(() => setRun(true), 1000);
    }
  }, [userType]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      localStorage.setItem(`tour_completed_${userType}`, 'true');
      trackInteraction('tour', `${userType}_${status}`);
      onComplete?.();
    }
  };

  const steps = userType === 'locataire' ? TENANT_TOUR : OWNER_TOUR;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      locale={{
        back: 'Précédent',
        close: 'Fermer',
        last: 'Terminer',
        next: 'Suivant',
        skip: 'Passer',
      }}
      styles={{
        options: {
          primaryColor: 'hsl(var(--primary))',
          zIndex: 10000,
        },
      }}
    />
  );
};
