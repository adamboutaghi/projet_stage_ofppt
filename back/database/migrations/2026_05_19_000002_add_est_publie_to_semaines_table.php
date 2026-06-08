<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('semaines', function (Blueprint $table) {
            $table->boolean('est_publie')->default(false)->after('date_fin');
        });
    }

    public function down(): void
    {
        Schema::table('semaines', function (Blueprint $table) {
            $table->dropColumn('est_publie');
        });
    }
};
