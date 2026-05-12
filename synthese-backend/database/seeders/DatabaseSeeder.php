<?php

namespace Database\Seeders;

use App\Models\Absence;
use App\Models\ActivityLog;
use App\Models\Centre;
use App\Models\Deplacement;
use App\Models\Document;
use App\Models\Evaluation;
use App\Models\Formation;
use App\Models\FormationSession;
use App\Models\Hebergement;
use App\Models\OfpptNotification;
use App\Models\Permission;
use App\Models\Rapport;
use App\Models\Role;
use App\Models\Salle;
use App\Models\SiteFormation;
use App\Models\Theme;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Storage::disk('public')->put('documents/demo-guide.pdf', "Guide pedagogique OFPPT\nSupport de demonstration.");

        $permissions = collect([
            ['users.read', 'Consulter utilisateurs'], ['users.write', 'Gerer utilisateurs'],
            ['roles.read', 'Consulter roles'], ['roles.write', 'Gerer roles et permissions'],
            ['centres.read', 'Consulter CDC'], ['centres.write', 'Gerer CDC'],
            ['formations.read', 'Consulter formations'], ['formations.write', 'Gerer formations'],
            ['themes.read', 'Consulter themes'], ['themes.write', 'Gerer themes'],
            ['planning.read', 'Consulter planning'], ['planning.write', 'Gerer planning'],
            ['absences.read', 'Consulter absences'], ['absences.write', 'Gerer absences'],
            ['documents.read', 'Consulter documents'], ['documents.write', 'Gerer documents'],
            ['evaluations.read', 'Consulter evaluations'], ['evaluations.write', 'Gerer evaluations'],
            ['logistique.read', 'Consulter logistique'], ['logistique.write', 'Gerer logistique'],
            ['rapports.read', 'Consulter rapports'], ['rapports.write', 'Generer rapports'],
            ['notifications.read', 'Consulter notifications'], ['notifications.write', 'Gerer notifications'],
        ])->mapWithKeys(fn ($item) => [
            $item[0] => Permission::create(['name' => $item[0], 'label' => $item[1]]),
        ]);

        $roleDefinitions = [
            'administrateur' => ['Administrateur systeme', [
                'users.read', 'users.write',
                'roles.read', 'roles.write',
                'centres.read',
                'formations.read', 'themes.read', 'planning.read',
                'absences.read', 'documents.read', 'evaluations.read',
                'logistique.read', 'rapports.read', 'notifications.read',
            ]],
            'responsable_cdc' => ['Responsable CDC', [
                'formations.read', 'formations.write',
                'themes.read', 'themes.write',
                'planning.read',
                'absences.read', 'documents.read',
                'evaluations.read', 'logistique.read',
                'rapports.read', 'rapports.write',
                'notifications.read',
            ]],
            'responsable_formation' => ['Responsable de formation', [
                'formations.read', 'formations.write',
                'themes.read', 'planning.read', 'planning.write',
                'absences.read', 'documents.read',
                'evaluations.read',
                'logistique.read', 'logistique.write',
                'rapports.read', 'notifications.read',
            ]],
            'responsable_dr' => ['Responsable DR', [
                'formations.read', 'themes.read', 'planning.read',
                'absences.read', 'documents.read',
                'evaluations.read', 'logistique.read',
                'rapports.read', 'notifications.read',
            ]],
            'formateur_participant' => ['Formateur participant', [
                'formations.read', 'themes.read', 'planning.read',
                'documents.read',
                'evaluations.read', 'evaluations.write',
                'notifications.read',
            ]],
            'formateur_animateur' => ['Formateur animateur', [
                'formations.read', 'themes.read',
                'planning.read',
                'absences.read', 'absences.write',
                'documents.read', 'documents.write',
                'evaluations.read',
                'notifications.read',
            ]],
        ];

        $roles = collect($roleDefinitions)->mapWithKeys(function ($definition, $name) use ($permissions) {
            $role = Role::create(['name' => $name, 'label' => $definition[0], 'description' => 'Profil '.$definition[0].' OFPPT']);
            $role->permissions()->sync($permissions->only($definition[1])->pluck('id'));

            return [$name => $role];
        });

        $users = collect([
            ['ADM001', 'Admin OFPPT', 'admin@ofppt.ma', 'Administrateur systeme', 'administrateur'],
            ['CDC101', 'Nadia El Amrani', 'cdc@ofppt.ma', 'Responsable CDC Digital', 'responsable_cdc'],
            ['RF201', 'Youssef Benali', 'formation@ofppt.ma', 'Responsable de formation', 'responsable_formation'],
            ['DR301', 'Salma Idrissi', 'dr@ofppt.ma', 'Responsable DR Casablanca-Settat', 'responsable_dr'],
            ['FP401', 'Hicham Berrada', 'participant@ofppt.ma', 'Formateur participant', 'formateur_participant'],
            ['FA501', 'Imane Alaoui', 'animateur@ofppt.ma', 'Formatrice animatrice', 'formateur_animateur'],
            ['FP402', 'Meryem Tazi', 'meryem.tazi@ofppt.ma', 'Formatrice participante', 'formateur_participant'],
            ['FA502', 'Karim Mouline', 'karim.mouline@ofppt.ma', 'Formateur animateur', 'formateur_animateur'],
        ])->mapWithKeys(function ($row) use ($roles) {
            $user = User::create([
                'matricule' => $row[0],
                'name' => $row[1],
                'email' => $row[2],
                'phone' => '+212 6 00 00 00 00',
                'profile_title' => $row[3],
                'status' => 'actif',
                'password' => Hash::make('password123'),
            ]);
            $user->roles()->attach($roles[$row[4]]);

            return [$row[4].'-'.$row[0] => $user];
        });

        $centres = collect([
            ['CDC-DIG', 'CDC Digital et IA', 'Casablanca-Settat', 'Casablanca', 'Route Nouaceur, Casablanca'],
            ['CDC-IND', 'CDC Genie Industriel', 'Tanger-Tetouan-Al Hoceima', 'Tanger', 'Zone industrielle Gzenaya'],
            ['CDC-GES', 'CDC Gestion Commerce', 'Rabat-Sale-Kenitra', 'Rabat', 'Avenue Annakhil, Rabat'],
        ])->map(fn ($row) => Centre::create(['code' => $row[0], 'name' => $row[1], 'region' => $row[2], 'city' => $row[3], 'address' => $row[4]]));

        $sites = collect([
            ['ISTA NTIC Sidi Maarouf', 'Casablanca', 'Sidi Maarouf, Casablanca', 28, 0],
            ['Complexe de Formation Tanger', 'Tanger', 'Gzenaya, Tanger', 24, 1],
            ['Centre Regional de Formation Rabat', 'Rabat', 'Hay Riad, Rabat', 30, 2],
        ])->map(fn ($row) => SiteFormation::create(['name' => $row[0], 'city' => $row[1], 'address' => $row[2], 'capacity' => $row[3], 'manager_name' => 'Coordinateur logistique', 'centre_id' => $centres[$row[4]]->id]));

        $salles = collect();
        foreach ($sites as $site) {
            $salles->push(Salle::create(['site_formation_id' => $site->id, 'name' => 'Salle A - multimedia', 'capacity' => 24, 'equipment' => 'Video-projecteur, tableau interactif, PCs', 'status' => 'disponible']));
            $salles->push(Salle::create(['site_formation_id' => $site->id, 'name' => 'Salle B - atelier', 'capacity' => 18, 'equipment' => 'Atelier pratique, reseau pedagogique', 'status' => 'disponible']));
        }

        $formationRows = [
            ['Ingenierie pedagogique digitale', 'Conception de parcours blended learning, scenarisation et animation active.', '2026-06-01', '2026-06-12', 'validee', 'Formation pédagogique SFP', 'Pedagogie', 'Avance', 24, 65, 0],
            ['Cybersecurite appliquee aux reseaux', 'Renforcement des competences reseau, securite et gestion des incidents.', '2026-06-15', '2026-06-28', 'planifiee', 'Formation technique CDC', 'Digital', 'Intermediaire', 20, 35, 0],
            ['Maintenance industrielle 4.0', 'Approche capteurs, supervision et maintenance predictive.', '2026-07-03', '2026-07-14', 'proposee', 'Formation technique CDC', 'Industrie', 'Intermediaire', 18, 15, 1],
            ['Evaluation des acquis et approche competences', 'Construction de grilles, epreuves pratiques et suivi des competences.', '2026-07-20', '2026-07-31', 'proposee', 'Formation pédagogique SFP', 'Pedagogie', 'Fondamental', 30, 5, 2],
        ];

        $formations = collect($formationRows)->map(function ($row) use ($centres, $users) {
            return Formation::create([
                'title' => $row[0],
                'description' => $row[1],
                'start_date' => $row[2],
                'end_date' => $row[3],
                'status' => $row[4],
                'type' => $row[5],
                'category' => $row[6],
                'level' => $row[7],
                'capacity' => $row[8],
                'progress' => $row[9],
                'centre_id' => $centres[$row[10]]->id,
                'responsable_id' => $users['responsable_formation-RF201']->id,
            ]);
        });

        foreach ($formations as $formation) {
            $formation->participants()->attach($users['formateur_participant-FP401']->id, ['role' => 'participant', 'progress' => rand(20, 80), 'status' => 'inscrit']);
            $formation->participants()->attach($users['formateur_participant-FP402']->id, ['role' => 'participant', 'progress' => rand(15, 75), 'status' => 'inscrit']);
            $formation->participants()->attach($users['formateur_animateur-FA501']->id, ['role' => 'animateur', 'progress' => 100, 'status' => 'affecte']);
            $formation->participants()->attach($users['formateur_animateur-FA502']->id, ['role' => 'animateur', 'progress' => 100, 'status' => 'affecte']);
        }

        $formations->each(function (Formation $formation, int $index) use ($users, $sites, $salles) {
            $themeA = Theme::create(['formation_id' => $formation->id, 'animateur_id' => $users['formateur_animateur-FA501']->id, 'title' => 'Cadre methodologique', 'description' => 'Objectifs, diagnostic initial et cadrage du parcours.', 'start_date' => $formation->start_date, 'end_date' => $formation->start_date->copy()->addDays(2), 'sort_order' => 1, 'progress' => min(100, $formation->progress + 10)]);
            $themeB = Theme::create(['formation_id' => $formation->id, 'animateur_id' => $users['formateur_animateur-FA502']->id, 'title' => 'Ateliers pratiques et production', 'description' => 'Mises en situation, livrables et consolidation.', 'start_date' => $formation->start_date->copy()->addDays(3), 'end_date' => $formation->end_date, 'sort_order' => 2, 'progress' => $formation->progress]);

            FormationSession::create(['formation_id' => $formation->id, 'theme_id' => $themeA->id, 'site_formation_id' => $sites[$index % 3]->id, 'salle_id' => $salles[($index * 2) % $salles->count()]->id, 'animateur_id' => $users['formateur_animateur-FA501']->id, 'title' => 'Ouverture et diagnostic', 'starts_at' => $formation->start_date->copy()->setTime(9, 0), 'ends_at' => $formation->start_date->copy()->setTime(12, 30), 'room' => 'Salle A'.($index + 1), 'status' => 'planifiee']);
            FormationSession::create(['formation_id' => $formation->id, 'theme_id' => $themeB->id, 'site_formation_id' => $sites[$index % 3]->id, 'salle_id' => $salles[(($index * 2) + 1) % $salles->count()]->id, 'animateur_id' => $users['formateur_animateur-FA502']->id, 'title' => 'Atelier de production', 'starts_at' => $formation->start_date->copy()->addDays(4)->setTime(9, 0), 'ends_at' => $formation->start_date->copy()->addDays(4)->setTime(16, 30), 'room' => 'Salle B'.($index + 1), 'status' => 'planifiee']);

            Document::create(['formation_id' => $formation->id, 'theme_id' => $themeA->id, 'uploaded_by' => $users['formateur_animateur-FA501']->id, 'title' => 'Guide pedagogique '.$formation->title, 'type' => 'PDF', 'file_name' => 'guide-pedagogique.pdf', 'file_path' => 'documents/demo-guide.pdf', 'mime_type' => 'application/pdf']);
        });

        $firstSession = FormationSession::first();
        Absence::create(['formation_session_id' => $firstSession->id, 'user_id' => $users['formateur_participant-FP401']->id, 'recorded_by' => $users['formateur_animateur-FA501']->id, 'absence_date' => $firstSession->starts_at->toDateString(), 'status' => 'justifie', 'justification' => 'Convocation administrative regionale.']);
        Absence::create(['formation_session_id' => $firstSession->id, 'user_id' => $users['formateur_participant-FP402']->id, 'recorded_by' => $users['formateur_animateur-FA501']->id, 'absence_date' => $firstSession->starts_at->toDateString(), 'status' => 'non_justifie']);

        foreach ($formations->take(2) as $formation) {
            foreach ([$users['formateur_participant-FP401'], $users['formateur_participant-FP402']] as $participant) {
                Hebergement::create(['formation_id' => $formation->id, 'user_id' => $participant->id, 'hotel_name' => 'Residence OFPPT '.$formation->centre->city, 'city' => $formation->centre->city, 'check_in' => $formation->start_date, 'check_out' => $formation->end_date, 'status' => 'reserve']);
                Deplacement::create(['formation_id' => $formation->id, 'user_id' => $participant->id, 'from_city' => 'Rabat', 'to_city' => $formation->centre->city, 'travel_date' => $formation->start_date->copy()->subDay(), 'transport_mode' => 'train', 'status' => 'planifie']);
                Evaluation::create(['formation_id' => $formation->id, 'user_id' => $participant->id, 'content_score' => rand(4, 5), 'animation_score' => rand(4, 5), 'logistics_score' => rand(3, 5), 'impact_score' => rand(4, 5), 'comment' => 'Formation utile avec des ateliers directement applicables.']);
            }
        }

        Rapport::create(['created_by' => $users['responsable_formation-RF201']->id, 'title' => 'Rapport participation S1 2026', 'type' => 'participation', 'metrics' => ['taux_participation' => 92, 'progression_moyenne' => 48, 'absences_non_justifiees' => 1]]);
        Rapport::create(['created_by' => $users['responsable_cdc-CDC101']->id, 'title' => 'Impact formations digitales', 'type' => 'impact', 'metrics' => ['satisfaction' => 4.6, 'impact_moyen' => 4.5, 'documents_archives' => 0]]);

        OfpptNotification::create(['title' => 'Nouvelle session planifiee', 'message' => 'Les sessions de juin sont disponibles dans le calendrier.', 'type' => 'planning']);
        OfpptNotification::create(['user_id' => $users['formateur_participant-FP401']->id, 'title' => 'Document disponible', 'message' => 'Un nouveau guide pedagogique est associe a votre formation.', 'type' => 'document']);

        ActivityLog::create(['user_id' => $users['administrateur-ADM001']->id, 'action' => 'initialisation', 'module' => 'systeme', 'description' => 'Chargement des donnees realistes OFPPT.']);
    }
}
