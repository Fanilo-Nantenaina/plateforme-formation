<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CertificateResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'public_code'   => $this->public_code,
            'status'        => $this->status,
            'issued_at'     => $this->issued_at,
            'apprenant'     => $this->enrollment->account->full_name,
            'formation'     => $this->enrollment->training->title,
        ];
    }
}
