<?php

use Illuminate\Support\Str;

$DATABASE_URL = env('DATABASE_URL');
$dbConfig = [];

if ($DATABASE_URL) {
    $parsedUrl = parse_url($DATABASE_URL);
    $dbConfig = [
        'driver'         => 'pgsql',
        'host'           => $parsedUrl['host'] ?? 'localhost',
        'port'           => $parsedUrl['port'] ?? 5432,
        'database'       => ltrim($parsedUrl['path'] ?? 'feridhootours', '/'),
        'username'       => urldecode($parsedUrl['user'] ?? 'postgres'),
        'password'       => urldecode($parsedUrl['pass'] ?? ''),
        'charset'        => 'utf8',
        'prefix'         => '',
        'prefix_indexes' => true,
        'search_path'    => 'public',
        'sslmode'        => env('DB_SSLMODE', 'prefer'),
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
            'host'           => env('DB_HOST', 'postgres'),
            'port'           => env('DB_PORT', '5432'),
            'database'       => env('DB_DATABASE', 'feridhootours'),
            'username'       => env('DB_USERNAME', 'postgres'),
            'password'       => env('DB_PASSWORD', 'secret123'),
            'charset'        => 'utf8',
            'prefix'         => '',
            'prefix_indexes' => true,
            'search_path'    => 'public',
            'sslmode'        => env('DB_SSLMODE', 'prefer'),
        ],

    ],

    'redis' => [

        'client' => env('REDIS_CLIENT', 'phpredis'),

        'default' => [
            'url' => env('REDIS_URL'),
            'host' => env('REDIS_HOST', 'redis'),
            'username' => env('REDIS_USERNAME'),
            'password' => env('REDIS_PASSWORD'),
            'port' => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_DB', '0'),
        ],

        'cache' => [
            'url' => env('REDIS_URL'),
            'host' => env('REDIS_HOST', 'redis'),
            'username' => env('REDIS_USERNAME'),
            'password' => env('REDIS_PASSWORD'),
            'port' => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_CACHE_DB', '1'),
        ],

    ],

    'migrations' => 'migrations',

];
