<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentDownloadController extends Controller
{
    public function __invoke(Request $request, Document $document)
    {
        $roles = $document->visible_roles ?: [];
        if ($document->archived && $request->user()->role !== 'admin') {
            abort(403);
        }
        if ($roles && !in_array($request->user()->role, $roles, true) && $request->user()->role !== 'admin') {
            abort(403);
        }
        abort_unless($document->file_path && Storage::disk('public')->exists($document->file_path), 404);

        return Storage::disk('public')->download($document->file_path, $document->original_name);
    }
}
