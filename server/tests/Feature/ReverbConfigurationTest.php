<?php

namespace Tests\Feature;

use Dotenv\Dotenv;
use Laravel\Reverb\Application;
use Laravel\Reverb\Connection;
use Laravel\Reverb\Contracts\WebSocketConnection;
use Laravel\Reverb\Protocols\Pusher\Contracts\ChannelManager;
use Laravel\Reverb\Protocols\Pusher\EventHandler;
use Laravel\Reverb\Protocols\Pusher\Server;
use Mockery;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ReverbConfigurationTest extends TestCase
{
    #[DataProvider('browserOrigins')]
    public function test_example_configuration_accepts_local_browsers_and_rejects_other_hosts(string $origin, bool $allowed): void
    {
        $environment = Dotenv::parse(file_get_contents(base_path('.env.example')));
        $app = new Application('local', 'local', 'test-secret', 60, 30, explode(',', $environment['REVERB_ALLOWED_ORIGINS']), 10000);
        $socket = Mockery::mock(WebSocketConnection::class);
        $socket->shouldReceive('id')->andReturn(1);
        $socket->shouldReceive('send')->once()->withArgs(fn (string $message): bool => json_decode($message, true)['event'] === ($allowed ? 'pusher:connection_established' : 'pusher:error'));
        $connection = new Connection($socket, $app, $origin);
        $channels = Mockery::mock(ChannelManager::class);

        (new Server($channels, new EventHandler($channels)))->open($connection);
    }

    public static function browserOrigins(): array
    {
        return [
            ['http://localhost:3000', true],
            ['http://127.0.0.1:3000', true],
            ['https://untrusted.example', false],
        ];
    }
}
