<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<UserNotification>
 */
class UserNotificationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => 'system',
            'title' => fake()->sentence(4),
            'message' => fake()->sentence(),
            'delivery_key' => 'notification:'.Str::uuid(),
            'read_at' => null,
        ];
    }
}
