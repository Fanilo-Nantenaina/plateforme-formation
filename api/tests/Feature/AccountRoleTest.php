<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Center;
use App\Models\Role;
use App\Models\Training;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class AccountRoleTest extends TestCase
{
    /**
     * A basic feature test example.
     */

    use RefreshDatabase;

    public function test_un_compte_peut_cumuler_des_roles_dans_des_centres_differents(): void
    {
        $apprenant = Role::create(['name' => 'apprenant']);
        $formateur = Role::create(['name' => 'formateur']);
        $centreA = Center::create(['name' => 'Centre A']);
        $centreB = Center::create(['name' => 'Centre B']);

        $account = Account::create([
            'full_name' => 'Awa Diop',
            'phone'     => '+221771234567',
            'password'  => 'secret123',
        ]);

        $account->roles()->attach($formateur->id, ['center_id' => $centreA->id]);
        $account->roles()->attach($apprenant->id, ['center_id' => $centreB->id]);

        // Formateur au centre A, apprenant au centre B — cumul contextualisé.
        $this->assertTrue($account->hasRole('formateur', $centreA->id));
        $this->assertTrue($account->hasRole('apprenant', $centreB->id));
        // Mais PAS formateur au centre B.
        $this->assertFalse($account->hasRole('formateur', $centreB->id));
    }

    public function test_inscription_refusee_si_pas_apprenant_dans_le_centre(): void
    {
        $centre = Center::create(['name' => 'Centre A']);
        $training = Training::create([
            'title'     => 'Dev web',
            'center_id' => $centre->id,
        ]);
        $account = Account::create([
            'full_name' => 'Sans Role',
            'phone'     => '+221770000001',
            'password'  => 'secret123',
        ]);

        $response = $this->postJson('/api/enrollments', [
            'account_id'  => $account->id,
            'training_id' => $training->id,
        ]);

        $response->assertStatus(403);
    }

    public function test_terminer_une_inscription_emet_un_certificat_verifiable(): void
    {
        $apprenant = Role::create(['name' => 'apprenant']);
        $centre = Center::create(['name' => 'Centre A']);
        $training = Training::create([
            'title'     => 'Dev web',
            'center_id' => $centre->id,
        ]);
        $account = Account::create([
            'full_name' => 'Awa Diop',
            'phone'     => '+221771234567',
            'password'  => 'secret123',
        ]);
        $account->roles()->attach($apprenant->id, ['center_id' => $centre->id]);

        // Inscription
        $enroll = $this->postJson('/api/enrollments', [
            'account_id'  => $account->id,
            'training_id' => $training->id,
        ]);
        $enroll->assertStatus(201);
        $enrollmentId = $enroll->json('data.id');

        // Terminer → émet le certificat
        $complete = $this->postJson("/api/enrollments/{$enrollmentId}/complete");
        $complete->assertStatus(201);

        $code = $complete->json('data.public_code');

        // Vérification publique par le code opaque
        $verify = $this->getJson("/api/verify/{$code}");
        $verify->assertStatus(200);
        $verify->assertJson(['valid' => true, 'apprenant' => 'Awa Diop']);
    }
}
