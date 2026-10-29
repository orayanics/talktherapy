<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\PhonemeAssessmentRequest;
use App\Services\PhonemeClient;
use Illuminate\Http\JsonResponse;

class PhonemeAssessmentController extends Controller
{
    public function __invoke(PhonemeAssessmentRequest $request, PhonemeClient $client): JsonResponse
    {
        $assessment = $client->assess(
            $request->file('audio'),
            $request->validated('reference_text'),
            (string) $request->attributes->get('request_id'),
        );

        return response()->json(['data' => $assessment]);
    }
}
