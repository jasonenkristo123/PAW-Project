<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\BookingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $booking_code
 * @property int $user_id
 * @property int $event_id
 * @property int $ticket_quantity
 * @property string $total_price
 * @property string $status
 * @property CarbonImmutable $booking_date
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
#[Fillable([
    'booking_code',
    'user_id',
    'event_id',
    'ticket_quantity',
    'total_price',
    'status',
    'booking_date',
])]
class Booking extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_CONFIRMED = 'confirmed';

    public const STATUS_CANCELLED = 'cancelled';

    /** @use HasFactory<BookingFactory> */
    use HasFactory;

    /** @var array<string, mixed> */
    protected $attributes = [
        'ticket_quantity' => 1,
        'status' => self::STATUS_PENDING,
    ];

    protected static function booted(): void
    {
        static::creating(function (Booking $booking): void {
            if (empty($booking->booking_code)) {
                $booking->booking_code = 'BK-'.Str::ulid();
            }

            $booking->booking_date ??= now()->toImmutable();
        });
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Event, $this> */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'event_id' => 'integer',
            'ticket_quantity' => 'integer',
            'total_price' => 'decimal:2',
            'booking_date' => 'immutable_datetime',
        ];
    }
}
