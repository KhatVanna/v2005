<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| V2005 API Routes
|--------------------------------------------------------------------------
|
| Base path is /api (configured by Laravel). Versioned routes are loaded
| under /api/v1.
|
*/

Route::prefix('v1')->group(base_path('routes/api/v1.php'));
