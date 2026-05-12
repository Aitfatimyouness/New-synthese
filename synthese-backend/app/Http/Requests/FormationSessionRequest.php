<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FormationSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'formation_id' => ['required', 'exists:formations,id'],
            'theme_id' => ['nullable', 'exists:themes,id'],
            'site_formation_id' => ['nullable', 'exists:sites_formation,id'],
            'animateur_id' => ['nullable', 'exists:users,id'],
            'title' => ['required', 'string', 'max:180'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['required', 'date', 'after:starts_at'],
            'room' => ['nullable', 'string', 'max:80'],
            'status' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
