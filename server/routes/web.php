<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['service' => 'TalkTherapy API', 'version' => 'v1']);
});
