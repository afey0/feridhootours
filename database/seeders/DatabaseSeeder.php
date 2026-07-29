<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Jetty;
use App\Models\Vessel;
use App\Models\Schedule;
use App\Models\Booking;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Seed Users
        User::updateOrCreate(
            ['email' => 'superadmin@smartferry.mv'],
            [
                'id' => 'USR-SUPERADMIN-001',
                'name' => 'Super Administrator',
                'password' => Hash::make('superadmin123'),
                'role' => 'super_admin',
                'phone' => '+960 777-0000',
            ]
        );

        User::updateOrCreate(
            ['email' => 'admin@smartferry.mv'],
            [
                'id' => 'USR-ADMIN-001',
                'name' => 'Operator Administrator',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'phone' => '+960 777-1111',
            ]
        );

        User::updateOrCreate(
            ['email' => 'bookings@mvtravel.com'],
            [
                'id' => 'USR-AGENCY-001',
                'name' => 'Maldives Travel Agency',
                'password' => Hash::make('agency123'),
                'role' => 'agency',
                'phone' => '+960 333-2222',
                'agency_name' => 'Maldives Travel Agency',
            ]
        );

        User::updateOrCreate(
            ['email' => 'ahmed@example.com'],
            [
                'id' => 'USR-PASSENGER-001',
                'name' => 'Ahmed Shareef',
                'password' => Hash::make('password123'),
                'role' => 'passenger',
                'phone' => '+960 799-8877',
            ]
        );

        // Seed Jetties
        $jetties = [
            ['id' => 'MLE', 'name' => 'Malé City Terminal (Hulhumalé Jetty)'],
            ['id' => 'MAF', 'name' => 'Maafushi Central Harbor'],
            ['id' => 'FUL', 'name' => 'Fulidhoo Island Jetty'],
            ['id' => 'DHG', 'name' => 'Dhigurah Main Pier'],
            ['id' => 'FER', 'name' => 'Feridhoo Harbor Terminal'],
        ];
        foreach ($jetties as $j) {
            Jetty::updateOrCreate(['id' => $j['id']], $j);
        }

        // Seed Vessels
        Vessel::updateOrCreate(
            ['id' => 'VES-001'],
            [
                'name' => 'Kaani Princess',
                'type' => 'Speedboat',
                'amenities' => ['AC', 'Water', 'Life Jacket', 'USB Charger', 'WiFi'],
                'layout_rows' => 8,
                'layout_cols' => 4,
                'vip_rows' => '1-2',
                'premium_rows' => '3-4',
            ]
        );

        Vessel::updateOrCreate(
            ['id' => 'VES-002'],
            [
                'name' => 'Speedboat Alpha',
                'type' => 'Speedboat',
                'amenities' => ['AC', 'Water', 'Life Jacket'],
                'layout_rows' => 6,
                'layout_cols' => 4,
                'vip_rows' => '1',
                'premium_rows' => '2-3',
            ]
        );

        // Seed Schedules
        Schedule::updateOrCreate(
            ['id' => 'SCH-001'],
            [
                'vessel_id' => 'VES-001',
                'vessel_name' => 'Kaani Princess',
                'vessel_type' => 'Speedboat',
                'departure_time' => '08:30 AM',
                'arrival_time' => '09:15 AM',
                'available_seats' => 31,
                'total_seats' => 32,
                'price' => 35.00,
                'route_from' => 'MLE',
                'route_to' => 'MAF',
                'amenities' => ['AC', 'Water', 'Life Jacket', 'USB Charger', 'WiFi'],
                'stops' => ['Gulhi Island'],
                'disabled' => false,
                'maintenance' => false,
            ]
        );

        Schedule::updateOrCreate(
            ['id' => 'SCH-002'],
            [
                'vessel_id' => 'VES-002',
                'vessel_name' => 'Speedboat Alpha',
                'vessel_type' => 'Speedboat',
                'departure_time' => '10:30 AM',
                'arrival_time' => '12:00 PM',
                'available_seats' => 24,
                'total_seats' => 24,
                'price' => 50.00,
                'route_from' => 'MAF',
                'route_to' => 'FER',
                'amenities' => ['AC', 'Water', 'Life Jacket'],
                'stops' => ['Fulidhoo Island'],
                'disabled' => false,
                'maintenance' => false,
            ]
        );

        // Seed Initial Booking
        Booking::updateOrCreate(
            ['id' => 'SFY78B'],
            [
                'schedule_id' => 'SCH-001',
                'vessel_name' => 'Kaani Princess',
                'vessel_type' => 'Speedboat',
                'departure_time' => '08:30 AM',
                'arrival_time' => '09:15 AM',
                'route_from' => 'MLE',
                'route_to' => 'MAF',
                'passengers' => [
                    ['name' => 'Ali Shareef', 'age' => 34, 'gender' => 'Male', 'idNumber' => 'A123456', 'seatId' => 'S-9']
                ],
                'selected_seat_ids' => ['S-9'],
                'total_amount' => 35.00,
                'payment_method' => 'card',
                'status' => 'verified',
                'booked_by' => 'Ali Shareef',
                'user_id' => 'USR-PASSENGER-001',
                'passenger_email' => 'ahmed@example.com',
            ]
        );
    }
}
