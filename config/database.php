<?php

use Illuminate\Support\Str;

$DATABASE_URL = env('DATABASE_URL');
$dbConfig = [];

if ($DATABASE_URL) {
    $parsedUrl = parse_url($DATABASE_URL);
    $dbConfig = [
        'driver' => 'pgsql',
        'host' => $parsedUrl['host'] ?? 'localhost',
        'port' => $parsedUrl['port'] ?? 5432,
        'database' => ltrim($parsedUrl['path'] ?? 'neondb', '/'),
        'username' => $parsedUrl['user'] ?? 'postgres',
        'password' => $parsedUrl['pass'] ?? '',
        'sslmode' => 'require',
        'charset' => 'utf8',
        'prefix' => '',
        'prefix_indexes' => true,
        'search_path' => 'public',
    ];
}

return [

    'default' => env('DB_CONNECTION', 'pgsql'),

    'connections' => [

        'sqlite' => [
            'driver' => 'sqlite',
            'url' => env('DATABASE_URL'),
            'database' => env('DB_DATABASE', database_path('database.sqlite')),
            'prefix' => '',
            'foreign_key_constraints' => env('DB_FOREIGN_KEYS', true),
        ],

        'pgsql' => !empty($dbConfig) ? $dbConfig : [
            'driver' => 'pgsql',
            'url' => env('DATABASE_URL'),
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', '5432'),
            'database' => env('DB_DATABASE', 'neondb'),
            'username' => env('DB_USERNAME', 'postgres'),
            'password' => env('DB_PASSWORD', ''),
            'charset' => 'utf8',
            'prefix' => '',
            'prefix_indexes' => true,
            'search_path' => 'public',
            'sslmode' => env('DB_SSLMODE', 'require'),
        ],

    ],

    'migrations' => 'migrations',

];
