<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seances', function (Blueprint $table) {
            $table->id();

            $table->foreignId('semaine_id')->constrained('semaines')->onDelete('cascade');
            $table->foreignId('groupe_id')->constrained('groupes')->onDelete('cascade');
            $table->foreignId('cours_id')->constrained('cours')->onDelete('cascade');

            $table->integer('jour'); // 0 = lundi ... 6 = dimanche

            $table->time('heure_debut');
            $table->time('heure_fin');
            $table->string('type');      // cours / TD / TP
            $table->softDeletes();
            $table->string('salle')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seances');
    }
};
