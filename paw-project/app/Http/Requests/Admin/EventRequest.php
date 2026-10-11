<?php

namespace App\Http\Requests\Admin;

use App\Models\Event;
use App\Models\Venue;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $venueId = $this->input('venue_id');
        $venue = $venueId ? Venue::find($venueId) : null;
        $maxQuota = $venue ? $venue->capacity : 100000;

        return [
            'category_id' => ['required', 'integer', Rule::exists('categories', 'id')],
            'venue_id' => ['required', 'integer', Rule::exists('venues', 'id')],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:10000'],
            'whats_included' => ['nullable', 'string', 'max:5000'],
            'what_to_bring' => ['nullable', 'string', 'max:5000'],
            'date' => ['required', 'date'],
            'time' => ['required', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'quota' => ['required', 'integer', 'min:1', 'max:'.$maxQuota],
            'status' => ['required', Rule::in([
                Event::STATUS_DRAFT,
                Event::STATUS_PUBLISHED,
                Event::STATUS_CANCELLED,
                Event::STATUS_COMPLETED,
            ])],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'category_id.required' => 'Please select a category.',
            'category_id.exists' => 'Selected category is invalid.',
            'venue_id.required' => 'Please select a venue.',
            'venue_id.exists' => 'Selected venue is invalid.',
            'title.required' => 'Event title is required.',
            'date.required' => 'Event date is required.',
            'time.required' => 'Event time is required.',
            'price.required' => 'Ticket price is required.',
            'quota.required' => 'Ticket quota is required.',
            'quota.max' => 'Event quota cannot exceed venue capacity (:max people).',
            'status.required' => 'Event status is required.',
        ];
    }
}

