<?php

return [

    'default' => env('CACHE_STORE', 'file'),

    'stores' => [

        'file' => [
            'driver' => 'file',
            'path' => storage_path('framework/cache/data'),
            'lock_path' => storage_path('framework/cache/data'),
        ],

        'redis' => [
            'driver' => 'redis',
            'connection' => 'cache',
            'lock_connection' => 'default',
        ],

        'array' => [
            'driver' => 'array',
            'serialize' => false,
        ],

        'null' => [
            'driver' => 'null',
        ],

    ],

    'prefix' => env('CACHE_PREFIX', 'feridhootours_cache'),

];
