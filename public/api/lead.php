<?php
/**
 * RENUVOL — приём заявок с сайта.
 *
 * Каждая заявка:
 *   1. записывается в файл заявок (чтобы не потерять при сбое доставки),
 *   2. отправляется в Telegram (Bot API),
 *   3. дублируется на e-mail (mail() хостинга).
 *
 * СЕКРЕТЫ ЗДЕСЬ НЕ ХРАНЯТСЯ. Токен и почта читаются из переменных окружения
 * или из renuvol-config.php рядом с сайтом (см. renuvol-config.sample.php).
 * Файл с токеном не должен попадать в репозиторий.
 */

// ---------- Конфигурация ------------------------------------------------------

/**
 * Порядок поиска настроек:
 *   1. переменные окружения (RENUVOL_TG_TOKEN, RENUVOL_TG_CHAT, RENUVOL_MAIL_TO);
 *   2. renuvol-config.php на уровень выше корня сайта;
 *   3. renuvol-config.php в корне сайта.
 *
 * Второй вариант предпочтительнее: файл вообще недоступен по HTTP. Третий
 * тоже безопасен — PHP исполняет файл, а не отдаёт исходник, — и проще в
 * заливке на shared-хостинг.
 */
$config = [
    'tg_token' => getenv('RENUVOL_TG_TOKEN') ?: '',
    'tg_chat'  => getenv('RENUVOL_TG_CHAT') ?: '',
    'mail_to'  => getenv('RENUVOL_MAIL_TO') ?: '',
];

foreach ([dirname(__DIR__, 2) . '/renuvol-config.php', dirname(__DIR__) . '/renuvol-config.php'] as $candidate) {
    if (is_readable($candidate)) {
        $fromFile = require $candidate;
        if (is_array($fromFile)) {
            $config = array_merge($config, array_filter($fromFile, static fn($v) => $v !== '' && $v !== null));
        }
        break;
    }
}

// Домены, с которых разрешены заявки (CORS + защита от чужих сайтов).
$ALLOWED_ORIGINS = [
    'https://renuvol.ru',
    'https://www.renuvol.ru',
];

// Куда писать заявки и ошибки доставки. Вне корня сайта: по HTTP не открыть.
$LEADS_FILE = $config['leads_file'] ?? sys_get_temp_dir() . '/renuvol-leads.log';
$LOG_FILE   = $config['log_file'] ?? sys_get_temp_dir() . '/renuvol-lead-errors.log';

// Не больше стольких заявок с одного IP за окно (секунды).
const RATE_LIMIT_MAX    = 5;
const RATE_LIMIT_WINDOW = 600;

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

// ---------- Ограничение частоты -----------------------------------------------

$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$bucket = sys_get_temp_dir() . '/renuvol-rate-' . sha1($ip) . '.json';
$hits = [];
if (is_readable($bucket)) {
    $hits = json_decode((string)file_get_contents($bucket), true) ?: [];
}
$now = time();
$hits = array_values(array_filter($hits, static fn($t) => $now - $t < RATE_LIMIT_WINDOW));

if (count($hits) >= RATE_LIMIT_MAX) {
    http_response_code(429);
    echo json_encode(['ok' => false, 'error' => 'rate_limited']);
    exit;
}

// ---------- Чтение и валидация ------------------------------------------------

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    $data = $_POST; // запасной вариант — обычная форма
}

/** Обрезает по длине и убирает переводы строк из коротких полей. */
$clean = static function (string $key, int $max = 500, bool $singleLine = true) use ($data): string {
    $value = trim((string)($data[$key] ?? ''));
    if ($singleLine) {
        $value = str_replace(["\r", "\n"], ' ', $value);
    }
    return mb_substr($value, 0, $max);
};

// Honeypot: поле скрыто от человека, боты заполняют его вслепую. Отвечаем
// успехом, чтобы не подсказывать боту, что он распознан.
if (trim((string)($data['website'] ?? '')) !== '') {
    echo json_encode(['ok' => true]);
    exit;
}

$name    = $clean('name', 120);
$contact = $clean('contact', 120);
$email   = $clean('email', 200);
$comment = $clean('comment', 2000, false);
$profile = $clean('profile', 200);
$consent = !empty($data['consent']);

$errors = [];
if ($name === '')                               $errors[] = 'name';
if ($contact === '')                            $errors[] = 'contact';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'email';
if (!$consent)                                  $errors[] = 'consent';

if ($errors) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'validation', 'fields' => $errors]);
    exit;
}

// Квоту тратит только принятая заявка: опечатка в почте не должна
// приближать человека к «слишком много попыток».
$hits[] = $now;
@file_put_contents($bucket, json_encode($hits), LOCK_EX);

// ---------- Текст заявки --------------------------------------------------------

$escape = static fn(string $s): string => htmlspecialchars($s, ENT_QUOTES, 'UTF-8');

$text =
    "🆕 <b>Заявка с renuvol.ru</b>\n\n" .
    "👤 <b>Имя:</b> " . $escape($name) . "\n" .
    "📱 <b>Телефон / Telegram:</b> " . $escape($contact) . "\n" .
    "✉️ <b>E-mail:</b> " . $escape($email) . "\n" .
    ($profile !== '' ? "🎯 <b>Профиль пациентов:</b> " . $escape($profile) . "\n" : '') .
    ($comment !== '' ? "💬 <b>Комментарий:</b> " . $escape($comment) . "\n" : '') .
    "\n🕒 " . date('d.m.Y H:i');

$plain = html_entity_decode(strip_tags(str_replace(['<b>', '</b>'], '', $text)), ENT_QUOTES, 'UTF-8');

// Пишем заявку на диск ДО отправки: если и Telegram, и почта отвалятся,
// контакт всё равно останется.
@file_put_contents(
    $LEADS_FILE,
    date('c') . ' ' . json_encode(
        compact('name', 'contact', 'email', 'profile', 'comment'),
        JSON_UNESCAPED_UNICODE
    ) . "\n",
    FILE_APPEND | LOCK_EX
);

// ---------- Отправка в Telegram --------------------------------------------------

$tgOk = false;
if ($config['tg_token'] !== '' && $config['tg_chat'] !== '' && function_exists('curl_init')) {
    $ch = curl_init('https://api.telegram.org/bot' . $config['tg_token'] . '/sendMessage');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS     => json_encode([
            'chat_id'    => $config['tg_chat'],
            'text'       => $text,
            'parse_mode' => 'HTML',
        ]),
        CURLOPT_TIMEOUT        => 10,
    ]);
    $response = curl_exec($ch);
    $curlErr  = curl_error($ch);
    $code     = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);

    $tgOk = ($code >= 200 && $code < 300);
    if (!$tgOk) {
        @file_put_contents(
            $LOG_FILE,
            date('c') . " TG HTTP $code" . ($curlErr ? " curl: $curlErr" : '') . ' | ' . $response . "\n",
            FILE_APPEND | LOCK_EX
        );
    }
}

// ---------- Отправка на e-mail ----------------------------------------------------

$mailOk = false;
if ($config['mail_to'] !== '' && function_exists('mail')) {
    $subject = '=?UTF-8?B?' . base64_encode('Заявка с renuvol.ru — ' . $name) . '?=';
    $headers = implode("\r\n", [
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'From: RENUVOL Site <noreply@renuvol.ru>',
        // $email прошёл FILTER_VALIDATE_EMAIL, поэтому CRLF в заголовок не попадёт.
        'Reply-To: ' . $email,
    ]);
    $mailOk = mail($config['mail_to'], $subject, $plain, $headers);
}

// ---------- Ответ ------------------------------------------------------------------

if ($tgOk || $mailOk) {
    echo json_encode(['ok' => true]);
} else {
    // Заявка уже сохранена в $LEADS_FILE — потеряться она не может.
    @file_put_contents(
        $LOG_FILE,
        date('c') . " delivery_failed (tg=" . var_export($tgOk, true) . " mail=" . var_export($mailOk, true) . ")\n",
        FILE_APPEND | LOCK_EX
    );
    http_response_code(502);
    echo json_encode(['ok' => false, 'error' => 'delivery_failed']);
}
