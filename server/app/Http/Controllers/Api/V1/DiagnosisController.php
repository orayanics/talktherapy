<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\DiagnosisResource;
use App\Models\Diagnosis;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DiagnosisController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(): AnonymousResourceCollection
    {
        return DiagnosisResource::collection(Diagnosis::query()->orderBy('label')->orderBy('id')->get());
    }
}
