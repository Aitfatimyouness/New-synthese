<?php

namespace Database\Seeders;

use App\Models\Accommodation;
use App\Models\Absence;
use App\Models\Center;
use App\Models\Document;
use App\Models\Evaluation;
use App\Models\Formation;
use App\Models\FormationSession;
use App\Models\Report;
use App\Models\Role;
use App\Models\Theme;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        collect([
            ['key' => 'admin', 'label' => 'Administrateur systeme', 'description' => 'Supervision globale, utilisateurs, referentiels et rapports.'],
            ['key' => 'responsable_cdc', 'label' => 'Responsable CDC', 'description' => 'Gestion des themes, ressources pedagogiques et qualite des formations.'],
            ['key' => 'responsable_formation', 'label' => 'Responsable de formation', 'description' => 'Planification, suivi des sessions et coordination pedagogique.'],
            ['key' => 'responsable_dr', 'label' => 'Responsable DR', 'description' => 'Pilotage regional, logistique, hebergement et deplacements.'],
            ['key' => 'formateur_participant', 'label' => 'Formateur participant', 'description' => 'Participation aux sessions, documents, absences et evaluations.'],
            ['key' => 'formateur_animateur', 'label' => 'Formateur animateur', 'description' => 'Animation des sessions, suivi des participants et saisie des absences.'],
        ])->each(fn (array $role) => Role::updateOrCreate(['key' => $role['key']], $role));

        $password = Hash::make('password123');
        $users = collect([
            ['name' => 'Admin Systeme', 'email' => 'admin@ofppt.test', 'role' => 'admin', 'direction' => 'Siege'],
            ['name' => 'Responsable CDC Digital', 'email' => 'cdc@ofppt.test', 'role' => 'responsable_cdc', 'direction' => 'CDC Digital', 'cdc' => 'CDC Digital'],
            ['name' => 'Responsable Formation', 'email' => 'formation@ofppt.test', 'role' => 'responsable_formation', 'direction' => 'Formation Continue'],
            ['name' => 'Responsable DR Casablanca', 'email' => 'dr@ofppt.test', 'role' => 'responsable_dr', 'direction' => 'DR Casablanca-Settat'],
            ['name' => 'Formateur Participant', 'email' => 'participant@ofppt.test', 'role' => 'formateur_participant', 'direction' => 'ISTA Sidi Maarouf'],
            ['name' => 'Formateur Animateur', 'email' => 'animateur@ofppt.test', 'role' => 'formateur_animateur', 'direction' => 'CDC Digital'],
            ['name' => 'Nadia El Amrani', 'email' => 'nadia@ofppt.test', 'role' => 'formateur_participant', 'direction' => 'ISTA Hay Hassani'],
        ])->mapWithKeys(fn ($data) => [
            $data['email'] => User::updateOrCreate(['email' => $data['email']], $data + ['password' => $password, 'phone' => '0600000000', 'active' => true]),
        ]);

        $center = Center::updateOrCreate(
            ['name' => 'CDC Digital Casablanca'],
            ['city' => 'Casablanca', 'address' => 'Route Nouaceur', 'capacity' => 60, 'manager_name' => 'M. Alaoui', 'phone' => '0522000000']
        );
        Center::updateOrCreate(
            ['name' => 'Institut Specialise Rabat'],
            ['city' => 'Rabat', 'address' => 'Hay Riad', 'capacity' => 35, 'manager_name' => 'Mme Benali', 'phone' => '0537000000']
        );

        $theme = Theme::updateOrCreate(
            ['title' => 'Ingenierie de formation par competences'],
            ['domain' => 'Pedagogie', 'objectives' => 'Planifier, animer et evaluer une formation selon l approche APC.', 'skills_targeted' => 'Scenario pedagogique, evaluation criteriee, feedback', 'duration_hours' => 21]
        );
        $theme2 = Theme::updateOrCreate(
            ['title' => 'Digitalisation des supports pedagogiques'],
            ['domain' => 'Digital', 'objectives' => 'Produire des ressources interactives et assurer leur archivage.', 'skills_targeted' => 'LMS, ressources multimedia, accessibilite', 'duration_hours' => 14]
        );

        $formation = Formation::updateOrCreate(
            ['title' => 'Cycle APC Formateurs 2026'],
            ['theme_id' => $theme->id, 'description' => 'Parcours national de renforcement des competences pedagogiques.', 'status' => 'planifiee', 'target_profile' => 'Formateurs permanents', 'planned_start_date' => '2026-05-10', 'planned_end_date' => '2026-05-20']
        );
        Formation::updateOrCreate(
            ['title' => 'Atelier ressources numeriques'],
            ['theme_id' => $theme2->id, 'description' => 'Creation et partage de supports numeriques pour les filieres.', 'status' => 'ouverte', 'target_profile' => 'Animateurs et referents digitaux', 'planned_start_date' => '2026-06-02', 'planned_end_date' => '2026-06-06']
        );

        $session = FormationSession::updateOrCreate(
            ['code' => 'APC-CASA-2026-01'],
            ['formation_id' => $formation->id, 'center_id' => $center->id, 'animator_id' => $users['animateur@ofppt.test']->id, 'start_date' => '2026-05-10', 'end_date' => '2026-05-12', 'place' => 'Salle B12', 'status' => 'planifiee', 'capacity' => 25, 'logistics_notes' => 'Video projecteur et connexion internet requis.']
        );
        $session->participants()->syncWithoutDetaching([
            $users['participant@ofppt.test']->id => ['status' => 'inscrit', 'progress_percent' => 35, 'acquired_skills' => 'Diagnostic des besoins', 'impact_notes' => 'A appliquer dans le module reseaux'],
            $users['nadia@ofppt.test']->id => ['status' => 'inscrit', 'progress_percent' => 55, 'acquired_skills' => 'Rubriques evaluation', 'impact_notes' => 'Partage avec l equipe locale'],
        ]);

        Absence::updateOrCreate(
            ['formation_session_id' => $session->id, 'user_id' => $users['participant@ofppt.test']->id, 'absence_date' => '2026-05-11'],
            ['marked_by' => $users['animateur@ofppt.test']->id, 'type' => 'justifiee', 'reason' => 'Convocation administrative']
        );

        Accommodation::updateOrCreate(
            ['formation_session_id' => $session->id, 'user_id' => $users['nadia@ofppt.test']->id],
            ['hotel_name' => 'Hotel Centre Ville', 'city' => 'Casablanca', 'check_in' => '2026-05-09', 'check_out' => '2026-05-13', 'cost' => 1600, 'status' => 'reserve']
        );

        \App\Models\Travel::updateOrCreate(
            ['formation_session_id' => $session->id, 'user_id' => $users['nadia@ofppt.test']->id],
            ['origin' => 'Rabat', 'destination' => 'Casablanca', 'transport_mode' => 'Train', 'travel_date' => '2026-05-09', 'cost' => 180, 'status' => 'valide']
        );

        Document::updateOrCreate(
            ['title' => 'Guide APC OFPPT'],
            ['formation_id' => $formation->id, 'formation_session_id' => $session->id, 'uploaded_by' => $users['cdc@ofppt.test']->id, 'category' => 'support', 'visible_roles' => ['admin', 'responsable_cdc', 'responsable_formation', 'formateur_participant', 'formateur_animateur'], 'archived' => false]
        );

        Evaluation::updateOrCreate(
            ['formation_session_id' => $session->id, 'participant_id' => $users['participant@ofppt.test']->id],
            ['score_content' => 4, 'score_animator' => 5, 'score_logistics' => 4, 'feedback' => 'Contenu pertinent et directement exploitable.', 'skills_acquired' => 'Structuration des objectifs', 'impact_expected' => 'Ameliorer les evaluations de fin de module']
        );

        Report::updateOrCreate(
            ['title' => 'Rapport initial participation'],
            ['generated_by' => $users['admin@ofppt.test']->id, 'type' => 'global', 'filters' => [], 'content' => ['note' => 'Rapport genere par les donnees de demonstration']]
        );

    }
}
