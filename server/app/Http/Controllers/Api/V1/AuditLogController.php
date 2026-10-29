<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\AuditLogReadRequest;
use App\Http\Resources\AuditLogResource;
use App\Jobs\BuildAuditExport;
use App\Models\AuditExport;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AuditLogController extends Controller
{
    public function index(AuditLogReadRequest $request)
    {
        return AuditLogResource::collection($this->query($request)->paginate($request->integer('per_page', 15))->withQueryString());
    }

    public function export(AuditLogReadRequest $request): StreamedResponse
    {
        $format = $request->validated('format', 'csv');
        $query = $this->query($request)->orderBy('created_at', $request->validated('sort', 'desc'))->orderBy('id', 'desc');
        $filename = 'audit_logs.'.($format === 'jsonl' ? 'jsonl' : 'csv');

        $actor = $request->user();
        AuditLog::query()->create(['actor_id' => $actor->id, 'actor_role' => $actor->profile?->role?->value, 'action' => 'audit.export.started', 'entity_type' => 'audit_log', 'details' => ['format' => $format]]);

        return response()->streamDownload(function () use ($query, $format, $request, $actor): void {
            $out = fopen('php://output', 'wb');
            try {
                if ($format === 'csv') {
                    fputcsv($out, ['id', 'actor_id', 'actor_email', 'actor_role', 'action', 'entity_type', 'entity_id', 'details', 'request_id', 'created_at']);
                }
                $query->with('actor')->chunkById($request->integer('batch_size', 1000), function ($rows) use ($out, $format): void {
                    foreach ($rows as $row) {
                        $data = (new AuditLogResource($row))->resolve();
                        if ($format === 'jsonl') {
                            fwrite($out, json_encode($data, JSON_UNESCAPED_SLASHES)."\n");
                        } else {
                            fputcsv($out, array_map(static fn ($value): string => preg_match('/^[=+\-@\s\x00-\x1F]/u', (string) $value) ? "'".(string) $value : (string) $value, [$data['id'], $data['actor_id'], $data['actor_email'], $data['actor_role'], $data['action'], $data['entity_type'], $data['entity_id'], json_encode($data['details']), $data['request_id'], $data['created_at']]));
                        }
                    }
                }, 'id', 'id');
                fclose($out);
                AuditLog::query()->create(['actor_id' => $actor->id, 'actor_role' => $actor->profile?->role?->value, 'action' => 'audit.export.completed', 'entity_type' => 'audit_log', 'details' => ['format' => $format]]);
            } catch (\Throwable $exception) {
                if (is_resource($out)) {
                    fclose($out);
                }
                AuditLog::query()->create(['actor_id' => $actor->id, 'actor_role' => $actor->profile?->role?->value, 'action' => 'audit.export.failed', 'entity_type' => 'audit_log', 'details' => ['format' => $format, 'error' => $exception->getMessage()]]);
                throw $exception;
            }
        }, $filename, ['Content-Type' => $format === 'jsonl' ? 'application/x-ndjson' : 'text/csv']);
    }

    public function queue(AuditLogReadRequest $request): JsonResponse
    {
        $export = AuditExport::query()->create(['actor_id' => $request->user()->id, 'format' => $request->validated('format', 'jsonl'), 'filters' => $request->validated(), 'status' => 'queued']);
        AuditLog::query()->create(['actor_id' => $request->user()->id, 'actor_role' => $request->user()->profile?->role?->value, 'action' => 'audit.export.started', 'entity_type' => 'audit_export', 'entity_id' => $export->id, 'details' => ['format' => $export->format, 'queued' => true]]);
        BuildAuditExport::dispatch($export->id);

        return response()->json(['data' => ['id' => $export->id, 'status' => $export->status]], 202);
    }

    public function status(AuditExport $export): JsonResponse
    {
        abort_unless($export->actor_id === request()->user()->id || request()->user()->can('viewAny', User::class), 403);

        return response()->json(['data' => ['id' => $export->id, 'status' => $export->status, 'download_url' => $export->status === 'completed' ? route('logs.export.download', $export) : null, 'error' => $export->error]]);
    }

    public function download(AuditExport $export): StreamedResponse
    {
        abort_unless($export->status === 'completed' && ($export->actor_id === request()->user()->id || request()->user()->can('viewAny', User::class)), 404);

        return response()->download(storage_path('app/'.$export->path), 'audit_logs.'.$export->format);
    }

    private function query(AuditLogReadRequest $request): Builder
    {
        $query = AuditLog::query()->with('actor');
        foreach (['action', 'entity_type'] as $field) {
            if ($request->filled($field === 'entity_type' ? 'entity' : $field)) {
                $query->where($field, $request->validated($field === 'entity_type' ? 'entity' : $field));
            }
        }
        if ($request->filled('actor_role')) {
            $query->where('actor_role', $request->validated('actor_role'));
        }
        if ($request->filled('search')) {
            $query->where('action', 'like', '%'.$request->validated('search').'%');
        }
        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->date('date_from')->startOfDay());
        }
        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->date('date_to')->endOfDay());
        }

        return $query->orderBy('created_at', $request->validated('sort', 'desc'))->orderBy('id', $request->validated('sort', 'desc'));
    }
}
