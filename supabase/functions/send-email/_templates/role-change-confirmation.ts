interface RoleChangeData {
  userName: string;
  oldRole: string;
  newRole: string;
  timestamp: string;
  dashboardUrl: string;
}

export const roleChangeConfirmationTemplate = (data: RoleChangeData): string => {
  const { userName, oldRole, newRole, timestamp, dashboardUrl } = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmation de changement de rôle</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f6f9fc;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; padding: 40px;">
              
              <!-- Header -->
              <tr>
                <td align="center" style="padding-bottom: 30px;">
                  <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; margin: 0;">
                    🔄 Changement de rôle confirmé
                  </h1>
                </td>
              </tr>
              
              <!-- Greeting -->
              <tr>
                <td style="color: #484848; font-size: 16px; line-height: 26px; padding-bottom: 16px;">
                  Bonjour <strong>${userName}</strong>,
                </td>
              </tr>
              
              <tr>
                <td style="color: #484848; font-size: 16px; line-height: 26px; padding-bottom: 32px;">
                  Votre rôle sur la plateforme Mon Toit a été modifié avec succès.
                </td>
              </tr>
              
              <!-- Change Box -->
              <tr>
                <td align="center">
                  <table width="100%" cellpadding="24" cellspacing="0" style="background-color: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; margin-bottom: 24px;">
                    <tr>
                      <td align="center">
                        <div style="color: #6b7280; font-size: 14px; font-weight: 500; margin-bottom: 4px;">
                          Ancien rôle :
                        </div>
                        <div style="color: #374151; font-size: 20px; font-weight: bold; margin-bottom: 16px;">
                          ${oldRole}
                        </div>
                        
                        <div style="color: #10b981; font-size: 32px; margin: 8px 0;">
                          ↓
                        </div>
                        
                        <div style="color: #6b7280; font-size: 14px; font-weight: 500; margin-bottom: 4px; margin-top: 16px;">
                          Nouveau rôle :
                        </div>
                        <div style="color: #10b981; font-size: 24px; font-weight: bold;">
                          ${newRole}
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Timestamp -->
              <tr>
                <td align="center" style="color: #6b7280; font-size: 14px; padding: 24px 0;">
                  ⏰ Date du changement : ${timestamp}
                </td>
              </tr>
              
              <!-- CTA Button -->
              <tr>
                <td align="center" style="padding: 32px 0;">
                  <a href="${dashboardUrl}" 
                     style="background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">
                    Accéder à mon espace
                  </a>
                </td>
              </tr>
              
              <!-- Divider -->
              <tr>
                <td style="padding: 32px 0;">
                  <hr style="border: none; border-top: 1px solid #e5e7eb;">
                </td>
              </tr>
              
              <!-- Security Notice -->
              <tr>
                <td style="color: #6b7280; font-size: 14px; line-height: 24px; padding-bottom: 16px;">
                  Si vous n'êtes pas à l'origine de ce changement, veuillez contacter immédiatement notre support à 
                  <a href="mailto:support@montoit.ci" style="color: #10b981; text-decoration: underline;">support@montoit.ci</a>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="color: #6b7280; font-size: 14px; line-height: 24px;">
                  Cet email a été envoyé par <strong>Mon Toit</strong> - Votre plateforme de location immobilière en Côte d'Ivoire.
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};
