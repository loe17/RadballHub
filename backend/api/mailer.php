<?php
// =============================================================================
// RadballHub - E-Mail Service für Netcup Webhosting (SMTP)
// =============================================================================

require_once __DIR__ . '/config.php';

/**
 * Sendet E-Mails über den Netcup-Postausgangsserver (SMTP SSL / TLS)
 */
function sendSmtpMail(string $toEmail, string $toName, string $subject, string $htmlBody): bool {
    // 1. Wenn PHPMailer via Composer verfügbar ist:
    if (class_exists('PHPMailer\PHPMailer\PHPMailer')) {
        try {
            $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
            $mail->isSMTP();
            $mail->Host       = SMTP_HOST;
            $mail->SMTPAuth   = true;
            $mail->Username   = SMTP_USER;
            $mail->Password   = SMTP_PASS;
            $mail->SMTPSecure = SMTP_PORT === 465 ? \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS : \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = SMTP_PORT;
            $mail->CharSet    = 'UTF-8';

            $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
            $mail->addAddress($toEmail, $toName);
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $htmlBody;
            $mail->AltBody = strip_tags($htmlBody);

            return $mail->send();
        } catch (\Throwable $e) {
            error_log('PHPMailer error: ' . $e->getMessage());
            // Fallback auf mail()
        }
    }

    // 2. Fallback: Native PHP mail() Funktion (auf Netcup standardmäßig mit Sendmail verknüpft)
    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8\r\n";
    $headers .= "From: " . SMTP_FROM_NAME . " <" . SMTP_FROM_EMAIL . ">\r\n";
    $headers .= "Reply-To: " . SMTP_FROM_EMAIL . "\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    return @mail($toEmail, '=?UTF-8?B?' . base64_encode($subject) . '?=', $htmlBody, $headers);
}

/**
 * Admin-Benachrichtigung bei neuer Einreichung
 */
function sendAdminNewSubmissionEmail(string $exerciseTitle, int $exerciseId, ?string $authorName = null): bool {
    $subject = "Neue Übungseingabe zur Prüfung: $exerciseTitle";
    $authorText = $authorName ? " (angegebener Urheber: " . htmlspecialchars($authorName) . ")" : "";
    $body = "
        <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
            <h2 style='color: #2563eb;'>Neue Übung eingereicht</h2>
            <p>Ein Mitglied hat eine neue Übung auf der <strong>RadballHub</strong>-Plattform eingereicht:</p>
            <div style='background: #f3f4f6; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0;'>
                <p style='margin: 0; font-size: 16px; font-weight: bold;'>" . htmlspecialchars($exerciseTitle) . "</p>
                <p style='margin: 5px 0 0 0; color: #666;'>ID: #$exerciseId $authorText</p>
            </div>
            <p>Bitte prüfe die Übung im Administrationsbereich:</p>
            <p><a href='https://radballhub.rve1922.de/#/admin/moderation' style='display: inline-block; background: #2563eb; color: #fff; padding: 10px 18px; text-decoration: none; border-radius: 5px;'>Zur Review-Ansicht</a></p>
        </div>
    ";

    return sendSmtpMail(ADMIN_EMAIL, 'RadballHub Admin', $subject, $body);
}

/**
 * Benutzer-Benachrichtigung bei Freigabe oder Ablehnung
 */
function sendStatusNotificationEmail(string $userEmail, string $userName, string $exerciseTitle, string $status, ?string $rejectionReason = null): bool {
    $isApproved = ($status === 'approved');
    $subject = $isApproved 
        ? "Deine Übung '$exerciseTitle' wurde freigegeben!" 
        : "Rückmeldung zu deiner Übung '$exerciseTitle'";

    $color = $isApproved ? '#16a34a' : '#dc2626';
    $statusText = $isApproved ? 'Erfolgreich freigegeben' : 'Nicht freigegeben / Überarbeitung erforderlich';

    $reasonHtml = '';
    if (!$isApproved && $rejectionReason) {
        $reasonHtml = "
            <div style='background: #fef2f2; padding: 12px; border: 1px solid #fecaca; border-radius: 4px; margin: 15px 0;'>
                <strong>Begründung des Moderators:</strong><br>
                " . nl2br(htmlspecialchars($rejectionReason)) . "
            </div>
        ";
    }

    $body = "
        <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
            <h2 style='color: $color;'>Status-Update zu deiner Übung</h2>
            <p>Hallo " . htmlspecialchars($userName) . ",</p>
            <p>der Status deiner eingereichten Übung <strong>" . htmlspecialchars($exerciseTitle) . "</strong> wurde aktualisiert:</p>
            <p style='font-size: 16px; font-weight: bold; color: $color;'>Status: $statusText</p>
            $reasonHtml
            <p><a href='https://radballhub.rve1922.de/#/catalog' style='display: inline-block; background: #2563eb; color: #fff; padding: 10px 18px; text-decoration: none; border-radius: 5px;'>Zum Übungskatalog</a></p>
            <p style='color: #888; font-size: 12px; margin-top: 30px;'>RadballHub Trainingsplattform</p>
        </div>
    ";

    return sendSmtpMail($userEmail, $userName, $subject, $body);
}
