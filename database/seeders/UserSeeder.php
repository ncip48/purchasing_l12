<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Ensure roles exist
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        $employeeRole = Role::firstOrCreate(['name' => 'Employee']);

        // Ensure some permissions exist (example)
        $manageUsersPermission = Permission::firstOrCreate(['name' => 'manage users']);
        $viewReportsPermission = Permission::firstOrCreate(['name' => 'view reports']);

        // Assign permissions to roles
        $adminRole->givePermissionTo([$manageUsersPermission, $viewReportsPermission]);
        $employeeRole->givePermissionTo($viewReportsPermission);

        // Create user
        $user = User::updateOrCreate(
            ['email' => 'mbahcip00@gmail.com'], // Ensure no duplicate email
            [
                'name' => 'Admin User',
                'email' => 'mbahcip00@gmail.com',
                'password' => Hash::make('mbahcip123'),
            ]
        );

        // Assign Admin role to user
        $user->assignRole('Admin');
    }
}
