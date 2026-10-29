<?php

namespace Tests\Unit;

use App\Actions\ExpandScheduleOccurrences;
use DateTimeImmutable;
use DateTimeZone;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class RecurrenceTest extends TestCase
{
    public function test_one_off_schedule_has_one_occurrence(): void
    {
        $occurrences = (new ExpandScheduleOccurrences)->expand(
            $this->date('2027-01-01 09:00:00'),
            $this->date('2027-01-01 10:00:00'),
            null,
        );

        $this->assertCount(1, $occurrences);
        $this->assertSame('2027-01-01T09:00:00+00:00', $occurrences[0]['start']->format(DATE_ATOM));
        $this->assertSame('2027-01-01T10:00:00+00:00', $occurrences[0]['end']->format(DATE_ATOM));
    }

    public function test_weekly_selected_days_and_interval_are_expanded_with_a_finite_count(): void
    {
        $occurrences = (new ExpandScheduleOccurrences)->expand(
            $this->date('2027-01-04 09:00:00'),
            $this->date('2027-01-04 10:00:00'),
            'FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE;COUNT=5',
        );

        $this->assertSame([
            '2027-01-04', '2027-01-06', '2027-01-18', '2027-01-20', '2027-02-01',
        ], array_map(fn (array $occurrence): string => $occurrence['start']->format('Y-m-d'), $occurrences));
    }

    public function test_weekly_rule_does_not_force_start_date_when_weekday_is_not_selected(): void
    {
        $occurrences = (new ExpandScheduleOccurrences)->expand(
            $this->date('2027-01-05 09:00:00'),
            $this->date('2027-01-05 10:00:00'),
            'FREQ=WEEKLY;BYDAY=MO;COUNT=2',
        );

        $this->assertSame(['2027-01-11', '2027-01-18'], array_map(
            fn (array $occurrence): string => $occurrence['start']->format('Y-m-d'),
            $occurrences,
        ));
    }

    public function test_weekly_rule_without_byday_repeats_on_the_start_weekday_by_interval(): void
    {
        $occurrences = (new ExpandScheduleOccurrences)->expand(
            $this->date('2027-01-05 09:00:00'),
            $this->date('2027-01-05 10:00:00'),
            'FREQ=WEEKLY;INTERVAL=2;COUNT=3',
        );

        $this->assertSame(['2027-01-05', '2027-01-19', '2027-02-02'], array_map(
            fn (array $occurrence): string => $occurrence['start']->format('Y-m-d'),
            $occurrences,
        ));
    }

    public function test_monthly_month_end_skips_months_without_that_day(): void
    {
        $occurrences = (new ExpandScheduleOccurrences)->expand(
            $this->date('2027-01-31 09:00:00'),
            $this->date('2027-01-31 10:00:00'),
            'FREQ=MONTHLY;COUNT=4',
        );

        $this->assertSame([
            '2027-01-31', '2027-03-31', '2027-05-31', '2027-07-31',
        ], array_map(fn (array $occurrence): string => $occurrence['start']->format('Y-m-d'), $occurrences));
    }

    public function test_until_rule_is_inclusive_and_bounded(): void
    {
        $occurrences = (new ExpandScheduleOccurrences)->expand(
            $this->date('2027-01-01 09:00:00'),
            $this->date('2027-01-01 10:00:00'),
            'FREQ=DAILY;UNTIL=20270103T090000Z',
        );

        $this->assertSame(3, count($occurrences));
        $this->assertSame('2027-01-03', $occurrences[2]['start']->format('Y-m-d'));
    }

    #[DataProvider('invalidRules')]
    public function test_unsupported_or_unbounded_rules_fail_without_generating_occurrences(string $rule): void
    {
        $this->expectException(InvalidArgumentException::class);

        (new ExpandScheduleOccurrences)->expand(
            $this->date('2027-01-01 09:00:00'),
            $this->date('2027-01-01 10:00:00'),
            $rule,
        );
    }

    public static function invalidRules(): array
    {
        return [
            'unbounded' => ['FREQ=DAILY'],
            'high count' => ['FREQ=DAILY;COUNT=366'],
            'count beyond horizon' => ['FREQ=DAILY;INTERVAL=2;COUNT=365'],
            'unsupported frequency' => ['FREQ=YEARLY;COUNT=2'],
            'unsupported clause' => ['FREQ=DAILY;BYHOUR=9;COUNT=2'],
            'duplicate clause' => ['FREQ=DAILY;COUNT=2;COUNT=3'],
            'invalid weekdays' => ['FREQ=WEEKLY;BYDAY=MO,MO;COUNT=2'],
            'until outside horizon' => ['FREQ=DAILY;UNTIL=20280102T090000Z'],
            'non-UTC until' => ['FREQ=DAILY;UNTIL=20270102T090000'],
            'invalid until date' => ['FREQ=DAILY;UNTIL=20270230T090000Z'],
        ];
    }

    public function test_schedule_duration_must_be_positive(): void
    {
        $this->expectException(InvalidArgumentException::class);

        (new ExpandScheduleOccurrences)->expand(
            $this->date('2027-01-01 10:00:00'),
            $this->date('2027-01-01 10:00:00'),
            null,
        );
    }

    private function date(string $date): DateTimeImmutable
    {
        return new DateTimeImmutable($date, new DateTimeZone('UTC'));
    }
}
