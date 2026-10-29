<?php

namespace App\Jobs;

use App\Models\AuditExport;
use App\Models\AuditLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class BuildAuditExport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public string $exportId) {}

    public function handle(): void
    {
        $export = AuditExport::query()->findOrFail($this->exportId);
        $export->update(['status' => 'running']);
        $path = 'audit-exports/'.$export->id.'.'.$export->format;
        try {
            Storage::disk('local')->put($path, '');
            $handle = fopen(Storage::disk('local')->path($path), 'ab');
            $query = AuditLog::query()->with('actor')->orderBy('created_at')->orderBy('id');
            foreach ($export->filters ?? [] as $field => $value) {
                if (in_array($field, ['action', 'entity_type', 'actor_role'], true) && $value !== null && $value !== '') {
                    $query->where($field, $value);
                }
            }
            if ($export->format === 'xls') {
                fwrite($handle, '<table><thead><tr><th>id</th><th>actor_id</th><th>actor_email</th><th>actor_role</th><th>action</th><th>entity_type</th><th>entity_id</th><th>details</th><th>request_id</th><th>created_at</th></tr></thead><tbody>');
            }
            $query->chunkById(1000, function ($rows) use ($handle, $export): void {
                foreach ($rows as $row) {
                    $data = [
                        'id' => $row->id, 'actor_id' => $row->actor_id, 'actor_email' => $row->actor?->email,
                        'actor_role' => $row->actor_role, 'action' => $row->action, 'entity_type' => $row->entity_type,
                        'entity_id' => $row->entity_id, 'details' => $row->details ?? [], 'request_id' => $row->request_id,
                        'created_at' => $row->created_at?->toISOString(),
                    ];
                    if ($export->format === 'jsonl') {
                        fwrite($handle, json_encode($data, JSON_UNESCAPED_SLASHES)."\n");
                    } elseif ($export->format === 'xls') {
                        fwrite($handle, '<tr>'.implode('', array_map(static fn ($value): string => '<td>'.htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8').'</td>', array_values($data))).'</tr>');
                    } else {
                        fputcsv($handle, array_map(static fn ($value): string => preg_match('/^[=+\-@\s\x00-\x1F]/u', (string) $value) ? "'".(string) $value : (string) $value, array_values($data)));
                    }
                }
            }, 'id', 'id');
            if ($export->format === 'xls') {
                fwrite($handle, '</tbody></table>');
            }
            fclose($handle);
            $export->update(['status' => 'completed', 'path' => $path]);
            AuditLog::query()->create(['actor_id' => $export->actor_id, 'actor_role' => $export->actor?->profile?->role?->value, 'action' => 'audit.export.completed', 'entity_type' => 'audit_export', 'entity_id' => $export->id, 'details' => ['format' => $export->format]]);
        } catch (\Throwable $exception) {
            if (isset($handle) && is_resource($handle)) {
                fclose($handle);
            }
            $export->update(['status' => 'failed', 'error' => $exception->getMessage()]);
            AuditLog::query()->create(['actor_id' => $export->actor_id, 'actor_role' => $export->actor?->profile?->role?->value, 'action' => 'audit.export.failed', 'entity_type' => 'audit_export', 'entity_id' => $export->id]);
            throw $exception;
        }
    }
}
