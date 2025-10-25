export const securityAlertTemplate = (data: {
  fullName: string;
  activityCount: number;
  activityList: string;
  dashboardUrl: string;
}) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
        .alert { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 15px 0; }
        ul { padding-left: 20px; }
        li { margin-bottom: 15px; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        .cta { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Alerte Sécurité</h1>
        </div>
        <div class="content">
          <p>Bonjour ${data.fullName},</p>
          
          <div class="alert">
            <strong>Activités suspectes détectées</strong><br>
            Notre système a détecté ${data.activityCount} activité(s) suspecte(s) dans les logs d'audit.
          </div>

          <h3>Détails des activités :</h3>
          <ul>
            ${data.activityList}
          </ul>

          <p>
            <strong>Action recommandée :</strong> Veuillez vérifier ces activités dans le tableau de bord d'administration
            et prendre les mesures appropriées si nécessaire.
          </p>

          <a href="${data.dashboardUrl}" class="cta">
            Consulter les logs d'audit
          </a>

          <div class="footer">
            <p>Cet email a été généré automatiquement par le système de surveillance Mon Toit.</p>
            <p>Date de détection : ${new Date().toLocaleString('fr-FR')}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

