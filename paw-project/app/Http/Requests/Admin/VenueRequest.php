<?php

namespace App\Http\Requests\Admin;

use App\Models\Venue;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VenueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $venue = $this->route('venue');
        $minimumCapacity = $venue instanceof Venue
            ? max(1, (int) $venue->events()->max('quota'))
            : 1;

        return [
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:5000'],
            'capacity' => ['required', 'integer', 'min:'.$minimumCapacity, 'max:4294967295'],
            'status' => ['required', Rule::in([Venue::STATUS_ACTIVE, Venue::STATUS_INACTIVE])],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'capacity.min' => 'Capacity must be at least :min people and accommodate every existing event quota.',
        ];
    }
}
