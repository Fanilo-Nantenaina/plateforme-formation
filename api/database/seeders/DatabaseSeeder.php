<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Center;
use App\Models\Role;
use App\Models\Training;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $apprenant = Role::create(['name' => 'apprenant']);
        $formateur = Role::create(['name' => 'formateur']);

        $centre = Center::create(['name' => 'Centre Dakar', 'city' => 'Dakar']);

        Training::create([
            'title' => 'Développement web',
            'description' => 'HTML, CSS, JS',
            'center_id' => $centre->id,
        ]);

        $demo = Account::create([
            'full_name' => 'User Test',
            'phone'     => '+261327049850',
            'password'  => 'secret123',
        ]);

        $demo->roles()->attach($apprenant->id, ['center_id' => $centre->id]);
    }
}
