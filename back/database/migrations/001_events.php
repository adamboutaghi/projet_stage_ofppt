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

        $table->string('titre');
        $table->text('description')->nullable();
        $table->string('type')->default('general');

        // Date & heure
        $table->date('date');
        $table->time('heure')->nullable();

        // Lieu
        $table->string('lieu')->nullable();

        // Image
        $table->string('image')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });
}


public function down(): void
{
    Schema::dropIfExists('events');
}

};