<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Vessel;
use App\Models\Schedule;
use App\Models\Booking;
use App\Models\User;
use App\Models\AuditLog;
use App\Models\Jetty;

Route::get('/v1/sync-state', function () {
    return response()->json([
        'vessels' => Vessel::all(),
        'schedules' => Schedule::all(),
        'bookings' => Booking::orderBy('created_at', 'desc')->get(),
        'users' => User::all(),
        'jetties' => Jetty::all(),
        'auditLogs' => AuditLog::orderBy('created_at', 'desc')->take(50)->get(),
    ]);
});

// Vessel API Endpoints
Route::get('/v1/vessels', fn() => response()->json(Vessel::all()));
Route::post('/v1/vessels', function (Request $request) {
    $data = $request->all();
    $vessel = Vessel::updateOrCreate(['id' => $data['id'] ?? ('VES-'.time())], $data);
    return response()->json(['success' => true, 'vessel' => $vessel]);
});
Route::delete('/v1/vessels/{id}', function ($id) {
    Vessel::destroy($id);
    return response()->json(['success' => true]);
});

// Schedule API Endpoints
Route::get('/v1/schedules', fn() => response()->json(Schedule::all()));
Route::post('/v1/schedules', function (Request $request) {
    $data = $request->all();
    $schedule = Schedule::updateOrCreate(['id' => $data['id'] ?? ('SCH-'.time())], $data);
    return response()->json(['success' => true, 'schedule' => $schedule]);
});
Route::delete('/v1/schedules/{id}', function ($id) {
    Schedule::destroy($id);
    return response()->json(['success' => true]);
});

// Booking API Endpoints
Route::get('/v1/bookings', fn() => response()->json(Booking::orderBy('created_at', 'desc')->get()));
Route::post('/v1/bookings', function (Request $request) {
    $data = $request->all();
    $booking = Booking::updateOrCreate(['id' => $data['id'] ?? ('SFY'.strtoupper(substr(md5(uniqid()), 0, 5)))], $data);
    return response()->json(['success' => true, 'booking' => $booking]);
});
Route::put('/v1/bookings/{id}', function (Request $request, $id) {
    $booking = Booking::find($id);
    if ($booking) {
        $booking->update($request->all());
    }
    return response()->json(['success' => true, 'booking' => $booking]);
});

// Audit Log API Endpoint
Route::post('/v1/audit-logs', function (Request $request) {
    $log = AuditLog::create($request->all());
    return response()->json(['success' => true, 'log' => $log]);
});
