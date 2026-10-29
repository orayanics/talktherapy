<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Request as ClientRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PhonemeAssessmentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('services.phoneme.url', 'http://phoneme.test');
        config()->set('services.phoneme.token', 'server-only-secret');
        config()->set('services.phoneme.connect_timeout', 3);
        config()->set('services.phoneme.timeout', 45);
    }

    public function test_verified_active_user_can_assess_audio_through_private_python_service(): void
    {
        $user = $this->createActiveUser();
        Http::preventStrayRequests();
        $forwardedRequest = [];
        Http::fake(function (ClientRequest $request) use (&$forwardedRequest) {
            $forwardedRequest = [
                'url' => $request->url(),
                'token' => $request->header('X-Service-Token')[0] ?? null,
                'hasRequestId' => $request->hasHeader('X-Request-ID'),
                'hasAudio' => $request->hasFile('audio', filename: 'recording.wav'),
                'body' => $request->body(),
            ];

            return Http::response($this->assessment(), 200);
        });

        $this->actingAs($user)
            ->post('/api/v1/slp/assess', [
                'audio' => $this->fakeWavFile(),
                'reference_text' => 'She sells shells.',
            ], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('data.analysis.transcript', 'She sells shells.')
            ->assertJsonPath('data.analysis.structured.overall.status', 'mixed');

        $this->assertSame('http://phoneme.test/v1/assess', $forwardedRequest['url']);
        $this->assertSame('server-only-secret', $forwardedRequest['token']);
        $this->assertTrue($forwardedRequest['hasRequestId']);
        $this->assertTrue($forwardedRequest['hasAudio']);
        $this->assertStringContainsString('name="referenceText"', $forwardedRequest['body']);
        $this->assertStringContainsString('She sells shells.', $forwardedRequest['body']);
    }

    public function test_valid_empty_result_lists_are_accepted(): void
    {
        $assessment = $this->assessment();
        $assessment['analysis']['lowScoring'] = [];
        $assessment['analysis']['structured']['accurateUnits'] = [];
        $assessment['analysis']['structured']['needsWorkUnits'] = [];
        $assessment['analysis']['structured']['words'][0]['lowUnits'] = [];
        Http::preventStrayRequests();
        Http::fake(['phoneme.test/v1/assess' => Http::response($assessment, 200)]);

        $this->actingAs($this->createActiveUser())
            ->post('/api/v1/slp/assess', [
                'audio' => $this->fakeWavFile(),
                'reference_text' => 'She sells shells.',
            ], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('data.analysis.structured.accurateUnits', []);
    }

    public function test_assessment_requires_authentication_and_does_not_call_python(): void
    {
        Http::preventStrayRequests();

        $this->post('/api/v1/slp/assess', [
            'audio' => $this->fakeWavFile(),
            'reference_text' => 'She sells shells.',
        ], ['Accept' => 'application/json'])->assertUnauthorized();

        Http::assertNothingSent();
    }

    public function test_invalid_audio_or_reference_text_is_rejected_before_forwarding(): void
    {
        $user = $this->createActiveUser();
        Http::preventStrayRequests();

        $this->actingAs($user)
            ->post('/api/v1/slp/assess', [
                'audio' => UploadedFile::fake()->create('recording.mp3', 1, 'audio/mpeg'),
                'reference_text' => str_repeat('a', 801),
            ], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonPath('code', 'validation_failed');

        Http::assertNothingSent();
    }

    public function test_invalid_upstream_dto_is_returned_as_a_safe_bad_gateway_error(): void
    {
        $user = $this->createActiveUser();
        Http::preventStrayRequests();
        Http::fake(['phoneme.test/v1/assess' => Http::response(['analysis' => ['transcript' => 'private']], 200)]);

        $this->actingAs($user)
            ->post('/api/v1/slp/assess', [
                'audio' => $this->fakeWavFile(),
                'reference_text' => 'She sells shells.',
            ], ['Accept' => 'application/json'])
            ->assertStatus(502)
            ->assertJsonPath('code', 'invalid_upstream_response')
            ->assertDontSee('private');
    }

    public function test_out_of_range_upstream_scores_are_rejected(): void
    {
        $user = $this->createActiveUser();
        $assessment = $this->assessment();
        $assessment['analysis']['lowScoring'][0]['score'] = 101;
        Http::preventStrayRequests();
        Http::fake(['phoneme.test/v1/assess' => Http::response($assessment, 200)]);

        $this->actingAs($user)
            ->post('/api/v1/slp/assess', [
                'audio' => $this->fakeWavFile(),
                'reference_text' => 'She sells shells.',
            ], ['Accept' => 'application/json'])
            ->assertStatus(502)
            ->assertJsonPath('code', 'invalid_upstream_response');
    }

    public function test_upstream_unavailability_is_mapped_without_exposing_its_body(): void
    {
        $user = $this->createActiveUser();
        Http::preventStrayRequests();
        Http::fake(['phoneme.test/v1/assess' => Http::response(['detail' => 'private decoder error'], 503)]);

        $this->actingAs($user)
            ->post('/api/v1/slp/assess', [
                'audio' => $this->fakeWavFile(),
                'reference_text' => 'She sells shells.',
            ], ['Accept' => 'application/json'])
            ->assertStatus(503)
            ->assertJsonPath('code', 'service_unavailable')
            ->assertDontSee('private decoder error');
    }

    public function test_inference_timeout_is_mapped_to_gateway_timeout_without_retrying(): void
    {
        $user = $this->createActiveUser();
        Http::preventStrayRequests();
        $attempts = 0;
        Http::fake(function () use (&$attempts): never {
            $attempts++;
            throw new ConnectionException('cURL error 28: Operation timed out');
        });

        $this->actingAs($user)
            ->post('/api/v1/slp/assess', [
                'audio' => $this->fakeWavFile(),
                'reference_text' => 'She sells shells.',
            ], ['Accept' => 'application/json'])
            ->assertStatus(504)
            ->assertJsonPath('code', 'upstream_timeout');

        $this->assertSame(1, $attempts);
    }

    public function test_v2_practice_response_preserves_uncertainty_and_provenance(): void
    {
        $assessment = $this->practiceAssessment();
        Http::preventStrayRequests();
        Http::fake(['phoneme.test/v1/assess' => Http::response($assessment, 200)]);

        $this->actingAs($this->createActiveUser())
            ->post('/api/v1/slp/assess', [
                'audio' => $this->fakeWavFile(), 'reference_text' => 'sun',
            ], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('data.meta.schemaVersion', '2.0')
            ->assertJsonPath('data.meta.learningEligible', false)
            ->assertJsonPath('data.analysis.structured.overall.status', 'unknown');
    }

    public function test_v2_cannot_smuggle_corrective_scores_or_training_permission(): void
    {
        foreach (['correction', 'consent', 'missing_model'] as $violation) {
            $assessment = $this->practiceAssessment();
            if ($violation === 'correction') {
                $assessment['analysis']['structured']['overall']['status'] = 'accurate';
            } elseif ($violation === 'consent') {
                $assessment['meta']['learningEligible'] = true;
            } else {
                unset($assessment['meta']['modelVersion']);
            }
            Http::preventStrayRequests();
            Http::fake(['phoneme.test/v1/assess' => Http::response($assessment, 200)]);
            $this->actingAs($this->createActiveUser())
                ->post('/api/v1/slp/assess', [
                    'audio' => $this->fakeWavFile(), 'reference_text' => 'sun',
                ], ['Accept' => 'application/json'])->assertStatus(502);
        }
    }

    public function test_filipino_language_is_forwarded_and_unsupported_languages_are_rejected(): void
    {
        Http::preventStrayRequests();
        $forwardedBody = '';
        Http::fake(function (ClientRequest $request) use (&$forwardedBody) {
            $forwardedBody = $request->body();

            return Http::response($this->practiceAssessment(), 200);
        });
        $this->actingAs($this->createActiveUser())
            ->post('/api/v1/slp/assess', [
                'audio' => $this->fakeWavFile(), 'reference_text' => 'araw', 'language' => 'tl',
            ], ['Accept' => 'application/json'])->assertOk();
        $this->assertStringContainsString('name="language"', $forwardedBody);
        $this->assertStringContainsString('tl', $forwardedBody);

        $this->post('/api/v1/slp/assess', [
            'audio' => $this->fakeWavFile(), 'reference_text' => 'araw', 'language' => 'unknown',
        ], ['Accept' => 'application/json'])->assertUnprocessable();
        Http::assertSentCount(1);
    }

    private function practiceAssessment(): array
    {
        $assessment = $this->assessment();
        $assessment['meta'] = [
            'alignmentSource' => 'none', 'cer' => 0, 'schemaVersion' => '2.0',
            'status' => 'review_required', 'measurement' => 'transcript_agreement_only',
            'modelVersion' => 'faster-whisper-base', 'calibrationVersion' => 'none',
            'learningEligible' => false,
        ];
        $assessment['analysis']['lowScoring'] = [];
        foreach (['words', 'accurateUnits', 'needsWorkUnits'] as $key) {
            $assessment['analysis']['structured'][$key] = [];
        }
        $assessment['analysis']['structured']['overall'] = [
            'avgScore' => 0, 'percentAboveNeedsWork' => 0, 'status' => 'unknown',
        ];

        return $assessment;
    }

    private function createActiveUser(): User
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        UserProfile::factory()->for($user)->create(['role' => 'patient', 'status' => 'active']);

        return $user->load('profile');
    }

    private function fakeWavFile(): UploadedFile
    {
        $header = 'RIFF'.pack('V', 36).'WAVEfmt '.pack('V', 16).pack('v', 1).pack('v', 1)
            .pack('V', 16000).pack('V', 32000).pack('v', 2).pack('v', 16).'data'.pack('V', 0);

        return UploadedFile::fake()->createWithContent('recording.wav', $header);
    }

    /** @return array<string, mixed> */
    private function assessment(): array
    {
        return [
            'meta' => ['alignmentSource' => 'reference', 'cer' => 0.12],
            'analysis' => [
                'transcript' => 'She sells shells.',
                'lowScoring' => [['phoneme' => 's', 'score' => 23.0, 'word' => 'sells', 'wordIndex' => 1]],
                'structured' => [
                    'reference' => 'She sells shells.',
                    'transcript' => 'She sells shells.',
                    'overall' => ['avgScore' => 72.0, 'percentAboveNeedsWork' => 70.0, 'status' => 'mixed'],
                    'words' => [['word' => 'sells', 'avgScore' => 72.0, 'status' => 'mixed', 'lowUnits' => [['unit' => 's', 'score' => 23.0]]]],
                    'accurateUnits' => [['unit' => 'sh', 'avgScore' => 90.0, 'examples' => ['shells']]],
                    'needsWorkUnits' => [['unit' => 's', 'avgScore' => 23.0, 'examples' => ['sells']]],
                ],
            ],
            'feedback' => ['text' => 'Practice estimate.'],
        ];
    }
}
