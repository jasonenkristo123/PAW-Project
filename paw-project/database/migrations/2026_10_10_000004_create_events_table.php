<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->foreignId('venue_id')->constrained()->restrictOnDelete();
            $table->string('title');
            $table->text('description');
            $table->text('whats_included')->nullable();
            $table->text('what_to_bring')->nullable();
            $table->date('date');
            $table->time('time');
            $table->decimal('price', 12, 2);
            $table->unsignedInteger('quota');
            $table->string('status', 30)->default('draft');
            $table->timestamps();

            $table->index('category_id');
            $table->index('venue_id');
            $table->index(['status', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
