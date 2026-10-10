<?php

use App\Http\Controllers\Admin\VenueController;
use App\Http\Controllers\ExploreController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('events', [ExploreController::class, 'index'])->name('events.index');
    Route::get('events/{event}', [ExploreController::class, 'show'])->whereNumber('event')->name('events.show');
    Route::post('events/{event}/bookings', [ExploreController::class, 'book'])->whereNumber('event')->name('events.book');
    Route::get('my-bookings', [ExploreController::class, 'myBookings'])->name('bookings.index');
    Route::post('my-bookings/{booking}/cancel', [ExploreController::class, 'cancel'])->name('bookings.cancel');
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::redirect('/', '/admin/venues')->name('dashboard');
    Route::resource('venues', VenueController::class);
});

require __DIR__.'/settings.php';
