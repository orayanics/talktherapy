<?php

namespace App\Console\Commands;

use App\Models\SlpRecording;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

#[Signature('app:cleanup-slp-recordings')]
#[Description('Remove expired private SLP recordings')]
class CleanupSlpRecordings extends Command
{
    public function handle(): int
    {
        $disk = Storage::disk('local');
        $removed = 0;
        SlpRecording::query()->whereNotNull('retention_until')->where('retention_until', '<=', now())->orderBy('id')->chunkById(100, function ($recordings) use ($disk, &$removed): void {
            foreach ($recordings as $recording) {
                if ($disk->exists($recording->path) && ! $disk->delete($recording->path)) {
                    $this->warn('Could not delete recording '.$recording->id);

                    continue;
                }
                $recording->delete();
                $removed++;
            }
        });
        $this->info("Removed {$removed} expired recording(s).");

        return self::SUCCESS;
    }
}
