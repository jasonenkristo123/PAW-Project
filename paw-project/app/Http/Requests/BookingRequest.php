<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'ticket_quantity' => ['required', 'integer', 'min:1', 'max:4'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone_number' => ['nullable', 'string', 'max:30'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'ticket_quantity.required' => 'Jumlah tiket harus diisi.',
            'ticket_quantity.min' => 'Minimal pemesanan adalah 1 tiket.',
            'ticket_quantity.max' => 'Maksimal pemesanan adalah 4 tiket per transaksi.',
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
        ];
    }
}
