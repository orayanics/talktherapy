<?php

use App\Http\Controllers\Auth\SessionController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['service' => 'TalkTherapy API', 'version' => 'v1']);
});

Route::post('/login', [SessionController::class, 'store'])->middleware('throttle:10,1')->name('login');
Route::post('/logout', [SessionController::class, 'destroy'])->middleware('auth')->name('logout');
