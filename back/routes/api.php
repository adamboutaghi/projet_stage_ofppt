<?php
use App\Http\Controllers\TeacherController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EventController;
use App\Http\Controllers\GroupeController;
use App\Http\Controllers\SemaineController; 
use App\Http\Controllers\CourController;    
use App\Http\Controllers\SeanceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\NotificationController;
use App\Http\Middleware\SuperAdmin;
use App\Http\Middleware\EnsureCanAccessSystem;

// Public routes


Route::post('/login', [AuthController::class, 'login']);
Route::get('/semaines', [SemaineController::class, 'index']);
Route::get('/semaines/actuelle', [SemaineController::class, 'semaineActuelle']);
Route::get('/semaines/{id}', [SemaineController::class, 'show']);
Route::get('/semaines/{id}/emploi', [SemaineController::class, 'emploi']);


Route::middleware(['auth:sanctum', EnsureCanAccessSystem::class])->group(function () {
// Routes CRUD pour les Événements
Route::get('/events', [EventController::class, 'index']);
Route::post('/events', [EventController::class, 'store']);  
Route::get('/events/{id}', [EventController::class, 'show']);
Route::put('/events/{id}', [EventController::class, 'update']);
Route::delete('/events/{id}', [EventController::class, 'destroy']);
// Routes CRUD pour les Groupes

Route::get('/groupes', [GroupeController::class, 'index']);
Route::post('/groupes', [GroupeController::class, 'store']);
Route::get('/groupes/{id}', [GroupeController::class, 'show']);
Route::put('/groupes/{id}', [GroupeController::class, 'update']);
Route::delete('/groupes/{id}', [GroupeController::class, 'destroy']);

// Routes CRUD pour les semaines

// routes/api.php

Route::post('/semaines/emploi-multiples', [SemaineController::class, 'emploiMultiples']);

Route::get('/teacher/me', [TeacherController::class, 'me']);
Route::get('/teacher/filters', [TeacherController::class, 'filters']);
Route::get('/teacher/my-schedule', [TeacherController::class, 'mySchedule']);
Route::get('/teacher/professeurs', [TeacherController::class, 'professeurs']);
Route::get('/teacher/semaines', [TeacherController::class, 'semaines']);
Route::get('/teacher/schedule', [TeacherController::class, 'schedule']);
Route::get('/teacher/stats', [TeacherController::class, 'stats']);

Route::get('/notifications', [NotificationController::class, 'index']);
Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

// Routes CRUD pour les cours
Route::get('/cours', [CourController::class, 'index']);
Route::post('/cours', [CourController::class, 'store']);
Route::get('/cours/{id}', [CourController::class, 'show']);
Route::put('/cours/{id}', [CourController::class, 'update']);
Route::delete('/cours/{id}', [CourController::class, 'destroy']);

// Routes CRUD pour les séances
Route::get('/seances', [SeanceController::class, 'index']);
Route::post('/seances', [SeanceController::class, 'store']);
Route::get('/seances/{id}', [SeanceController::class, 'show']);
Route::put('/seances/{id}', [SeanceController::class, 'update']);
Route::delete('/seances/{id}', [SeanceController::class, 'destroy']);

// Routes Auth


Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/me', [AuthController::class, 'me']);
Route::put('/update-password', [AuthController::class, 'updatePassword']);
Route::delete('/delete-account', [AuthController::class, 'deleteAccount']);

Route::middleware(SuperAdmin::class)->group(function () {
    // Gestion des semaines (super-admin uniquement)
    Route::get('/admin/semaines', [SemaineController::class, 'indexAdmin']);
    Route::post('/semaines', [SemaineController::class, 'store']);
    Route::put('/semaines/{id}', [SemaineController::class, 'update']);
    Route::post('/semaines/{id}/publish', [SemaineController::class, 'publish']);
    Route::delete('/semaines/{id}', [SemaineController::class, 'destroy']);

    // CRUD utilisateurs (admin-super uniquement)
    Route::get('/users', [AuthController::class, 'index']);
    Route::get('/users/{id}', [AuthController::class, 'show']);
    Route::put('/users/{id}', [AuthController::class, 'update']);
    Route::delete('/users/{id}', [AuthController::class, 'destroy']);
    Route::post('/register', [AuthController::class, 'register']);

    // Nouvelle route pour récupérer les sessions actives
Route::get('/sessions/active', [AuthController::class, 'getActiveSessions']);
});
    


});
