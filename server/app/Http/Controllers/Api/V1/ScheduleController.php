<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\SaveSchedule;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreScheduleRequest;
use App\Http\Resources\ScheduleResource;
use Illuminate\Http\JsonResponse;

class ScheduleController extends Controller
{
    public function store(StoreScheduleRequest $request, SaveSchedule $saveSchedule): JsonResponse
    {
        $schedule = $saveSchedule->create(
            $request->user(),
            $request->validated(),
            $request->attributes->get('request_id'),
        );

        return ScheduleResource::make($schedule)->response()->setStatusCode(201);
    }
}
