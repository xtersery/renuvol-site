<?php
/**
 * RENUVOL — диагностика связи с Telegram.
 *
 * Откройте в браузере: https://renuvol.ru/api/test.php
 * Скрипт покажет, что именно отвечает Telegram.
 *
 * ⚠️ ПОСЛЕ ПРОВЕРКИ УДАЛИТЕ ЭТОТ ФАЙЛ С ХОСТИНГА.
 */

define('TG_BOT_TOKEN', '8475065292:AAEKvjRT0Jj6c5j9HyDUFXhlmFRCEIKaa3k');
define('TG_CHAT_ID', '1053983931');

header('Content-Type: text/plain; charset=utf-8');

echo "PHP: " . PHP_VERSION . "\n";
echo "curl: " . (function_exists('curl_init') ? 'есть' : 'НЕТ — это и есть причина') . "\n";
echo "mail(): " . (function_exists('mail') ? 'есть' : 'нет') . "\n";
echo str_repeat('-', 50) . "\n";

if (!function_exists('curl_init')) {
    exit("Без curl отправка в Telegram невозможна — включите расширение curl в панели reg.ru.\n");
}

$call = static function (string $method, array $payload = []): string {
    $ch = curl_init('https://api.telegram.org/bot' . TG_BOT_TOKEN . '/' . $method);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS     => json_encode($payload),
        CURLOPT_TIMEOUT        => 15,
    ]);
    $body = curl_exec($ch);
    $err  = curl_error($ch);
    $code = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    return "HTTP $code" . ($err ? " | curl-ошибка: $err" : '') . "\nОтвет Telegram:\n$body\n";
};

echo "1) Проверка токена (getMe):\n";
echo $call('getMe');
echo str_repeat('-', 50) . "\n";

echo "2) Тестовое сообщение в чат " . TG_CHAT_ID . " (sendMessage):\n";
echo $call('sendMessage', [
    'chat_id' => TG_CHAT_ID,
    'text'    => "Тест с renuvol.ru: связь сайта с Telegram работает. (" . date('d.m.Y H:i') . ')',
]);
echo str_repeat('-', 50) . "\n";

echo "Как читать результат:\n";
echo "• \"ok\":true в обоих пунктах — всё работает, сообщение уже в Telegram.\n";
echo "• \"error_code\":403 — вы ни разу не нажали /start в диалоге с ботом.\n";
echo "  Откройте своего бота в Telegram и нажмите «Запустить» / /start.\n";
echo "• \"error_code\":400, chat not found — неверный TG_CHAT_ID.\n";
echo "• \"error_code\":401 — неверный токен бота.\n";
echo "• curl-ошибка / таймаут — хостинг блокирует исходящие запросы\n";
echo "  к api.telegram.org (надо писать в поддержку reg.ru).\n";
