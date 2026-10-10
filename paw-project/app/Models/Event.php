<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\EventFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $category_id
 * @property int $venue_id
 * @property string $title
 * @property string $description
 * @property string|null $whats_included
 * @property string|null $what_to_bring
 * @property CarbonImmutable $date
 * @property string $time
 * @property string $price
 * @property int $quota
 * @property string $status
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
#[Fillable([
    'category_id',
    'venue_id',
    'title',
    'description',
    'whats_included',
    'what_to_bring',
    'date',
    'time',
    'price',
    'quota',
    'status',
])]
class Event extends Model
{
    public const STATUS_DRAFT = 'draft';

    public const STATUS_PUBLISHED = 'published';

    public const STATUS_CANCELLED = 'cancelled';

    public const STATUS_COMPLETED = 'completed';

    /** @use HasFactory<EventFactory> */
    use HasFactory;

    /** @var array<string, mixed> */
    protected $attributes = [
        'status' => self::STATUS_DRAFT,
    ];

    /** @return BelongsTo<Category, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** @return BelongsTo<Venue, $this> */
    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }

    /** @return HasMany<Booking, $this> */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'category_id' => 'integer',
            'venue_id' => 'integer',
            'date' => 'immutable_date:Y-m-d',
            'price' => 'decimal:2',
            'quota' => 'integer',
        ];
    }
}
