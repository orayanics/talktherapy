<?php

namespace App\Console\Commands;

use App\Actions\IssueActivationChallenge;
use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\AuditLog;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

#[Signature('app:bootstrap-superadmin {name} {email}')]
#[Description('Create the first superadmin invitation on a fresh installation')]
class BootstrapSuperadmin extends Command
{
    public function handle(IssueActivationChallenge $issuer): int
    {
        $name = trim((string) $this->argument('name'));
        $email = mb_strtolower(trim((string) $this->argument('email')));

        if ($name === '' || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('A name and valid email address are required.');

            return self::FAILURE;
        }

        $user = Cache::lock('identity:bootstrap-superadmin', 10)->block(5, function () use ($email, $issuer, $name): ?User {
            return DB::transaction(function () use ($email, $issuer, $name): ?User {
                $hasPrivilegedAccount = UserProfile::query()
                    ->whereIn('role', [UserRole::Admin, UserRole::Superadmin])
                    ->exists();

                if ($hasPrivilegedAccount) {
                    return null;
                }

                $user = User::query()->create([
                    'name' => $name,
                    'email' => $email,
                    'password' => str()->random(64),
                ]);

                UserProfile::query()->create([
                    'user_id' => $user->id,
                    'role' => UserRole::Superadmin,
                    'status' => UserStatus::Pending,
                ]);

                $issuer->handle($user, $user->email);

                AuditLog::query()->create([
                    'actor_role' => 'system',
                    'action' => 'user.bootstrap_invited',
                    'entity_type' => 'user',
                    'entity_id' => $user->id,
                    'details' => ['role' => UserRole::Superadmin->value],
                ]);

                return $user;
            });
        });

        if ($user === null) {
            $this->error('A privileged account already exists; bootstrap was refused.');

            return self::FAILURE;
        }

        $this->info('The first superadmin invitation was created.');

        return self::SUCCESS;
    }
}
