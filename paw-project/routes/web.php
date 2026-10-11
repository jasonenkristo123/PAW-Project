<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\EventController;
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
    Route::get('dashboard', function () {
        if (auth()->user()?->role === \App\Models\User::ROLE_ADMIN) {
            return redirect()->route('admin.dashboard');
        }
        return redirect()->route('events.index');
    })->name('dashboard');
});

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('bookings', [DashboardController::class, 'index'])->name('bookings.index');
    Route::get('bookings/export', [DashboardController::class, 'export'])->name('bookings.export');
    Route::get('bookings/{booking}', [DashboardController::class, 'show'])->name('bookings.show');
    Route::patch('bookings/{booking}', [DashboardController::class, 'update'])->name('bookings.update');
    Route::delete('bookings/{booking}', [DashboardController::class, 'destroy'])->name('bookings.destroy');
    Route::resource('venues', VenueController::class);
    Route::resource('categories', CategoryController::class);
    Route::resource('events', EventController::class);
});

require __DIR__.'/settings.php';
