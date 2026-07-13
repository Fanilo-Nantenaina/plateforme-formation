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
        $admin     = Role::create(['name' => 'admin']);

        $centre = Center::create(['name' => 'Centre Dakar', 'city' => 'Dakar']);

        Training::create(['title' => 'Développement web', 'description' => 'HTML, CSS, JS', 'center_id' => $centre->id]);
        Training::create(['title' => 'Data Analyse', 'description' => 'SQL, Python, visualisation', 'center_id' => $centre->id]);

        $a = Account::create(['full_name' => 'Apprenant Test', 'phone' => '+261320000001', 'password' => 'secret123']);
        $f = Account::create(['full_name' => 'Formateur Test', 'phone' => '+261320000002', 'password' => 'secret123']);
        $g = Account::create(['full_name' => 'Admin Test',     'phone' => '+261320000003', 'password' => 'secret123']);

        $a->roles()->attach($apprenant->id, ['center_id' => $centre->id]);
        $f->roles()->attach($formateur->id, ['center_id' => $centre->id]);
        $g->roles()->attach($admin->id,     ['center_id' => $centre->id]);
    }
}
