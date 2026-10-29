<?php

namespace App\Actions;

use DateInterval;
use DateTime;
use DateTimeImmutable;
use DateTimeZone;
use InvalidArgumentException;
use RRule\RRule;

class ExpandScheduleOccurrences
{
    /**
     * @return list<array{start: DateTimeImmutable, end: DateTimeImmutable}>
     */
    public function expand(DateTimeImmutable $startsAt, DateTimeImmutable $endsAt, ?string $recurrenceRule): array
    {
        $duration = $endsAt->getTimestamp() - $startsAt->getTimestamp();
        if ($duration <= 0) {
            throw new InvalidArgumentException('The schedule end must be after its start.');
        }

        if ($recurrenceRule === null || $recurrenceRule === '') {
            return [['start' => $startsAt, 'end' => $endsAt]];
        }

        $parts = $this->parseRule($recurrenceRule, $startsAt);
        $rule = new RRule($recurrenceRule, DateTime::createFromImmutable($startsAt));
        $occurrences = $rule->getOccurrences(366);

        if ($occurrences === [] || count($occurrences) > 365) {
            throw new InvalidArgumentException('The recurrence must produce between 1 and 365 occurrences.');
        }

        $last = DateTimeImmutable::createFromMutable($occurrences[array_key_last($occurrences)]);
        if ($last > $startsAt->add(new DateInterval('P1Y'))) {
            throw new InvalidArgumentException('The recurrence must end within one year of its start.');
        }

        for ($index = 1; $index < count($occurrences); $index++) {
            $previous = DateTimeImmutable::createFromMutable($occurrences[$index - 1]);
            $current = DateTimeImmutable::createFromMutable($occurrences[$index]);
            if ($current < $previous->modify("+{$duration} seconds")) {
                throw new InvalidArgumentException('Recurring occurrences cannot overlap each other.');
            }
        }

        if (isset($parts['UNTIL']) && $last->format('Ymd\THis\Z') > $parts['UNTIL']) {
            throw new InvalidArgumentException('The recurrence exceeds its UNTIL boundary.');
        }

        return array_map(function (DateTime $occurrence) use ($duration): array {
            $start = DateTimeImmutable::createFromMutable($occurrence)->setTimezone(new DateTimeZone('UTC'));

            return [
                'start' => $start,
                'end' => $start->modify("+{$duration} seconds"),
            ];
        }, $occurrences);
    }

    /** @return array<string, string> */
    private function parseRule(string $recurrenceRule, DateTimeImmutable $startsAt): array
    {
        $parts = [];
        foreach (explode(';', $recurrenceRule) as $clause) {
            $pair = explode('=', $clause);
            if (count($pair) !== 2 || $pair[0] === '' || $pair[1] === '' || array_key_exists($pair[0], $parts)) {
                throw new InvalidArgumentException('The recurrence rule contains an invalid or duplicate clause.');
            }
            $parts[$pair[0]] = $pair[1];
        }

        if (array_diff(array_keys($parts), ['FREQ', 'INTERVAL', 'BYDAY', 'COUNT', 'UNTIL']) !== []) {
            throw new InvalidArgumentException('The recurrence rule contains an unsupported clause.');
        }

        if (! in_array($parts['FREQ'] ?? null, ['DAILY', 'WEEKLY', 'MONTHLY'], true)) {
            throw new InvalidArgumentException('The recurrence frequency is not supported.');
        }

        if (isset($parts['INTERVAL']) && (! ctype_digit($parts['INTERVAL']) || (int) $parts['INTERVAL'] < 1 || (int) $parts['INTERVAL'] > 365)) {
            throw new InvalidArgumentException('The recurrence interval must be between 1 and 365.');
        }

        if (isset($parts['BYDAY'])) {
            $days = explode(',', $parts['BYDAY']);
            if ($parts['FREQ'] !== 'WEEKLY' || count(array_unique($days)) !== count($days) || array_diff($days, ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']) !== []) {
                throw new InvalidArgumentException('BYDAY is supported only for weekly rules with unique weekdays.');
            }
        }

        if (isset($parts['COUNT']) === isset($parts['UNTIL'])) {
            throw new InvalidArgumentException('The recurrence requires exactly one of COUNT or UNTIL.');
        }

        if (isset($parts['COUNT']) && (! ctype_digit($parts['COUNT']) || (int) $parts['COUNT'] < 1 || (int) $parts['COUNT'] > 365)) {
            throw new InvalidArgumentException('COUNT must be between 1 and 365.');
        }

        if (isset($parts['UNTIL'])) {
            $until = DateTimeImmutable::createFromFormat('!Ymd\THis\Z', $parts['UNTIL'], new DateTimeZone('UTC'));
            $errors = DateTimeImmutable::getLastErrors();
            if ($until === false || ($errors !== false && ($errors['warning_count'] > 0 || $errors['error_count'] > 0))
                || $until < $startsAt || $until > $startsAt->add(new DateInterval('P1Y'))) {
                throw new InvalidArgumentException('UNTIL must be a valid UTC date within one year of the start.');
            }
        }

        return $parts;
    }
}
