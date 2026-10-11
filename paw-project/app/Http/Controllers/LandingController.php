<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Support\EventCatalog;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    public function __invoke(EventCatalog $catalog): Response
    {
        return Inertia::render('welcome', [
            'featuredEvents' => $catalog->upcoming()->limit(3)->get()
                ->map(fn (Event $event): array => $catalog->present($event)),
        ]);
    }
}
