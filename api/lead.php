<?php
/**
 * RENUVOL — приём заявок с сайта.
 *
 * Каждая заявка отправляется:
 *   1. В Telegram (через Bot API)
 *   2. На e-mail (через стандартный mail() хостинга)
 *
 * НАСТРОЙКА: заполните три константы ниже.
 */

// ---------- НАСТРОЙКА -------------------------------------------------------

// 1. Токен бота от @BotFather (например 1234567890:AAEhBOweik6ad9r_QXMENQjcrGbqCr4K-4c)
define('TG_BOT_TOKEN', '8475065292:AAEKvjRT0Jj6c5j9HyDUFXhlmFRCEIKaa3k');

// 2. ID чата, куда слать заявки. Узнать: напишите боту @userinfobot — он покажет ваш ID.
//    Для группы: добавьте бота в группу, ID будет вида -1001234567890.
define('TG_CHAT_ID', '1053983931');

// 3. Почта для резервной копии заявок.
define('MAIL_TO', 'ВСТАВЬТЕ_ПОЧТУ@example.com');

// Домены, с которых разрешены заявки (CORS + защита от чужих сайтов).
$ALLOWED_ORIGINS = [
    'https://renuvol.ru',
    'https://www.renuvol.ru',
];

// -----------------------------------------------------------------------------

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $ALLOWED_ORIGINS, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'method_not_allowed']);
    exit;
}

// ---------- Чтение и валидация ----------------------------------------------

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    $data = $_POST; // запасной вариант — обычная форма
}

$clean = static function (string $key, int $max = 500) use ($data): string {
    $value = trim((string)($data[$key] ?? ''));
    $value = mb_substr($value, 0, $max);
    // вырезаем переводы строк из коротких полей — защита от header injection
    return $value;
};

$name    = $clean('name', 120);
$contact = $clean('contact', 120);
$email   = $clean('email', 200);
$comment = $clean('comment', 2000);
$profile = $clean('profile', 200);
$consent = !empty($data['consent']);

$errors = [];
if ($name === '')                                    $errors[] = 'name';
if ($contact === '')                                 $errors[] = 'contact';
if (!filter_var($email, FILTER_VALIDATE_EMAIL))      $errors[] = 'email';
if (!$consent)                                       $errors[] = 'consent';

if ($errors) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'validation', 'fields' => $errors]);
    exit;
}

// ---------- Текст заявки -----------------------------------------------------

$escape = static fn(string $s): string => htmlspecialchars($s, ENT_QUOTES, 'UTF-8');

$text =
    "🆕 <b>Заявка с renuvol.ru</b>\n\n" .
    "👤 <b>Имя:</b> " . $escape($name) . "\n" .
    "📱 <b>Телефон / Telegram:</b> " . $escape($contact) . "\n" .
    "✉️ <b>E-mail:</b> " . $escape($email) . "\n" .
    ($profile !== '' ? "🎯 <b>Профиль пациентов:</b> " . $escape($profile) . "\n" : '') .
    ($comment !== '' ? "💬 <b>Комментарий:</b> " . $escape($comment) . "\n" : '') .
    "\n🕒 " . date('d.m.Y H:i') . " (МСК)";

$plain = html_entity_decode(strip_tags(str_replace(['<b>', '</b>'], '', $text)));

// ---------- Отправка в Telegram ----------------------------------------------

$tgOk = false;
if (TG_BOT_TOKEN !== 'ВСТАВЬТЕ_ТОКЕН_БОТА' && TG_CHAT_ID !== 'ВСТАВЬТЕ_CHAT_ID') {
    $url = 'https://api.telegram.org/bot' . TG_BOT_TOKEN . '/sendMessage';
    $payload = [
        'chat_id'    => TG_CHAT_ID,
        'text'       => $text,
        'parse_mode' => 'HTML',
    ];

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS     => json_encode($payload),
        CURLOPT_TIMEOUT        => 10,
    ]);
    $response = curl_exec($ch);
    $curlErr  = curl_error($ch);
    $code     = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);

    $tgOk = ($code >= 200 && $code < 300);
    if (!$tgOk) {
        // Пишем причину в api/lead.log — можно посмотреть, что ответил Telegram.
        @file_put_contents(
            __DIR__ . '/lead.log',
            date('c') . " TG HTTP $code" . ($curlErr ? " curl: $curlErr" : '') . ' | ' . $response . "\n",
            FILE_APPEND
        );
    }
}

// ---------- Отправка на e-mail ------------------------------------------------

$subject = '=?UTF-8?B?' . base64_encode('Заявка с renuvol.ru — ' . $name) . '?=';
$headers = implode("\r\n", [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: RENUVOL Site <noreply@renuvol.ru>',
    'Reply-To: ' . $email,
]);

$mailOk = false;
if (MAIL_TO !== 'ВСТАВЬТЕ_ПОЧТУ@example.com') {
    $mailOk = mail(MAIL_TO, $subject, $plain, $headers);
}

// ---------- Ответ --------------------------------------------------------------

if ($tgOk || $mailOk) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(502);
    echo json_encode(['ok' => false, 'error' => 'delivery_failed']);
}
