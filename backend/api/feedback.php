<?php
// =============================================================================
// RadballHub - Feedback & Änderungsvorschläge Controller
// =============================================================================

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/mailer.php';

function handleFeedbackRoute(string $method, array $data): void {
    if ($method !== 'POST') {
        jsonError('Methode nicht erlaubt', 405);
    }

    $db = getDbConnection();

    $exerciseId = (int)($data['exercise_id'] ?? 0);
    $message = trim($data['message'] ?? '');
    $type = $data['type'] ?? 'change_suggestion';
    $userId = (int)($data['user_id'] ?? 1);

    if ($exerciseId <= 0 || empty($message)) {
        jsonError('Übungs-ID und Nachrichtentext sind erforderlich', 422);
    }

    $stmt = $db->prepare("SELECT title FROM exercises WHERE id = ?");
    $stmt->execute([$exerciseId]);
    $exercise = $stmt->fetch();
    if (!$exercise) {
        jsonError('Übung nicht gefunden', 404);
    }

    $stmtInsert = $db->prepare("
        INSERT INTO exercise_feedback_and_reviews (exercise_id, user_id, type, message, status)
        VALUES (?, ?, ?, ?, 'open')
    ");
    $stmtInsert->execute([$exerciseId, $userId, $type, $message]);
    $feedbackId = (int)$db->lastInsertId();

    // Admin per Mail benachrichtigen
    $subject = "Neues Feedback zu Übung: " . $exercise['title'];
    $body = "
        <div style='font-family: Arial, sans-serif; line-height: 1.6;'>
            <h3 style='color: #2563eb;'>Neues Feedback eingegangen</h3>
            <p>Zur Übung <strong>" . htmlspecialchars($exercise['title']) . "</strong> (#$exerciseId) wurde folgendes Feedback übermittelt:</p>
            <blockquote style='background: #f3f4f6; padding: 12px; border-left: 3px solid #2563eb; margin: 15px 0;'>
                " . nl2br(htmlspecialchars($message)) . "
            </blockquote>
        </div>
    ";
    sendSmtpMail(ADMIN_EMAIL, 'RadballHub Admin', $subject, $body);

    jsonResponse([
        'success' => true,
        'message' => 'Vielen Dank für dein Feedback! Der Moderator wurde informiert.',
        'id'      => $feedbackId,
    ], 201);
}
