<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\OutboxMessage;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PlatformTransactionTest extends TestCase
{
    use RefreshDatabase;

    public function test_failed_audit_rolls_back_the_business_write_and_its_outbox_intent(): void
    {
        $intentWritten = false;
        try {
            DB::transaction(function () use (&$intentWritten) {
                $user = User::factory()->create();
                OutboxMessage::create([
                    'kind' => 'account.created', 'aggregate_id' => $user->id,
                    'recipient_id' => $user->id, 'delivery_key' => 'event:recipient:inbox',
                    'payload' => ['entity_id' => $user->id], 'available_at' => now(),
                ]);
                $intentWritten = true;
                AuditLog::create(['actor_id' => $user->id]);
            });
            $this->fail('An audit without an action must fail.');
        } catch (QueryException) {
            $this->assertTrue($intentWritten);
            $this->assertDatabaseCount('users', 0);
            $this->assertDatabaseCount('outbox_messages', 0);
            $this->assertDatabaseCount('audit_logs', 0);
        }
    }

    public function test_committed_intents_remain_available_without_a_queue_broker(): void
    {
        $user = DB::transaction(function () {
            $user = User::factory()->create();
            AuditLog::create(['actor_id' => $user->id, 'action' => 'account.created']);
            OutboxMessage::create([
                'kind' => 'account.created', 'aggregate_id' => $user->id,
                'recipient_id' => $user->id, 'delivery_key' => 'unique-event',
                'payload' => ['entity_id' => $user->id], 'available_at' => now(),
            ]);

            return $user;
        });

        $intent = OutboxMessage::firstOrFail();
        $this->assertSame($user->id, $intent->recipient_id);
        $this->assertNull($intent->claimed_at);
        $this->assertNull($intent->delivered_at);
        $this->assertSame(0, $intent->attempts);
        $this->assertDatabaseCount('audit_logs', 1);
    }

    public function test_delivery_payload_is_encrypted_at_rest_and_hidden_from_serialization(): void
    {
        $intent = OutboxMessage::create([
            'kind' => 'activation.mail', 'aggregate_id' => 'challenge-id',
            'delivery_key' => 'mail-event', 'payload' => ['code' => '123456'],
            'available_at' => now(), 'expires_at' => now()->addMinutes(10),
        ]);

        $this->assertStringNotContainsString('123456', $intent->getRawOriginal('payload'));
        $this->assertSame(['code' => '123456'], $intent->fresh()->payload);
        $this->assertArrayNotHasKey('payload', $intent->toArray());
    }

    public function test_duplicate_delivery_keys_cannot_create_two_intents(): void
    {
        $attributes = ['kind' => 'test', 'aggregate_id' => 'event-id', 'delivery_key' => 'same-key',
            'payload' => [], 'available_at' => now()];
        OutboxMessage::create($attributes);

        $this->expectException(QueryException::class);
        OutboxMessage::create($attributes);
    }

    public function test_audit_evidence_survives_removal_of_its_actor(): void
    {
        $user = User::factory()->create();
        $audit = AuditLog::create(['actor_id' => $user->id, 'actor_role' => 'admin', 'action' => 'account.created']);
        $user->delete();

        $this->assertNull($audit->fresh()->actor_id);
        $this->assertSame('admin', $audit->fresh()->actor_role);
        $this->assertDatabaseCount('audit_logs', 1);
    }
}
