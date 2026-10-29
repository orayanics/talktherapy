<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class SessionSignalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', 'string', 'in:offer,answer,ice_candidate,ready,media_toggle,chat_message,resync'],
            'generation' => ['required', 'integer', 'min:0'],
            'target_peer_id' => ['sometimes', 'nullable', 'uuid'],
            'negotiation_id' => ['sometimes', 'nullable', 'string', 'max:128'],
            'sdp' => ['sometimes', 'nullable', 'string', 'max:65536'],
            'candidate' => ['sometimes', 'nullable', 'array'],
            'candidate.candidate' => ['required_with:candidate', 'string', 'max:4096'],
            'candidate.sdpMid' => ['sometimes', 'nullable', 'string', 'max:255'],
            'candidate.sdpMLineIndex' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:255'],
            'kind' => ['sometimes', 'nullable', 'string', 'in:mic,camera'],
            'enabled' => ['sometimes', 'nullable', 'boolean'],
            'text' => ['sometimes', 'nullable', 'string', 'min:1', 'max:2000'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            $type = $this->input('type');
            if (in_array($type, ['offer', 'answer'], true) && ! $this->filled('sdp')) {
                $validator->errors()->add('sdp', 'SDP is required for this signal.');
            }
            if ($type === 'ice_candidate' && ! $this->filled('candidate')) {
                $validator->errors()->add('candidate', 'An ICE candidate is required.');
            }
            if ($type === 'media_toggle' && (! $this->filled('kind') || ! $this->has('enabled'))) {
                $validator->errors()->add('kind', 'Media kind and enabled state are required.');
            }
            if ($type === 'chat_message' && ! $this->filled('text')) {
                $validator->errors()->add('text', 'Message text is required.');
            }
        }];
    }
}
