<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FormationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:180'],
            'description' => ['required', 'string'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'status' => ['nullable', 'string'],
            'type' => ['nullable', 'string'],
            'category' => ['required', 'string'],
            'level' => ['nullable', 'string'],
            'capacity' => ['required', 'integer', 'min:1'],
            'centre_id' => ['nullable', 'exists:centres,id'],
            'responsable_id' => ['nullable', 'exists:users,id'],
        ];
    }
}
