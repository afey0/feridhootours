<?php

use Illuminate\Support\Str;

$DATABASE_URL = env('DATABASE_URL');
$dbConfig = [];

if ($DATABASE_URL) {
    // Strip query string before parsing (Neon URLs have ?sslmode=require&channel_binding=require)
    $parsedUrl = parse_url($DATABASE_URL);
    $dbConfig = [
        'driver'         => 'pgsql',
        'host'           => $parsedUrl['host'] ?? 'localhost',
        'port'           => $parsedUrl['port'] ?? 5432,
        'database'       => ltrim($parsedUrl['path'] ?? 'neondb', '/'),
        'username'       => urldecode($parsedUrl['user'] ?? 'postgres'),
        'password'       => urldecode($parsedUrl['pass'] ?? ''),
        'charset'        => 'utf8',
        'prefix'         => '',
        'prefix_indexes' => true,
        'search_path'    => 'public',
        'sslmode'        => 'require',
        // PDO options for Neon SSL (channel_binding stripped — not supported by pdo_pgsql)
        'options'        => [
            PDO::ATTR_PERSISTENT => false,
        ],
    ];
}

return [

    'default' => env('DB_CONNECTION', 'pgsql'),

    'connections' => [

        'sqlite' => [
            'driver'                  => 'sqlite',
            'database'                => env('DB_DATABASE', database_path('database.sqlite')),
            'prefix'                  => '',
            'foreign_key_constraints' => env('DB_FOREIGN_KEYS', true),
        ],

        'pgsql' => !empty($dbConfig) ? $dbConfig : [
            'driver'         => 'pgsql',
            'host'           => env('DB_HOST', '127.0.0.1'),
            'port'           => env('DB_PORT', '5432'),
            'database'       => env('DB_DATABASE', 'neondb'),
            'username'       => env('DB_USERNAME', 'postgres'),
            'password'       => env('DB_PASSWORD', ''),
            'charset'        => 'utf8',
            'prefix'         => '',
            'prefix_indexes' => true,
            'search_path'    => 'public',
            'sslmode'        => env('DB_SSLMODE', 'require'),
        ],

    ],

    'migrations' => 'migrations',

];
