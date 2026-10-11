<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\CategoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'description', 'status'])]
class Category extends Model
{
    public const STATUS_ACTIVE = 'active';

    public const STATUS_INACTIVE = 'inactive';

    use HasFactory;

    protected $attributes = [
        'status' => self::STATUS_ACTIVE,
    ];

    protected $appends = ['slug'];

    public function getSlugAttribute(): string
    {
        return \Illuminate\Support\Str::slug($this->name);
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }
}
