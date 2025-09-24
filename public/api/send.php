<?php
// /api/send.php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
  exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true); // posíláme JSON z fetch()

if (!is_array($data)) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Invalid payload']);
  exit;
}

// honeypot (skryté pole "website"): když není prázdné, tváříme se jako OK
if (!empty($data['website'] ?? '')) {
  echo json_encode(['ok' => true]);
  exit;
}

$first   = trim((string)($data['first']   ?? ''));
$last    = trim((string)($data['last']    ?? ''));
$company = trim((string)($data['company'] ?? ''));
$email   = trim((string)($data['email']   ?? ''));
$phone   = trim((string)($data['phone']   ?? ''));
$message = trim((string)($data['message'] ?? ''));

if ($first === '' || $last === '' || $email === '' || $message === '') {
  http_response_code(422);
  echo json_encode(['ok' => false, 'error' => 'Missing required fields']);
  exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(422);
  echo json_encode(['ok' => false, 'error' => 'Invalid email']);
  exit;
}

/* ==== UPRAV TADY ==== */
$to   = 'le@voph.cz';   // ← kam se má e-mail poslat
$from = 'info@one-shop.cz';       // ← adresa na tvé doméně (kvůli SPF)
/* ==================== */

$subject = 'Nová poptávka spolupráce z webu';
$body = "Jméno: $first $last\n"
      . "Společnost: $company\n"
      . "E-mail: $email\n"
      . "Telefon: $phone\n"
      . "----------------------\n"
      . "$message\n";

$headers = [];
$headers[] = "From: OneShop <$from>";
$headers[] = "Reply-To: $email";
$headers[] = "MIME-Version: 1.0";
$headers[] = "Content-Type: text/plain; charset=UTF-8";

$ok = @mail($to, '=?UTF-8?B?'.base64_encode($subject).'?=', $body, implode("\r\n", $headers));

if ($ok) echo json_encode(['ok' => true]);
else { http_response_code(500); echo json_encode(['ok' => false, 'error' => 'Mail send failed']); }
