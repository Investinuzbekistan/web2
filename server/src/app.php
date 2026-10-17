<?php
/**
 * Shared bootstrap: configuration, the registration record and its
 * validation, and the few helpers both entry points need.
 *
 * Nothing in here prints anything or decides a status code. public/api.php
 * and public/index.php do that.
 */

declare(strict_types=1);

require_once __DIR__ . '/storage.php';

function app_config(): array
{
    static $config = null;
    if ($config !== null) {
        return $config;
    }
    $own = __DIR__ . '/config.php';
    $config = is_file($own)
        ? require $own
        : require __DIR__ . '/config.example.php';
    return $config;
}

/** The two kinds of participant. Both answer the same questions. */
const ROLES = ['guest', 'speaker'];

/**
 * The thematic directions, as ids.
 *
 * The same six the site shows in chapter III. A direction is optional on the
 * form, and anything not in this list is dropped rather than stored, so the
 * admin's filter can never be handed a value it has no label for.
 */
const DIRECTIONS = ['infrastructure', 'heritage', 'eco', 'wellness', 'leisure', 'transport'];

/** Every field the admin shows, in the order the CSV exports them. */
const FIELDS = [
    'id', 'created_at', 'role', 'full_name', 'organisation', 'position',
    'country', 'email', 'phone', 'direction', 'note', 'lang', 'status',
];

function app_str(array $src, string $key, int $max): string
{
    $value = $src[$key] ?? '';
    if (!is_string($value)) {
        return '';
    }
    // Control characters are stripped rather than escaped: there is no
    // legitimate newline in a name, and a stray one breaks the flat file.
    $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+/u', '', $value) ?? '';
    $value = trim(preg_replace('/\s+/u', ' ', $value) ?? '');
    return mb_substr($value, 0, $max);
}

/**
 * Turns a submitted payload into a row, or into a list of field names that
 * are wrong.
 *
 * The messages are not written here. The form knows the reader's language
 * and the API does not, so it answers with the field names and the page
 * says what it wants to say about them.
 *
 * @return array{0: array<string,string>, 1: string[]}
 */
function app_validate(array $input, string $ip): array
{
    $row = [
        'created_at'   => gmdate('c'),
        'role'         => app_str($input, 'role', 16),
        'full_name'    => app_str($input, 'full_name', 120),
        'organisation' => app_str($input, 'organisation', 160),
        'position'     => app_str($input, 'position', 120),
        'country'      => app_str($input, 'country', 80),
        'email'        => app_str($input, 'email', 160),
        'phone'        => app_str($input, 'phone', 40),
        'direction'    => app_str($input, 'direction', 32),
        'note'         => app_str($input, 'note', 1200),
        'lang'         => app_str($input, 'lang', 2),
        'status'       => 'new',
        'ip'           => $ip,
    ];

    $bad = [];
    if (!in_array($row['role'], ROLES, true)) {
        $bad[] = 'role';
    }
    foreach (['full_name', 'organisation', 'position', 'country', 'phone'] as $field) {
        if (mb_strlen($row[$field]) < 2) {
            $bad[] = $field;
        }
    }
    if (!filter_var($row['email'], FILTER_VALIDATE_EMAIL)) {
        $bad[] = 'email';
    }
    if ($row['direction'] !== '' && !in_array($row['direction'], DIRECTIONS, true)) {
        $row['direction'] = '';
    }
    if (!in_array($row['lang'], ['uz', 'ru', 'en'], true)) {
        $row['lang'] = 'uz';
    }

    return [$row, $bad];
}

/** The address the request came from, honouring one reverse proxy. */
function app_client_ip(): string
{
    $forwarded = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
    if (is_string($forwarded) && $forwarded !== '') {
        $first = trim(explode(',', $forwarded)[0]);
        if (filter_var($first, FILTER_VALIDATE_IP)) {
            return $first;
        }
    }
    $remote = $_SERVER['REMOTE_ADDR'] ?? '';
    return is_string($remote) ? $remote : '';
}

function app_json(int $status, array $body): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

function app_h(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
