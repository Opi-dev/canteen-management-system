<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin',
            'email' => 'admin@greencafeteria.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Manager',
            'email' => 'manager@greencafeteria.com',
            'password' => Hash::make('manager123'),
            'role' => 'manager',
        ]);

        User::create([
            'name' => 'Staff',
            'email' => 'staff@greencafeteria.com',
            'password' => Hash::make('staff123'),
            'role' => 'staff',
        ]);
    }
}
