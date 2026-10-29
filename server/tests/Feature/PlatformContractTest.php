<?php

namespace Tests\Feature;

use App\Http\Requests\ListQueryRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Route;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class PlatformContractTest extends TestCase
{
    use LazilyRefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Route::get('/api/v1/test-list', function (ListQueryRequest $request) {
            return PlatformItemResource::collection(User::query()->orderBy('id')->paginate($request->integer('per_page', 15)));
        });
    }

    public function test_list_resources_have_one_envelope_and_standard_pagination_without_credentials(): void
    {
        User::factory()->count(3)->create();
        $response = $this->getJson('/api/v1/test-list?per_page=2');

        $response->assertOk()->assertJsonCount(2, 'data')->assertJsonPath('meta.total', 3)
            ->assertJsonPath('meta.per_page', 2)->assertJsonPath('meta.last_page', 2)
            ->assertJsonStructure(['links', 'meta' => ['from', 'to', 'current_page', 'total']])
            ->assertJsonMissingPath('data.data')->assertJsonMissingPath('data.0.password');
        $this->assertSame(['id', 'name'], array_keys($response->json('data.0')));
    }

    public function test_empty_lists_are_arrays_with_default_page_size(): void
    {
        $this->getJson('/api/v1/test-list')->assertOk()->assertJsonPath('data', [])
            ->assertJsonPath('meta.per_page', 15)->assertJsonPath('meta.total', 0);
    }

    #[DataProvider('invalidQueries')]
    public function test_invalid_list_input_is_rejected(string $query, string $field): void
    {
        $this->getJson('/api/v1/test-list?'.$query)->assertUnprocessable()
            ->assertJsonPath('code', 'validation_failed')->assertJsonValidationErrors($field);
    }

    public static function invalidQueries(): array
    {
        return [
            ['page=0', 'page'], ['page=1.5', 'page'], ['per_page=0', 'per_page'],
            ['per_page=101', 'per_page'], ['per_page[]=2', 'per_page'],
            ['sort=unsafe', 'sort'], ['sort_by=password', 'sort_by'],
            ['search='.str_repeat('x', 256), 'search'],
        ];
    }

    public function test_upper_page_size_bound_and_allowlisted_sort_are_accepted(): void
    {
        $this->getJson('/api/v1/test-list?per_page=100&sort=asc&sort_by=id')
            ->assertOk()->assertJsonPath('meta.per_page', 100);
    }
}

class PlatformItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return ['id' => $this->id, 'name' => $this->name];
    }
}
