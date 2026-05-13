import { useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
const LOGO_PATH = import.meta.env.VITE_OFPPT_LOGO || '/ofppt-logo.png';

const roleHome = {
  administrateur: 'dashboard',
  responsable_cdc: 'rapports',
  responsable_formation: 'enrollments',
  responsable_dr: 'rapports',
  formateur_participant: 'enrollments',
  formateur_animateur: 'sessions',
};

const roleLabels = {
  administrateur: 'System Administrator',
  responsable_cdc: 'Responsable CDC',
  responsable_formation: 'Training Manager',
  responsable_dr: 'Responsable DR',
  formateur_participant: 'Participant',
  formateur_animateur: 'Trainer / Animator',
};

const roleMissions = {
  administrateur: ['Infrastructure supervision', 'Users, roles and permissions', 'Security monitoring', 'Logs and platform health'],
  responsable_cdc: ['Pedagogical strategy', 'Training plan validation', 'Quality supervision', 'Performance analysis'],
  responsable_formation: ['Enrollment decisions', 'Session planning', 'Trainer assignment', 'Attendance and logistics'],
  responsable_dr: ['Consulter les plans', 'Suivre les absences', 'Lire les rapports', 'Analyser les statistiques'],
  formateur_participant: ['Browse trainings', 'Request enrollment', 'Follow progression and absences', 'Download convocations and certificates'],
  formateur_animateur: ['Assigned sessions only', 'Attendance tracking', 'Pedagogical evaluations', 'Session documents'],
};

const roleHero = {
  administrateur: {
    eyebrow: 'Supervision systeme',
    title: 'Pilotage securise de la plateforme OFPPT',
    text: 'Surveillance globale, gouvernance des acces, roles, permissions et activite systeme.',
  },
  responsable_cdc: {
    eyebrow: 'Coordination CDC',
    title: 'Construire et coordonner les plans de formation',
    text: 'Creation des formations proposees, structuration des themes et suivi des parcours pedagogiques.',
  },
  responsable_formation: {
    eyebrow: 'Planification',
    title: 'Valider, planifier et organiser les sessions',
    text: 'Calendrier, salles, sites, animateurs et logistique reunis dans une vision operationnelle.',
  },
  responsable_dr: {
    eyebrow: 'Consultation regionale',
    title: 'Suivre les indicateurs et rapports de formation',
    text: 'Lecture des plans, absences, evaluations et statistiques pour appuyer la decision.',
  },
  formateur_participant: {
    eyebrow: 'Espace formateur',
    title: 'Suivre ses formations et capitaliser les ressources',
    text: 'Planning personnel, progression, documents pedagogiques et evaluations de satisfaction.',
  },
  formateur_animateur: {
    eyebrow: 'Animation pedagogique',
    title: 'Animer, enrichir et suivre les participants',
    text: 'Gestion des absences, supports pedagogiques, contenus et retours des participants.',
  },
};

const roleAccents = {
  administrateur: { tone: 'System integrity', pulse: '99.9%', action: 'Review audit trail', target: 'logs' },
  responsable_cdc: { tone: 'Pedagogical command', pulse: 'Quality', action: 'Open analytics', target: 'rapports' },
  responsable_formation: { tone: 'Operations control', pulse: 'Planning', action: 'Review enrollments', target: 'enrollments' },
  responsable_dr: { tone: 'Regional intelligence', pulse: 'Insight', action: 'Open reports', target: 'rapports' },
  formateur_participant: { tone: 'Learning journey', pulse: 'Progress', action: 'My certificates', target: 'certificates' },
  formateur_animateur: { tone: 'Session cockpit', pulse: 'Live class', action: 'Open planning', target: 'sessions' },
};

const moduleIntelligence = {
  users: ['Identity governance', 'Scoped access', 'Account lifecycle'],
  formations: ['Lifecycle states', 'Prerequisites', 'Progress engine'],
  sessions: ['Conflict prevention', 'Room capacity', 'Drag planning'],
  enrollments: ['Pending queue', 'Prerequisite checks', 'Decision history'],
  documents: ['Session-scoped files', 'Restricted access', 'Archive ready'],
  certificates: ['Branded PDF', 'Convocation flow', 'Participant access'],
  rapports: ['Impact analytics', 'Exportable insights', 'Executive KPIs'],
  logs: ['Audit trail', 'Security events', 'Change history'],
};

const moduleVisuals = {
  formations: { eyebrow: 'Catalogue', text: 'Parcours techniques CDC et pedagogiques SFP avec suivi de progression.' },
  themes: { eyebrow: 'Contenus', text: 'Themes classes selon un ordre logique et rattaches aux formations.' },
  sessions: { eyebrow: 'Calendrier', text: 'Planification des sessions, salles, sites et animateurs.' },
  absences: { eyebrow: 'Suivi', text: 'Presence, absences, justifications et alertes operationnelles.' },
  documents: { eyebrow: 'Ressources', text: 'Supports pedagogiques centralises, consultables et telechargeables.' },
  rapports: { eyebrow: 'Analyse', text: 'Rapports de participation, progression, absences et impact.' },
  enrollments: { eyebrow: 'Admissions', text: 'Demandes, decisions, prerequis et statuts participants.' },
  certificates: { eyebrow: 'Documents officiels', text: 'Certificats et convocations PDF marques OFPPT.' },
  logs: { eyebrow: 'Audit trail', text: 'Historique securise des actions et evenements importants.' },
};

const navIcons = {
  dashboard: 'grid',
  formations: 'book',
  themes: 'layers',
  sessions: 'calendar',
  absences: 'alert',
  documents: 'file',
  hebergements: 'home',
  deplacements: 'route',
  evaluations: 'star',
  enrollments: 'users',
  prerequisites: 'layers',
  'participant-evaluations': 'star',
  'pedagogical-evaluations': 'chart',
  certificates: 'file',
  rapports: 'chart',
  users: 'users',
  roles: 'shield',
  permissions: 'shield',
  centres: 'building',
  'sites-formation': 'map',
  salles: 'door',
  logs: 'shield',
};

const statIcons = {
  Formations: 'book',
  Sessions: 'calendar',
  Themes: 'layers',
  Absences: 'alert',
  Documents: 'file',
  Users: 'users',
  'Impact moyen': 'chart',
  'Demandes en attente': 'users',
  'Taux completion': 'chart',
};

const columnLabels = {
  name: 'Nom',
  email: 'Email',
  matricule: 'Matricule',
  profile_title: 'Fonction',
  status: 'Statut',
  label: 'Libellé',
  description: 'Description',
  title: 'Titre',
  type: 'Type',
  start_date: 'Début',
  end_date: 'Fin',
  progress: 'Progression',
  sort_order: 'Ordre',
  'formation.title': 'Formation',
  'animateur.name': 'Animateur',
  'siteFormation.name': 'Site',
  'salle.name': 'Salle',
  starts_at: 'Début',
  ends_at: 'Fin',
  'user.name': 'Formateur',
  'formationSession.formation.title': 'Session',
  absence_date: 'Date',
  justification: 'Justification',
  file_name: 'Fichier',
  archived: 'Archivé',
  hotel_name: 'Hôtel',
  city: 'Ville',
  formation_id: 'Formation',
  user_id: 'Formateur',
  check_in: 'Arrivée',
  check_out: 'Départ',
  from_city: 'Départ',
  to_city: 'Arrivée',
  travel_date: 'Date',
  transport_mode: 'Transport',
  content_score: 'Contenu',
  animation_score: 'Animation',
  logistics_score: 'Logistique',
  impact_score: 'Impact',
  comment: 'Commentaire',
  created_at: 'Créé le',
  participant_id: 'Participant',
  'participant.name': 'Participant',
  'reviewedBy.name': 'Validé par',
  'centre.name': 'Centre',
  decision_note: 'Décision',
  reviewed_at: 'Revu le',
  required_formation_id: 'Prérequis',
  'requiredFormation.title': 'Prérequis',
  rule: 'Règle',
  trainer_score: 'Trainer',
  training_score: 'Formation',
  trainer_id: 'Trainer',
  'trainer.name': 'Trainer',
  competency: 'Compétence',
  score: 'Score',
  progression_delta: 'Progression',
  feedback: 'Feedback',
  reference: 'Référence',
  issued_at: 'Émission',
  code: 'Code',
  region: 'Région',
  capacity: 'Capacité',
  manager_name: 'Responsable',
  equipment: 'Équipements',
};

const modules = {
  users: { title: 'Utilisateurs', permission: 'users.read', write: 'users.write', columns: ['name', 'email', 'matricule', 'profile_title', 'centre.name', 'roles', 'status'], fields: [['name', 'Nom complet'], ['email', 'Email', 'email'], ['password', 'Mot de passe', 'password'], ['matricule', 'Matricule'], ['phone', 'Telephone'], ['profile_title', 'Fonction'], ['centre_id', 'Centre', 'api-select', { resource: 'centres', label: 'name' }], ['role_ids', 'Roles', 'multi-api', { resource: 'roles', label: 'label' }], ['status', 'Statut', 'select', ['actif', 'suspendu']]] },
  roles: { title: 'Roles', permission: 'roles.read', write: 'roles.write', columns: ['label', 'name', 'description'], fields: [['label', 'Libelle'], ['name', 'Code'], ['description', 'Description', 'textarea']] },
  permissions: { title: 'Permissions', permission: 'roles.read', write: 'roles.write', columns: ['label', 'name'], fields: [['label', 'Libelle'], ['name', 'Code permission']] },
  formations: { title: 'Formations', permission: 'formations.read', write: 'formations.write', columns: ['title', 'responsable.name', 'participants_count', 'progress', 'status'], fields: [['title', 'Titre'], ['description', 'Description', 'textarea'], ['start_date', 'Date debut', 'date'], ['end_date', 'Date fin', 'date'], ['status', 'Statut', 'select', ['proposee', 'validee', 'planifiee', 'en_cours', 'terminee', 'annulee']], ['type', 'Type', 'select', ['Formation technique CDC', 'Formation pedagogique SFP']], ['category', 'Categorie'], ['level', 'Niveau'], ['capacity', 'Capacite', 'number'], ['progress', 'Progression', 'number'], ['centre_id', 'Centre', 'api-select', { resource: 'centres', label: 'name' }], ['responsable_id', 'Responsable', 'api-select', { resource: 'users', label: 'name' }], ['participant_ids', 'Participants', 'multi-api', { resource: 'users', label: 'name' }], ['animateur_ids', 'Animateurs', 'multi-api', { resource: 'users', label: 'name' }]] },
  themes: { title: 'Themes', permission: 'themes.read', write: 'themes.write', columns: ['title', 'description', 'training_count'], fields: [['formation_id', 'Formation', 'api-select', { resource: 'formations', label: 'title' }], ['animateur_id', 'Animateur', 'api-select', { resource: 'users', label: 'name' }], ['title', 'Theme'], ['description', 'Description', 'textarea'], ['start_date', 'Date debut', 'date'], ['end_date', 'Date fin', 'date'], ['sort_order', 'Ordre', 'number'], ['progress', 'Progression', 'number']] },
  sessions: { title: 'Planification', permission: 'planning.read', write: 'planning.write', columns: ['title', 'formation.title', 'siteFormation.name', 'salle.name', 'starts_at', 'ends_at', 'status'], fields: [['formation_id', 'Formation', 'api-select', { resource: 'formations', label: 'title' }], ['theme_id', 'Theme', 'api-select', { resource: 'themes', label: 'title' }], ['site_formation_id', 'Site', 'api-select', { resource: 'sites-formation', label: 'name' }], ['salle_id', 'Salle', 'api-select', { resource: 'salles', label: 'name' }], ['animateur_id', 'Animateur', 'api-select', { resource: 'users', label: 'name' }], ['title', 'Titre'], ['starts_at', 'Debut', 'datetime-local'], ['ends_at', 'Fin', 'datetime-local'], ['room', 'Salle texte'], ['status', 'Statut', 'select', ['scheduled', 'ongoing', 'completed', 'planifiee', 'en_cours', 'terminee']], ['notes', 'Notes', 'textarea']] },
  absences: { title: 'Absences', permission: 'absences.read', write: 'absences.write', columns: ['user.name', 'formationSession.formation.title', 'absence_date', 'status', 'justification'], fields: [['formation_session_id', 'Session', 'api-select', { resource: 'sessions', label: 'title' }], ['user_id', 'Formateur', 'api-select', { resource: 'users', label: 'name' }], ['absence_date', 'Date', 'date'], ['status', 'Statut', 'select', ['present', 'absent', 'justifie', 'non_justifie']], ['justification', 'Justification', 'textarea']] },
  documents: { title: 'Documents', permission: 'documents.read', write: 'documents.write', columns: ['title', 'type', 'formation.title', 'theme.title', 'file_name', 'archived'], fields: [['formation_id', 'Formation', 'api-select', { resource: 'formations', label: 'title' }], ['theme_id', 'Theme', 'api-select', { resource: 'themes', label: 'title' }], ['title', 'Titre'], ['type', 'Type', 'select', ['PDF', 'Word', 'PowerPoint', 'Image', 'Video', 'Support']], ['file', 'Fichier PDF ou support', 'file'], ['archived', 'Archive', 'checkbox']] },
  hebergements: { title: 'Hebergements', permission: 'logistique.read', write: 'logistique.write', columns: ['hotel_name', 'city', 'formation.title', 'user.name', 'check_in', 'check_out', 'status'], fields: [['formation_id', 'Formation', 'api-select', { resource: 'formations', label: 'title' }], ['user_id', 'Formateur', 'api-select', { resource: 'users', label: 'name' }], ['hotel_name', 'Hotel'], ['city', 'Ville'], ['check_in', 'Arrivee', 'date'], ['check_out', 'Depart', 'date'], ['status', 'Statut', 'select', ['reserve', 'confirme', 'annule']]] },
  deplacements: { title: 'Deplacements', permission: 'logistique.read', write: 'logistique.write', columns: ['from_city', 'to_city', 'formation.title', 'user.name', 'travel_date', 'transport_mode', 'status'], fields: [['formation_id', 'Formation', 'api-select', { resource: 'formations', label: 'title' }], ['user_id', 'Formateur', 'api-select', { resource: 'users', label: 'name' }], ['from_city', 'Ville depart'], ['to_city', 'Ville arrivee'], ['travel_date', 'Date', 'date'], ['transport_mode', 'Transport'], ['status', 'Statut', 'select', ['planifie', 'confirme', 'annule']]] },
  evaluations: { title: 'Evaluations', permission: 'evaluations.read', write: 'evaluations.write', columns: ['formation.title', 'user.name', 'content_score', 'animation_score', 'logistics_score', 'impact_score', 'comment'], fields: [['formation_id', 'Formation', 'api-select', { resource: 'formations', label: 'title' }], ['user_id', 'Participant', 'api-select', { resource: 'users', label: 'name' }], ['content_score', 'Note contenu /5', 'number'], ['animation_score', 'Note animation /5', 'number'], ['logistics_score', 'Note logistique /5', 'number'], ['impact_score', 'Impact competences /5', 'number'], ['comment', 'Avis et commentaire', 'textarea']] },
  enrollments: { title: 'Inscriptions', permission: 'enrollments.read', write: 'enrollments.write', columns: ['formation.title', 'participant.name', 'status', 'reviewedBy.name', 'decision_note', 'reviewed_at'], fields: [['formation_id', 'Formation', 'api-select', { resource: 'formations', label: 'title' }], ['participant_id', 'Participant', 'api-select', { resource: 'users', label: 'name' }], ['status', 'Statut', 'select', ['pending', 'accepted', 'rejected']], ['decision_note', 'Decision', 'textarea']] },
  prerequisites: { title: 'Prerequis', permission: 'formations.read', write: 'formations.write', columns: ['formation.title', 'requiredFormation.title', 'rule'], fields: [['formation_id', 'Formation avancee', 'api-select', { resource: 'formations', label: 'title' }], ['required_formation_id', 'Formation requise', 'api-select', { resource: 'formations', label: 'title' }], ['rule', 'Regle', 'select', ['completed', 'accepted']]] },
  'participant-evaluations': { title: 'Evaluation participant', permission: 'evaluations.read', write: 'evaluations.write', columns: ['formation.title', 'participant.name', 'trainer.name', 'trainer_score', 'training_score', 'logistics_score', 'comment'], fields: [['formation_id', 'Formation', 'api-select', { resource: 'formations', label: 'title' }], ['formation_session_id', 'Session', 'api-select', { resource: 'sessions', label: 'title' }], ['participant_id', 'Participant', 'api-select', { resource: 'users', label: 'name' }], ['trainer_id', 'Trainer', 'api-select', { resource: 'users', label: 'name' }], ['trainer_score', 'Trainer /5', 'number'], ['training_score', 'Formation /5', 'number'], ['logistics_score', 'Logistique /5', 'number'], ['comment', 'Commentaire', 'textarea']] },
  'pedagogical-evaluations': { title: 'Evaluation pedagogique', permission: 'pedagogy.evaluate', write: 'pedagogy.evaluate', columns: ['formation.title', 'participant.name', 'trainer.name', 'competency', 'score', 'progression_delta', 'feedback'], fields: [['formation_id', 'Formation', 'api-select', { resource: 'formations', label: 'title' }], ['formation_session_id', 'Session', 'api-select', { resource: 'sessions', label: 'title' }], ['participant_id', 'Participant', 'api-select', { resource: 'users', label: 'name' }], ['trainer_id', 'Trainer', 'api-select', { resource: 'users', label: 'name' }], ['competency', 'Competence'], ['score', 'Score /5', 'number'], ['progression_delta', 'Progression automatique', 'number'], ['feedback', 'Feedback', 'textarea']] },
  certificates: { title: 'Certificats & convocations', permission: 'certificates.read', write: 'certificates.write', columns: ['formation.title', 'participant.name', 'type', 'reference', 'issued_at', 'status'], fields: [['formation_id', 'Formation', 'api-select', { resource: 'formations', label: 'title' }], ['participant_id', 'Participant', 'api-select', { resource: 'users', label: 'name' }], ['type', 'Type', 'select', ['certificate', 'convocation']], ['reference', 'Reference'], ['issued_at', 'Emission', 'date'], ['status', 'Statut', 'select', ['draft', 'issued', 'revoked']]] },
  rapports: { title: 'Rapports', permission: 'rapports.read', write: 'rapports.write', columns: ['title', 'type', 'created_at'], fields: [['title', 'Titre'], ['type', 'Type', 'select', ['participation', 'progression', 'absences', 'evaluations', 'impact']]] },
  centres: { title: 'Centres CDC', permission: 'centres.read', write: 'centres.write', columns: ['code', 'name', 'region', 'city'], fields: [['code', 'Code'], ['name', 'Nom'], ['region', 'Region'], ['city', 'Ville'], ['address', 'Adresse', 'textarea']] },
  'sites-formation': { title: 'Sites de formation', permission: 'logistique.read', write: 'logistique.write', columns: ['name', 'city', 'capacity', 'manager_name'], fields: [['centre_id', 'CDC', 'api-select', { resource: 'centres', label: 'name' }], ['name', 'Nom'], ['city', 'Ville'], ['address', 'Adresse', 'textarea'], ['capacity', 'Capacite', 'number'], ['manager_name', 'Responsable']] },
  salles: { title: 'Salles', permission: 'logistique.read', write: 'logistique.write', columns: ['name', 'siteFormation.name', 'capacity', 'equipment', 'status'], fields: [['site_formation_id', 'Site', 'api-select', { resource: 'sites-formation', label: 'name' }], ['name', 'Nom'], ['capacity', 'Capacite', 'number'], ['equipment', 'Equipements'], ['status', 'Statut', 'select', ['disponible', 'reservee', 'maintenance']]] },
  logs: { title: 'Audit logs', permission: 'logs.read', write: 'logs.write', columns: ['user.name', 'action', 'module', 'description', 'created_at'], fields: [['action', 'Action'], ['module', 'Module'], ['description', 'Description', 'textarea']] },
};
const SPECIAL_SCREENS = new Set(['dashboard', 'profile']);
const BUSINESS_DELETE_LOCKED = new Set(['formations', 'themes', 'sessions', 'absences', 'documents', 'evaluations', 'rapports']);

const roleAccess = {
  administrateur: { read: ['users', 'roles', 'permissions', 'logs'], write: ['users', 'roles', 'permissions'], export: ['users', 'roles', 'permissions', 'logs'], import: ['users'], archive: ['users', 'roles', 'permissions'] },
  responsable_formation: { read: ['formations', 'themes', 'sessions', 'enrollments', 'absences', 'hebergements', 'deplacements', 'sites-formation', 'salles', 'certificates', 'rapports', 'evaluations', 'participant-evaluations'], write: ['formations', 'themes', 'sessions', 'enrollments', 'absences', 'hebergements', 'deplacements', 'sites-formation', 'salles', 'certificates'], export: ['formations', 'sessions', 'enrollments', 'absences', 'hebergements', 'deplacements', 'sites-formation', 'salles', 'certificates', 'rapports'], import: ['formations', 'sites-formation', 'salles'], archive: ['formations', 'themes', 'sessions', 'enrollments', 'absences', 'hebergements', 'deplacements', 'sites-formation', 'salles', 'certificates'] },
  responsable_cdc: { read: ['formations', 'themes', 'rapports', 'evaluations', 'participant-evaluations', 'pedagogical-evaluations'], write: ['formations', 'themes', 'rapports'], export: ['formations', 'themes', 'rapports', 'evaluations'], import: ['formations'], archive: ['formations', 'themes', 'rapports'] },
  responsable_dr: { read: ['formations', 'themes', 'sessions', 'absences', 'hebergements', 'deplacements', 'evaluations', 'rapports'], write: [], export: ['formations', 'sessions', 'absences', 'hebergements', 'deplacements', 'evaluations', 'rapports'], import: [], archive: [] },
  formateur_animateur: { read: ['formations', 'themes', 'sessions', 'absences', 'documents', 'pedagogical-evaluations'], write: ['absences', 'documents', 'pedagogical-evaluations'], export: [], import: [], archive: ['documents'] },
  formateur_participant: { read: ['formations', 'sessions', 'absences', 'documents', 'enrollments', 'evaluations', 'participant-evaluations', 'certificates'], write: ['enrollments', 'evaluations', 'participant-evaluations'], export: [], import: [], archive: [] },
};

function roleCan(user, action, resource) {
  const role = user?.roles?.[0]?.name;
  return Boolean(roleAccess[role]?.[action]?.includes(resource));
}

function permissionsFromUser(user) {
  return new Set(user?.roles?.flatMap((role) => role.permissions || []) || []);
}

function hashScreen() {
  const value = decodeURIComponent(window.location.hash.replace(/^#\/?/, '') || '');
  return value || '';
}

function isScreenAllowed(screen, permissions, user = null) {
  if (SPECIAL_SCREENS.has(screen)) return true;
  const config = modules[screen];
  return Boolean(config && permissions.has(config.permission) && (!user || roleCan(user, 'read', screen)));
}

function fallbackScreen(user, permissions) {
  const role = user?.roles?.[0]?.name;
  const preferred = roleHome[role] || 'dashboard';
  return isScreenAllowed(preferred, permissions, user) ? preferred : 'dashboard';
}

function resolveInitialScreen(user) {
  const permissions = permissionsFromUser(user);
  const requested = hashScreen() || localStorage.getItem('ofppt_screen') || fallbackScreen(user, permissions);
  return isScreenAllowed(requested, permissions, user) ? requested : fallbackScreen(user, permissions);
}

function api(path, options = {}) {
  const token = localStorage.getItem('ofppt_token');
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  }).then(async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('ofppt_token');
        window.dispatchEvent(new Event('ofppt:unauthorized'));
      }
      if (response.status === 403) {
        throw new Error(data.message || 'Acces non autorise pour votre profil.');
      }
      throw new Error(data.message || 'Erreur API');
    }
    return data;
  });
}

function valueAt(row, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], row);
}

function Icon({ name }) {
  const common = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' };
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z" /></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5z" /><path d="m3 13 9 5 9-5" /><path d="m3 18 9 5 9-5" /></>,
    calendar: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M8 2v4M16 2v4M3 10h18" /></>,
    alert: <><path d="M10.3 4.3 2.8 17.2A2 2 0 0 0 4.5 20h15a2 2 0 0 0 1.7-2.8L13.7 4.3a2 2 0 0 0-3.4 0z" /><path d="M12 9v4M12 17h.01" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></>,
    home: <><path d="M3 11 12 3l9 8" /><path d="M5 10v11h14V10" /><path d="M9 21v-6h6v6" /></>,
    route: <><circle cx="6" cy="18" r="3" /><circle cx="18" cy="6" r="3" /><path d="M9 18h3a6 6 0 0 0 6-6V9" /></>,
    star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1-4.4-4.3 6.1-.9L12 3z" />,
    chart: <><path d="M4 19V5" /><path d="M4 19h16" /><path d="M8 15v-4M12 15V8M16 15v-7" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    building: <><path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" /><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2" /></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6z" /><path d="M9 3v15M15 6v15" /></>,
    door: <><path d="M6 21V3h10a2 2 0 0 1 2 2v16" /><path d="M10 12h.01" /></>,
  };
  return <svg className="icon" {...common}>{paths[name] || paths.grid}</svg>;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState('dashboard');
  const [authReady, setAuthReady] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('ofppt_theme') || 'light');
  const [toast, setToast] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('ofppt_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem('ofppt_token');
      localStorage.removeItem('ofppt_screen');
      setUser(null);
      setAuthReady(true);
      window.history.replaceState(null, '', window.location.pathname);
    };

    window.addEventListener('ofppt:unauthorized', handleUnauthorized);

    if (!localStorage.getItem('ofppt_token')) {
      setAuthReady(true);
      return () => window.removeEventListener('ofppt:unauthorized', handleUnauthorized);
    }

    api('/auth/me').then(({ user: loadedUser }) => {
      const nextScreen = resolveInitialScreen(loadedUser);
      setUser(loadedUser);
      setScreen(nextScreen);
      localStorage.setItem('ofppt_screen', nextScreen);
      window.history.replaceState(null, '', `#/${nextScreen}`);
    }).catch(() => {
      localStorage.removeItem('ofppt_token');
      localStorage.removeItem('ofppt_screen');
    }).finally(() => setAuthReady(true));

    return () => window.removeEventListener('ofppt:unauthorized', handleUnauthorized);
  }, []);

  const permissions = useMemo(() => new Set(user?.roles?.flatMap((role) => role.permissions || []) || []), [user]);
  const role = user?.roles?.[0]?.name;
  const can = (permission) => permissions.has(permission);

  const navigate = (nextScreen) => {
    const resolved = isScreenAllowed(nextScreen, permissions, user) ? nextScreen : fallbackScreen(user, permissions);
    setScreen(resolved);
    setSidebarOpen(false);
    localStorage.setItem('ofppt_screen', resolved);
    window.history.replaceState(null, '', `#/${resolved}`);
  };

  useEffect(() => {
    if (!user || !authReady || isScreenAllowed(screen, permissions, user)) return;
    navigate(fallbackScreen(user, permissions));
  }, [user, authReady, screen, permissions]);

  useEffect(() => {
    if (!user) return undefined;
    const handleHashChange = () => {
      const requested = hashScreen();
      if (requested) navigate(requested);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [user, permissions]);

  if (!authReady) {
    return <AppBoot />;
  }

  if (!user) {
    return <Login onLogin={(loggedUser) => {
      const nextScreen = resolveInitialScreen(loggedUser);
      setUser(loggedUser);
      setScreen(nextScreen);
      localStorage.setItem('ofppt_screen', nextScreen);
      window.history.replaceState(null, '', `#/${nextScreen}`);
    }} />;
  }

  const nav = [
    ['dashboard', 'Dashboard', 'permissionless'],
    ['formations', 'Formations', 'formations.read'],
    ['themes', 'Themes', 'themes.read'],
    ['prerequisites', 'Prerequis', 'formations.read'],
    ['enrollments', 'Inscriptions', 'enrollments.read'],
    ['sessions', 'Planning', 'planning.read'],
    ['absences', 'Absences', 'absences.read'],
    ['documents', 'Documents', 'documents.read'],
    ['hebergements', 'Hebergements', 'logistique.read'],
    ['deplacements', 'Deplacements', 'logistique.read'],
    ['evaluations', 'Evaluations', 'evaluations.read'],
    ['participant-evaluations', 'Satisfaction', 'evaluations.read'],
    ['pedagogical-evaluations', 'Pedagogie', 'pedagogy.evaluate'],
    ['certificates', 'Certificats', 'certificates.read'],
    ['rapports', 'Rapports', 'rapports.read'],
    ['users', 'Utilisateurs', 'users.read'],
    ['roles', 'Roles', 'roles.read'],
    ['permissions', 'Permissions', 'roles.read'],
    ['logs', 'Audit logs', 'logs.read'],
    ['centres', 'Centres CDC', 'centres.read'],
    ['sites-formation', 'Sites', 'logistique.read'],
    ['salles', 'Salles', 'logistique.read'],
  ].filter((item) => item[2] === 'permissionless' || (can(item[2]) && roleCan(user, 'read', item[0])));

  return (
    <div className="app-shell">
      {toast && <div className="toast">{toast}</div>}
      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} navigate={navigate} />}
      {sidebarOpen && <button className="sidebar-backdrop" aria-label="Fermer le menu" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand"><img src={LOGO_PATH} alt="Logo OFPPT" /><div><span>OFPPT</span><small>Academie des formateurs</small></div></div>
        <div className="sidebar-section">Navigation</div>
        <nav>{nav.map(([key, label]) => <button key={key} className={screen === key ? 'active' : ''} onClick={() => navigate(key)}><Icon name={navIcons[key]} /><span>{label}</span></button>)}</nav>
      </aside>
      <main>
        <header className="topbar">
          <button className="menu-trigger" onClick={() => setSidebarOpen(true)} aria-label="Ouvrir le menu"><Icon name="grid" /></button>
          <div className="topbar-title"><strong>{roleLabels[role]}</strong><span>{modules[screen]?.title || (screen === 'profile' ? 'Profil utilisateur' : 'Dashboard')}</span></div>
          <button className="topbar-search global-trigger" onClick={() => setSearchOpen(true)}><Icon name="grid" /><span>Recherche globale</span><kbd>Ctrl K</kbd></button>
          <div className="topbar-actions">
            <button className="icon-action" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? 'Sombre' : 'Clair'}</button>
            <button className="profile-pill" onClick={() => navigate('profile')}><b>{user.name?.slice(0, 1)}</b><span>{user.name}</span></button>
            <button className="logout-action" onClick={() => api('/auth/logout', { method: 'POST' }).finally(() => { localStorage.removeItem('ofppt_token'); localStorage.removeItem('ofppt_screen'); setUser(null); window.history.replaceState(null, '', window.location.pathname); })}>Deconnexion</button>
          </div>
        </header>
        {screen === 'dashboard'
          ? <Dashboard role={role} setScreen={navigate} can={can} />
          : screen === 'profile'
            ? <ProfilePage user={user} permissions={permissions} />
          : modules[screen]
            ? <ModulePage name={screen} config={modules[screen]} canWrite={can(modules[screen]?.write) && roleCan(user, 'write', screen)} canExport={roleCan(user, 'export', screen)} canImport={roleCan(user, 'import', screen)} canArchive={roleCan(user, 'archive', screen)} setToast={setToast} currentUser={user} />
            : <NotFoundPanel onHome={() => navigate(fallbackScreen(user, permissions))} />}
      </main>
    </div>
  );
}

function AppBoot() {
  return (
    <div className="app-boot">
      <img src={LOGO_PATH} alt="Logo OFPPT" />
      <div className="boot-loader" />
      <strong>Chargement securise de la plateforme</strong>
    </div>
  );
}

function Login({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: 'admin@ofppt.ma', password: 'password123', token: '', password_confirmation: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      if (mode === 'forgot') {
        const data = await api('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email: form.email }) });
        setMessage(`${data.message} Code demo: ${data.demo_reset_code}`);
        setMode('reset');
      } else if (mode === 'reset') {
        const data = await api('/auth/reset-password', { method: 'POST', body: JSON.stringify({ email: form.email, token: form.token, password: form.password, password_confirmation: form.password_confirmation }) });
        setMessage(data.message);
        setMode('login');
      } else {
        const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email: form.email, password: form.password }) });
        localStorage.setItem('ofppt_token', data.token);
        onLogin(data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <section className="login-visual">
        <div className="login-content">
          <img className="login-logo" src={LOGO_PATH} alt="Logo OFPPT" />
          <span className="eyebrow">Plateforme institutionnelle OFPPT</span>
          <h1>Gestion des Formations des Formateurs</h1>
          <p>Un espace professionnel pour planifier, suivre et evaluer les formations, les ressources pedagogiques et la logistique des formateurs.</p>
        </div>
        <div className="login-photo-card">
          <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=75" alt="Formation professionnelle" />
          <div><strong>Centres de formation OFPPT</strong><span>Parcours, sessions, documents et evaluations centralises.</span></div>
        </div>
      </section>
      <form className="login-card" onSubmit={submit}>
        <div className="login-card-head"><img src={LOGO_PATH} alt="" /><span>Espace securise</span></div>
        <h2>{mode === 'forgot' ? 'Mot de passe oublie' : mode === 'reset' ? 'Reset password' : 'Connexion'}</h2>
        <label>Email<input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        {mode === 'reset' && <label>Code reset<input value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value })} /></label>}
        {mode !== 'forgot' && <label>Mot de passe<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>}
        {mode === 'reset' && <label>Confirmation<input type="password" value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} /></label>}
        {error && <p className="form-error">{error}</p>}
        {message && <p className="form-success">{message}</p>}
        <button disabled={loading}>{loading ? 'Traitement...' : mode === 'login' ? 'Se connecter' : 'Valider'}</button>
        <button type="button" className="link-button" onClick={() => setMode(mode === 'login' ? 'forgot' : 'login')}>{mode === 'login' ? 'Mot de passe oublie ?' : 'Retour connexion'}</button>
        <small>Demo: admin@ofppt.ma, cdc@ofppt.ma, formation@ofppt.ma, dr@ofppt.ma, participant@ofppt.ma, animateur@ofppt.ma. Mot de passe: password123</small>
      </form>
    </div>
  );
}

function GlobalSearch({ onClose, navigate }) {
  const [q, setQ] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (q.trim().length < 2) {
      setRows([]);
      return undefined;
    }
    setLoading(true);
    const timer = window.setTimeout(() => {
      api(`/global-search?q=${encodeURIComponent(q)}`)
        .then((data) => setRows(data.data || []))
        .catch(() => setRows([]))
        .finally(() => setLoading(false));
    }, 240);
    return () => window.clearTimeout(timer);
  }, [q]);

  return (
    <div className="modal-backdrop search-backdrop" onClick={onClose}>
      <section className="global-search" onClick={(event) => event.stopPropagation()}>
        <div className="search-command"><Icon name="grid" /><input autoFocus placeholder="Search trainings, sessions, users, documents..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="search-results">
          {loading && <div className="mini-skeleton" />}
          {rows.map((row) => (
            <button key={`${row.resource}-${row.id}`} onClick={() => { navigate(row.resource); onClose(); }}>
              <span>{modules[row.resource]?.title || row.resource}</span>
              <strong>{row.title}</strong>
              {row.status && <small>{row.status}</small>}
            </button>
          ))}
          {!loading && q.length >= 2 && !rows.length && <div className="empty compact-empty"><strong>No matching operational record</strong><span>Try a participant, formation, reference, or status.</span></div>}
        </div>
      </section>
    </div>
  );
}

function Dashboard({ role, setScreen, can }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const load = () => api('/dashboard').then((payload) => active && setData(payload)).catch((err) => active && setError(err.message));
    load();
    const timer = window.setInterval(load, 30000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);
  if (error) return <div className="content"><Notice type="error" title="Dashboard indisponible" text={error} /></div>;
  if (!data) return <div className="content"><div className="skeleton" /></div>;
  const hero = roleHero[role] || roleHero.formateur_participant;

  const cards = [
    ['Users', data.stats.users, 'users'],
    ['Formations', data.stats.formations, 'formations'],
    ['Demandes en attente', data.stats.enrollments_pending || 0, 'enrollments'],
    ['Sessions', data.stats.sessions, 'sessions'],
    ['Themes', data.stats.themes, 'themes'],
    ['Absences', data.stats.absences, 'absences'],
    ['Documents', data.stats.documents, 'documents'],
    ['Taux completion', `${data.stats.completion_rate || 0}%`, 'rapports'],
    ['Impact moyen', `${data.stats.evaluation_average}/5`, 'evaluations'],
  ].filter((card) => can({ sessions: 'planning.read', rapports: 'rapports.read', users: 'users.read' }[card[2]] || `${card[2]}.read`) && roleAccess[role]?.read.includes(card[2]));

  return (
    <div className={`content role-${role}`}>
      <section className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <span className="eyebrow">{hero.eyebrow}</span>
          <h1>{hero.title}</h1>
          <p>{hero.text}</p>
          <div className="quick-actions">
            {cards.slice(0, 3).map(([label,, target]) => <button key={label} onClick={() => setScreen(target)}><Icon name={navIcons[target]} />{label}</button>)}
            {can('rapports.read') && <button onClick={() => setScreen('rapports')}><Icon name="chart" />Rapports</button>}
          </div>
        </div>
        <RoleCommandCenter role={role} data={data} setScreen={setScreen} />
      </section>
      <section className="stats-grid">{cards.map(([label, value, target]) => <button className="stat-card" key={label} onClick={() => setScreen(target)}><div className="stat-icon"><Icon name={statIcons[label]} /></div><span>{label}</span><strong>{value}</strong><small>{metricHint(label, value)}</small></button>)}</section>
      <AnalyticsCockpit data={data} />
      <section className="dashboard-grid">
        <Panel title="Responsabilites du profil"><div className="mission-list">{(roleMissions[role] || []).map((mission) => <span key={mission}>{mission}</span>)}</div></Panel>
        <Panel title="Vue analytique"><MiniChart stats={data.stats} /></Panel>
        <Panel title="Espace role"><div className="workspace-grid">{(data.workspace || []).map((item) => <span key={item}>{item.replaceAll('_', ' ')}</span>)}</div></Panel>
        <Panel title="Progression des formations">{data.progression.map((item) => <Progress key={item.title} label={item.title} value={item.progress} status={item.status} />)}</Panel>
        <Panel title="Sessions a venir"><div className="timeline">{data.sessions.map((s) => <div key={s.id}><strong>{s.title}</strong><span>{s.formation?.title}</span><small>{new Date(s.starts_at).toLocaleString('fr-FR')}</small></div>)}</div></Panel>
        <Panel title="Alertes absences"><div className="compact-list">{data.alerts.map((a) => <div key={a.id}><strong>{a.user?.name}</strong><span>{a.status}</span></div>)}</div></Panel>
        <Panel title="Analytics avances"><div className="compact-list"><div><strong>Best trainer</strong><span>{data.rankings?.best_trainer?.trainer?.name || '-'}</span></div><div><strong>Top theme</strong><span>{data.rankings?.top_theme?.title || '-'}</span></div></div></Panel>
        <Panel title="Activite recente"><div className="compact-list">{data.activity.map((a) => <div key={a.id}><strong>{a.module}</strong><span>{a.description}</span></div>)}</div></Panel>
      </section>
    </div>
  );
}

function RoleCommandCenter({ role, data, setScreen }) {
  const accent = roleAccents[role] || roleAccents.formateur_participant;
  const notification = data.notifications?.[0];
  return (
    <aside className="role-command">
      <div className="role-command-top">
        <span>{accent.tone}</span>
        <strong>{accent.pulse}</strong>
      </div>
      <div className="role-signal">
        <i />
        <div>
          <b>{notification?.title || 'Operational pulse active'}</b>
          <small>{notification?.message || 'No critical notification at this moment.'}</small>
        </div>
      </div>
      <button onClick={() => setScreen(accent.target)}><Icon name={navIcons[accent.target] || 'grid'} />{accent.action}</button>
    </aside>
  );
}

function AnalyticsCockpit({ data }) {
  const summary = [
    ['Completion', data.stats.completion_rate || 0],
    ['Impact', Math.round((data.stats.evaluation_average || 0) * 20)],
    ['Documents', Math.min(100, (data.stats.documents || 0) * 12)],
    ['Attendance', Math.max(20, 100 - (data.stats.absences || 0) * 8)],
  ];
  const max = Math.max(...summary.map(([, value]) => Number(value) || 1), 1);

  return (
    <section className="analytics-cockpit">
      <div className="cockpit-orbit">
        <div className="radial-meter" style={{ '--value': `${data.stats.completion_rate || 0}%` }}>
          <strong>{data.stats.completion_rate || 0}%</strong>
          <span>Completion</span>
        </div>
      </div>
      <div className="cockpit-bars">
        {summary.map(([label, value]) => (
          <div key={label} className="cockpit-bar">
            <span>{label}</span>
            <i style={{ height: `${Math.max(10, (value / max) * 100)}%` }} />
            <b>{value}%</b>
          </div>
        ))}
      </div>
      <div className="cockpit-feed">
        <span className="eyebrow">Live operations</span>
        <strong>{data.notifications?.[0]?.title || 'System synchronized'}</strong>
        <p>{data.notifications?.[0]?.message || 'Dashboard refreshes automatically every 30 seconds.'}</p>
      </div>
    </section>
  );
}

function ModulePage({ name, config, canWrite, canExport, canImport, canArchive, setToast, currentUser }) {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({});
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [details, setDetails] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [formationFilter, setFormationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [importing, setImporting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const canDelete = canWrite && canArchive && !BUSINESS_DELETE_LOCKED.has(name);

  const load = () => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams({ q, page, per_page: name === 'themes' ? 100 : 10 });
    if (formationFilter && ['themes', 'sessions', 'documents', 'enrollments', 'certificates'].includes(name)) params.set('formation_id', formationFilter);
    if (statusFilter) params.set('status', statusFilter);
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    const perPage = name === 'themes' ? 100 : 10;
    api(`/${name}?${params.toString()}`).then((data) => {
      setRows(data.data || []);
      setMeta(data);
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  };

  useEffect(load, [name, page, formationFilter]);

  const exportRows = () => authenticatedDownload(`/${name}/export/csv`, `${name}-export.csv`).catch((err) => setError(err.message));
  const exportReportPdf = (reportId = null) => {
    const suffix = reportId ? `/${reportId}` : '';
    authenticatedDownload(`/rapports${suffix}/pdf`, reportId ? `rapport-${reportId}.pdf` : 'rapports-ofppt.pdf').catch((err) => setError(err.message));
  };

  const importRows = async (file) => {
    if (!file) return;
    setImporting(true);
    const body = new FormData();
    body.append('file', file);
    try {
      const data = await api(`/${name}/import/csv`, { method: 'POST', body });
      setToast(data.message || 'Import termine');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const remove = async (id) => {
    try {
      await api(`/${name}/${id}`, { method: 'DELETE' });
      setToast('Suppression effectuee');
      setPendingDelete(null);
      load();
    } catch (err) {
      setError(err.message);
      setPendingDelete(null);
    }
  };

  const archive = async (row) => {
    try {
      await api(`/${name}/${row.id}/archive`, { method: 'POST' });
      setToast('Element archive');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const openDetails = async (row) => {
    if (name === 'formations') {
      const data = await api(`/formations/${row.id}`);
      setDetails({ type: 'formation', data });
    }
    if (name === 'themes') {
      setDetails({ type: 'theme', data: row });
    }
    if (name === 'rapports') {
      const analytics = await api('/analytics');
      setDetails({ type: 'report', data: row, analytics });
    }
  };

  const displayRows = name === 'themes' ? groupThemes(rows) : rows;

  return (
    <div className="content">
      <ModuleHeader name={name} title={config.title} canWrite={canWrite} onCreate={() => setEditing({})} />
      <div className="toolbar">
        <div className="search-box"><Icon name="grid" /><input placeholder="Recherche..." value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} /></div>
        {['themes', 'sessions', 'documents', 'enrollments', 'certificates'].includes(name) && <input placeholder="ID formation" value={formationFilter} onChange={(e) => setFormationFilter(e.target.value)} />}
        <input placeholder="Statut" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        <button onClick={load}><Icon name="grid" />Filtrer</button>
        {canExport && <button onClick={exportRows}><Icon name="file" />Excel</button>}
        {canImport && ['users', 'formations', 'salles', 'sites-formation'].includes(name) && <label className="import-pill">Import<input type="file" accept=".csv" disabled={importing} onChange={(e) => importRows(e.target.files[0])} /></label>}
        {canExport && name === 'rapports' && <button onClick={() => exportReportPdf()}><Icon name="file" />Export PDF</button>}
      </div>
      {error && <Notice type="error" title="Action impossible" text={error} />}
      {name === 'themes' && <Notice title="Suivi pedagogique" text="Themes = categories. Ouvrez un theme pour consulter les formations, la progression, les statuts et les participants." />}
      {name === 'sessions' && <CalendarBoard sessions={rows} onMoved={load} setToast={setToast} />}
      <ModuleIntelligence name={name} count={meta.total ?? rows.length} canWrite={canWrite} />
      {loading ? <div className="skeleton" /> : <DataTable moduleName={name} rows={displayRows} columns={config.columns} canWrite={canWrite} canArchive={canArchive} canExport={canExport} canDelete={canDelete} onEdit={(row) => setEditing(row.source || row)} onArchive={archive} onDelete={setPendingDelete} onDetails={openDetails} onReportPdf={exportReportPdf} />}
      <div className="pagination"><button disabled={page <= 1} onClick={() => setPage(page - 1)}>Precedent</button><span>Page {meta.current_page || page} / {meta.last_page || 1}</span><button disabled={page >= (meta.last_page || 1)} onClick={() => setPage(page + 1)}>Suivant</button></div>
      {pendingDelete && <ConfirmModal title="Confirmer la suppression" text={`Voulez-vous supprimer cet element du module ${config.title} ?`} onCancel={() => setPendingDelete(null)} onConfirm={() => remove(pendingDelete.id)} />}
      {details?.type === 'formation' && <FormationDetails formation={details.data} onClose={() => setDetails(null)} />}
      {details?.type === 'theme' && <ThemeDetails theme={details.data} onClose={() => setDetails(null)} />}
      {details?.type === 'report' && <ReportDetails report={details.data} analytics={details.analytics} onClose={() => setDetails(null)} onExportPdf={() => exportReportPdf(details.data.id)} />}
      {editing && <Editor moduleName={name} config={config} item={editing} currentUser={currentUser} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); setToast('Enregistrement effectue'); load(); }} />}
    </div>
  );
}

function ModuleIntelligence({ name, count, canWrite }) {
  const items = moduleIntelligence[name] || ['Filtered view', 'Role scoped', 'Audit ready'];
  return (
    <section className="module-intelligence">
      <div>
        <span className="eyebrow">Operational layer</span>
        <strong>{count} records in scope</strong>
      </div>
      <div className="intelligence-chips">
        {items.map((item) => <span key={item}>{item}</span>)}
        <span>{canWrite ? 'Write enabled' : 'Read only'}</span>
      </div>
    </section>
  );
}

function ProfilePage({ user, permissions }) {
  const role = user.roles?.[0]?.name;
  return (
    <div className="content">
      <section className="profile-hero">
        <div className="profile-avatar">{user.name?.slice(0, 1)}</div>
        <div>
          <span className="eyebrow">Profil utilisateur</span>
          <h1>{user.name}</h1>
          <p>{roleLabels[role]} - {user.profile_title || 'Compte OFPPT'}</p>
        </div>
      </section>
      <section className="profile-grid">
        <Panel title="Informations"><div className="profile-list"><span>Email</span><strong>{user.email}</strong><span>Matricule</span><strong>{user.matricule || '-'}</strong><span>Role</span><strong>{roleLabels[role]}</strong></div></Panel>
        <Panel title="Responsabilites"><div className="mission-list">{(roleMissions[role] || []).map((mission) => <span key={mission}>{mission}</span>)}</div></Panel>
        <Panel title="Permissions actives"><div className="permission-cloud">{Array.from(permissions).map((permission) => <span key={permission}>{permission}</span>)}</div></Panel>
      </section>
    </div>
  );
}

function NotFoundPanel({ onHome }) {
  return (
    <div className="content">
      <Notice title="Page non disponible" text="Cette page est introuvable ou n'est pas autorisee pour votre profil. La navigation a ete securisee pour eviter une page blanche." />
      <button className="primary-action standalone" onClick={onHome}><Icon name="grid" />Retour espace autorise</button>
    </div>
  );
}

function Notice({ type = 'info', title, text }) {
  return (
    <section className={`notice notice-${type}`}>
      <Icon name={type === 'error' ? 'alert' : 'shield'} />
      <div><strong>{title}</strong><span>{text}</span></div>
    </section>
  );
}

function DataTable({ moduleName, rows, columns, canWrite, canArchive, canExport, canDelete, onEdit, onArchive, onDelete, onDetails, onReportPdf }) {
  const [rowDetails, setRowDetails] = useState(null);
  const visibleColumns = columns.filter((column) => rows.length === 0 || rows.some((row) => hasMeaningfulValue(valueAt(row, column))));
  const primaryColumn = preferredPrimaryColumn(moduleName, visibleColumns);
  const displayColumns = compactDisplayColumns(moduleName, visibleColumns, primaryColumn);
  const hiddenColumns = visibleColumns.filter((column) => column !== primaryColumn && !displayColumns.includes(column));
  const tableColumns = [primaryColumn, ...displayColumns].filter(Boolean);
  const hasMore = hiddenColumns.length > 0;

  return (
    <>
    <div className={`table-wrap table-${moduleName}`}>
      <div className="table-shell-head">
        <div>
          <span className="eyebrow">Operational records</span>
          <strong>{modules[moduleName]?.title || moduleName}</strong>
        </div>
        <small>{rows.length} visible rows</small>
      </div>
      <table>
        <thead><tr>{tableColumns.map((c, index) => <th key={c} className={`${columnClass(c)} ${index === 0 ? 'col-primary' : ''}`}>{index === 0 ? 'Record' : tableLabel(c)}</th>)}{hasMore && <th className="col-more">More</th>}<th className="col-actions">Actions</th></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {tableColumns.map((column, index) => (
                <td key={column} data-label={index === 0 ? 'Record' : tableLabel(column)} className={`${columnClass(column)} ${index === 0 ? 'col-primary' : ''}`}>
                  {index === 0 ? renderPrimaryCell(moduleName, row, column, hiddenColumns) : renderCell(column, valueAt(row, column))}
                </td>
              ))}
              {hasMore && (
                <td className="col-more" data-label="More">
                  <button type="button" className="row-details-button" onClick={() => setRowDetails({ row, columns: hiddenColumns })}>Details</button>
                </td>
              )}
              <td className="actions" data-label="Actions">
                <div className="action-group">
                  {moduleName === 'formations' && <button title="Details" aria-label="Details" onClick={() => onDetails(row)}><Icon name="book" /><span className="action-label">Details</span></button>}
                  {moduleName === 'themes' && <button title="View theme" aria-label="View theme" onClick={() => onDetails(row)}><Icon name="layers" /><span className="action-label">View</span></button>}
                  {moduleName === 'rapports' && <button title="View report" aria-label="View report" onClick={() => onDetails(row)}><Icon name="chart" /><span className="action-label">Report</span></button>}
                  {canExport && moduleName === 'rapports' && <button title="Download PDF" aria-label="Download PDF" onClick={() => onReportPdf?.(row.id)}><Icon name="file" /><span className="action-label">PDF</span></button>}
                  {moduleName === 'documents' && row.file_name && <a className="table-link" title="Preview document" aria-label="Preview document" href={`${API_URL}/documents/${row.id}/preview`} onClick={(e) => { e.preventDefault(); previewDocument(row.id); }}><Icon name="file" /><span className="action-label">Preview</span></a>}
                  {moduleName === 'documents' && row.file_name && <a className="table-link" title="Download document" aria-label="Download document" href={`${API_URL}/documents/${row.id}/download`} onClick={(e) => { e.preventDefault(); downloadDocument(row.id); }}><Icon name="route" /><span className="action-label">Download</span></a>}
                  {moduleName === 'certificates' && <button title="Download PDF" aria-label="Download PDF" onClick={() => downloadCertificate(row.id)}><Icon name="file" /><span className="action-label">PDF</span></button>}
                  {canWrite && <button title="Edit" aria-label="Edit" onClick={() => onEdit(row)}><Icon name="file" /><span className="action-label">Edit</span></button>}
                  {canWrite && canArchive && !['logs'].includes(moduleName) && <button title="Archive" aria-label="Archive" onClick={() => onArchive(row)}><Icon name="shield" /><span className="action-label">Archive</span></button>}
                  {canDelete && <button title="Delete" aria-label="Delete" onClick={() => onDelete(row)}><Icon name="alert" /><span className="action-label">Delete</span></button>}
                </div>
              </td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={tableColumns.length + (hasMore ? 1 : 0) + 1} className="empty"><Icon name="grid" /><strong>Aucune donnee trouvee</strong><span>Ajustez les filtres ou ajoutez un nouvel element si votre role le permet.</span></td></tr>}
        </tbody>
      </table>
    </div>
    {rowDetails && <RowDetailsModal moduleName={moduleName} row={rowDetails.row} columns={rowDetails.columns} onClose={() => setRowDetails(null)} />}
    </>
  );
}

function RowDetailsModal({ moduleName, row, columns, onClose }) {
  const allColumns = columns.length ? columns : modules[moduleName]?.columns || [];
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="modal details-modal row-details-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <span className="eyebrow">{modules[moduleName]?.title || moduleName}</span>
            <h2>{summaryValue(valueAt(row, preferredPrimaryColumn(moduleName, modules[moduleName]?.columns || allColumns)) || row.title || row.name || row.reference || `#${row.id}`)}</h2>
          </div>
          <button type="button" onClick={onClose}>Fermer</button>
        </div>
        <div className="row-details-grid">
          {allColumns.map((column) => (
            <article key={column}>
              <span>{tableLabel(column)}</span>
              <div>{renderCell(column, valueAt(row, column))}</div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function preferredPrimaryColumn(moduleName, columns) {
  const preferred = {
    users: ['name', 'email'],
    roles: ['label', 'name'],
    permissions: ['label', 'name'],
    formations: ['title'],
    themes: ['title'],
    sessions: ['title', 'formation.title'],
    absences: ['user.name', 'formationSession.formation.title'],
    documents: ['title', 'file_name'],
    hebergements: ['hotel_name', 'city'],
    deplacements: ['from_city', 'to_city'],
    evaluations: ['formation.title', 'user.name'],
    enrollments: ['formation.title', 'participant.name'],
    prerequisites: ['formation.title', 'requiredFormation.title'],
    'participant-evaluations': ['formation.title', 'participant.name'],
    'pedagogical-evaluations': ['formation.title', 'participant.name'],
    certificates: ['formation.title', 'reference'],
    rapports: ['title'],
    centres: ['name', 'code'],
    'sites-formation': ['name', 'city'],
    salles: ['name', 'siteFormation.name'],
    logs: ['action', 'module'],
  };
  return (preferred[moduleName] || ['title', 'name', 'label']).find((column) => columns.includes(column)) || columns[0];
}

function compactDisplayColumns(moduleName, columns, primaryColumn) {
  const priority = [
    'status',
    'type',
    'progress',
    'participants_count',
    'training_count',
    'formation.title',
    'participant.name',
    'trainer.name',
    'animateur.name',
    'siteFormation.name',
    'salle.name',
    'centre.name',
    'starts_at',
    'ends_at',
    'start_date',
    'end_date',
    'absence_date',
    'issued_at',
    'created_at',
    'capacity',
    'reference',
    'score',
    'trainer_score',
    'training_score',
    'content_score',
    'animation_score',
    'impact_score',
    'archived',
  ];
  const maxColumns = ['formations', 'sessions', 'users', 'documents', 'enrollments', 'certificates'].includes(moduleName) ? 4 : 3;
  const candidates = columns.filter((column) => column !== primaryColumn);
  const ordered = [
    ...priority.filter((column) => candidates.includes(column)),
    ...candidates.filter((column) => !priority.includes(column)),
  ];
  return ordered.slice(0, maxColumns);
}

function renderPrimaryCell(moduleName, row, primaryColumn, hiddenColumns) {
  const secondary = hiddenColumns
    .filter((column) => !['description', 'comment', 'justification', 'feedback', 'decision_note'].includes(column))
    .slice(0, 3);
  return (
    <div className="record-cell">
      <strong>{renderCell(primaryColumn, valueAt(row, primaryColumn))}</strong>
      <div>
        {secondary.map((column) => (
          <span key={column}>{tableLabel(column)}: {summaryValue(valueAt(row, column))}</span>
        ))}
        {!secondary.length && <span>{modules[moduleName]?.title || moduleName}</span>}
      </div>
    </div>
  );
}

function hasMeaningfulValue(value) {
  if (value === null || value === undefined || value === '') return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.values(value).some(hasMeaningfulValue);
  return true;
}

function CalendarBoard({ sessions, onMoved, setToast }) {
  const days = useMemo(() => {
    const base = sessions.length ? new Date(sessions[0].starts_at) : new Date();
    const monday = new Date(base);
    monday.setDate(base.getDate() - ((base.getDay() + 6) % 7));
    return Array.from({ length: 5 }, (_, index) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + index);
      return day;
    });
  }, [sessions]);

  const moveSession = async (session, day) => {
    const starts = new Date(session.starts_at);
    const ends = new Date(session.ends_at);
    const nextStart = new Date(day);
    nextStart.setHours(starts.getHours(), starts.getMinutes(), 0, 0);
    const nextEnd = new Date(day);
    nextEnd.setHours(ends.getHours(), ends.getMinutes(), 0, 0);
    try {
      await api(`/sessions/${session.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          formation_id: session.formation_id,
          theme_id: session.theme_id,
          site_formation_id: session.site_formation_id,
          salle_id: session.salle_id,
          animateur_id: session.animateur_id,
          title: session.title,
          starts_at: nextStart.toISOString().slice(0, 16),
          ends_at: nextEnd.toISOString().slice(0, 16),
          room: session.room,
          status: session.status,
          notes: session.notes,
        }),
      });
      setToast('Session replannifiee');
      onMoved();
    } catch (err) {
      setToast(err.message);
    }
  };

  return (
    <section className="calendar-board">
      <div className="calendar-board-head">
        <div><span className="eyebrow">Drag and drop planning</span><h2>Operational calendar</h2></div>
        <small>Drop a session into another day to reschedule. Backend conflict rules still protect trainers, rooms, and participants.</small>
      </div>
      <div className="calendar-lanes">
        {days.map((day) => {
          const key = day.toISOString().slice(0, 10);
          const daySessions = sessions.filter((session) => String(session.starts_at).slice(0, 10) === key);
          return (
            <div key={key} className="calendar-lane" onDragOver={(event) => event.preventDefault()} onDrop={(event) => {
              const session = sessions.find((item) => String(item.id) === event.dataTransfer.getData('session-id'));
              if (session) moveSession(session, day);
            }}>
              <strong>{day.toLocaleDateString('fr-FR', { weekday: 'long' })}</strong>
              <span>{day.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
              {daySessions.map((session) => (
                <article key={session.id} draggable onDragStart={(event) => event.dataTransfer.setData('session-id', session.id)} className="calendar-event">
                  <b>{session.title}</b>
                  <small>{new Date(session.starts_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {session.salle?.name || session.room || 'Room'}</small>
                </article>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ConfirmModal({ title, text, onCancel, onConfirm }) {
  return (
    <div className="modal-backdrop">
      <section className="confirm-modal">
        <div className="confirm-icon"><Icon name="alert" /></div>
        <h2>{title}</h2>
        <p>{text}</p>
        <div className="modal-actions">
          <button type="button" onClick={onCancel}>Annuler</button>
          <button type="button" className="danger-action" onClick={onConfirm}>Confirmer</button>
        </div>
      </section>
    </div>
  );
}

function ModuleHeader({ name, title, canWrite, onCreate }) {
  const visual = moduleVisuals[name] || { eyebrow: 'Gestion', text: 'Module operationnel OFPPT avec recherche, filtres et donnees securisees.' };
  return (
    <section className="module-hero">
      <div>
        <span className="eyebrow">{visual.eyebrow}</span>
        <h1>{title}</h1>
        <p>{visual.text}</p>
      </div>
      <div className="module-hero-meta">
        <span>Scoped</span>
        <span>Audited</span>
        <span>Live filters</span>
      </div>
      {canWrite && <button className="primary-action" onClick={onCreate}><Icon name={navIcons[name]} />Nouveau</button>}
    </section>
  );
}

function FormationShowcase({ rows, onDetails }) {
  if (!rows.length) return null;
  return (
    <section className="formation-showcase">
      {rows.slice(0, 3).map((row, index) => (
        <article key={row.id} className="formation-card">
          <div className="formation-card-mark"><Icon name={index % 2 === 0 ? 'book' : 'layers'} /><span>{String(row.type || 'OFPPT').replace('Formation ', '')}</span></div>
          <div>
            <span className={`status-badge status-${String(row.status || '').replace('_', '-')}`}>{row.status}</span>
            <h3>{row.title}</h3>
            <p>{row.type}</p>
            <Progress label="Progression" value={row.progress || 0} status={row.category} />
            <button onClick={() => onDetails(row)}>Voir le parcours</button>
          </div>
        </article>
      ))}
    </section>
  );
}

async function downloadDocument(id) {
  const response = await fetch(`${API_URL}/documents/${id}/download`, { headers: { Authorization: `Bearer ${localStorage.getItem('ofppt_token')}` } });
  if (!response.ok) throw new Error('Telechargement impossible');
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const disposition = response.headers.get('Content-Disposition') || '';
  link.download = decodeURIComponent(disposition.match(/filename="?([^"]+)/)?.[1] || `document-${id}`);
  link.click();
  URL.revokeObjectURL(url);
}

async function previewDocument(id) {
  const response = await fetch(`${API_URL}/documents/${id}/preview`, { headers: { Authorization: `Bearer ${localStorage.getItem('ofppt_token')}` } });
  if (!response.ok) throw new Error('Previsualisation impossible');
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

async function downloadCertificate(id) {
  await authenticatedDownload(`/certificates/${id}/pdf`, `certificate-${id}.pdf`);
}

async function authenticatedDownload(path, fallbackName) {
  const response = await fetch(`${API_URL}${path}`, { headers: { Authorization: `Bearer ${localStorage.getItem('ofppt_token')}` } });
  if (!response.ok) throw new Error('Telechargement impossible');
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const disposition = response.headers.get('Content-Disposition') || '';
  link.href = url;
  link.download = decodeURIComponent(disposition.match(/filename="?([^"]+)/)?.[1] || fallbackName);
  link.click();
  URL.revokeObjectURL(url);
}

function groupThemes(rows) {
  const grouped = new Map();
  rows.forEach((row) => {
    const key = `${row.title || ''}::${row.description || ''}`;
    const current = grouped.get(key) || {
      ...row,
      source: row,
      training_count: 0,
      trainings: [],
    };
    current.training_count += row.formation ? 1 : 0;
    if (row.formation) {
      current.trainings.push({
        ...row.formation,
        theme_progress: row.progress,
        theme_status: statusFromProgress(row.progress),
        animateur: row.animateur,
        start_date: row.start_date,
        end_date: row.end_date,
      });
    }
    grouped.set(key, current);
  });
  return Array.from(grouped.values());
}

function statusFromProgress(progress = 0) {
  if (progress >= 100) return 'Completed';
  if (progress > 0) return 'In Progress';
  return 'Planned';
}

function initialForm(moduleName, item) {
  const form = { ...item };
  if (moduleName === 'users') {
    form.role_ids = (item.roles || []).map((role) => role.id).filter(Boolean);
  }
  if (moduleName === 'formations') {
    form.participant_ids = (item.participants || []).filter((user) => user.pivot?.role === 'participant').map((user) => user.id);
    form.animateur_ids = (item.participants || []).filter((user) => user.pivot?.role === 'animateur').map((user) => user.id);
  }
  return form;
}

function optionLabel(row, field) {
  return row[field] || row.title || row.name || row.label || `#${row.id}`;
}

function average(values) {
  const numbers = values.filter((value) => Number.isFinite(Number(value))).map(Number);
  if (!numbers.length) return 0;
  return Math.round(numbers.reduce((sum, value) => sum + value, 0) / numbers.length);
}

function Editor({ moduleName, config, item, currentUser, onClose, onSaved }) {
  const [form, setForm] = useState(() => initialForm(moduleName, item));
  const [lookups, setLookups] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const resources = [...new Set(config.fields
      .filter((field) => ['api-select', 'multi-api'].includes(field[2]))
      .map((field) => field[3].resource))];

    resources.forEach((resource) => {
      api(`/${resource}?per_page=100`)
        .then((data) => setLookups((current) => ({ ...current, [resource]: data.data || [] })))
        .catch(() => setLookups((current) => ({ ...current, [resource]: [] })));
    });
  }, [config.fields]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const hasFile = config.fields.some((field) => field[2] === 'file');
      const body = hasFile ? new FormData() : { ...form };
      if (moduleName === 'evaluations' && !form.user_id) {
        hasFile ? body.append('user_id', currentUser.id) : body.user_id = currentUser.id;
      }
      if (hasFile) {
        if (item.id) body.append('_method', 'PUT');
        Object.entries(form).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((entry) => body.append(`${key}[]`, entry));
          } else if (value !== undefined && value !== null && value !== '') {
            body.append(key, value);
          }
        });
      }
      await api(item.id ? `/${moduleName}/${item.id}` : `/${moduleName}`, {
        method: hasFile ? 'POST' : item.id ? 'PUT' : 'POST',
        body: hasFile ? body : JSON.stringify(body),
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={submit}>
        <div className="modal-head modal-head-rich">
          <div><span className="eyebrow">Secure operation</span><h2>{item.id ? 'Modifier' : 'Creer'} - {config.title}</h2></div>
          <button type="button" onClick={onClose}>Fermer</button>
        </div>
        <div className="form-brief">
          <strong>{item.id ? 'Update existing operational record' : 'Create a new scoped record'}</strong>
          <span>Required fields are validated server-side and every important change is captured in the audit trail.</span>
        </div>
        <div className="form-grid">
          {config.fields.map(([key, label, type = 'text', options]) => (
            <label key={key} className={type === 'textarea' ? 'wide' : ''}>{label}
              {type === 'textarea' ? <textarea value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /> :
                type === 'select' ? <select value={form[key] || options[0]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}>{options.map((o) => <option key={o}>{o}</option>)}</select> :
                  type === 'api-select' ? <select value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })}><option value="">Non defini</option>{(lookups[options.resource] || []).map((o) => <option key={o.id} value={o.id}>{optionLabel(o, options.label)}</option>)}</select> :
                    type === 'multi-api' ? <select multiple value={(form[key] || []).map(String)} onChange={(e) => setForm({ ...form, [key]: Array.from(e.target.selectedOptions).map((option) => Number(option.value)) })}>{(lookups[options.resource] || []).map((o) => <option key={o.id} value={o.id}>{optionLabel(o, options.label)}</option>)}</select> :
                      type === 'checkbox' ? <input type="checkbox" checked={Boolean(form[key])} onChange={(e) => setForm({ ...form, [key]: e.target.checked ? 1 : 0 })} /> :
                        type === 'file' ? <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg" onChange={(e) => setForm({ ...form, [key]: e.target.files[0] })} /> :
                          <input type={type} value={normalizeInputValue(form[key], type)} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />}
            </label>
          ))}
        </div>
        {error && <p className="form-error">{error}</p>}
        <div className="modal-actions"><button type="button" onClick={onClose}>Annuler</button><button>Enregistrer</button></div>
      </form>
    </div>
  );
}

function FormationDetails({ formation, onClose }) {
  const themes = [...(formation.themes || [])].sort((a, b) => a.sort_order - b.sort_order);
  return (
    <div className="modal-backdrop">
      <section className="modal details-modal">
        <div className="details-cover">
          <div className="details-cover-graphic"><Icon name="book" /><span>{formation.progress || 0}%</span></div>
          <div><span className="eyebrow">{formation.type}</span><h2>{formation.title}</h2></div>
        </div>
        <div className="modal-head"><h2>Details formation</h2><button type="button" onClick={onClose}>Fermer</button></div>
        <div className="detail-grid">
          <article><span>Type</span><strong>{formation.type}</strong></article>
          <article><span>Statut</span><strong>{formation.status}</strong></article>
          <article><span>Debut</span><strong>{formatValue(formation.start_date)}</strong></article>
          <article><span>Fin</span><strong>{formatValue(formation.end_date)}</strong></article>
        </div>
        <p className="detail-description">{formation.description}</p>
        <h3>Themes classes par ordre logique</h3>
        <div className="theme-path">
          {themes.map((theme, index) => (
            <div key={theme.id} className="theme-step">
              <b>{index + 1}</b>
              <div><strong>{theme.title}</strong><span>{theme.description}</span><small>{formatValue(theme.start_date)} - {formatValue(theme.end_date)} | Progression {theme.progress}%</small></div>
            </div>
          ))}
        </div>
        <h3>Detailed training monitoring and pedagogical progress tracking</h3>
        <div className="monitor-table">
          <div className="monitor-head"><span>Training</span><span>Trainer</span><span>Progress</span><span>Status</span></div>
          {themes.map((theme) => (
            <div className="monitor-row" key={`monitor-${theme.id}`}>
              <strong>{theme.title}</strong>
              <span>{theme.animateur?.name || '-'}</span>
              <Progress label="" value={theme.progress || 0} status="" />
              <span className={`status-badge status-${String(statusFromProgress(theme.progress)).toLowerCase().replaceAll(' ', '-')}`}>{statusFromProgress(theme.progress)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ThemeDetails({ theme, onClose }) {
  const trainings = theme.trainings || [];
  return (
    <div className="modal-backdrop">
      <section className="modal details-modal">
        <div className="modal-head"><h2>{theme.title}</h2><button type="button" onClick={onClose}>Fermer</button></div>
        <p className="detail-description">{theme.description || 'Theme pedagogique rattache aux formations.'}</p>
        <div className="detail-grid">
          <article><span>Trainings</span><strong>{trainings.length}</strong></article>
          <article><span>Average progress</span><strong>{average(trainings.map((item) => item.theme_progress))}%</strong></article>
          <article><span>Completed</span><strong>{trainings.filter((item) => item.theme_progress >= 100).length}</strong></article>
          <article><span>In progress</span><strong>{trainings.filter((item) => item.theme_progress > 0 && item.theme_progress < 100).length}</strong></article>
        </div>
        <h3>Detailed training monitoring and pedagogical progress tracking</h3>
        <div className="monitor-table">
          <div className="monitor-head"><span>Training</span><span>Trainer</span><span>Progress</span><span>Status</span></div>
          {trainings.map((training) => (
            <div className="monitor-row" key={`${theme.id}-${training.id}`}>
              <strong>{training.title}</strong>
              <span>{training.animateur?.name || '-'}</span>
              <Progress label="" value={training.theme_progress || 0} status="" />
              <span className={`status-badge status-${training.theme_status.toLowerCase().replaceAll(' ', '-')}`}>{training.theme_status}</span>
            </div>
          ))}
          {!trainings.length && <div className="empty"><strong>Aucune formation rattachee</strong><span>Ajoutez une formation a ce theme pour suivre la progression.</span></div>}
        </div>
      </section>
    </div>
  );
}

function ReportDetails({ report, analytics, onClose, onExportPdf }) {
  const summary = analytics.summary || {};
  const evaluation = analytics.evaluations || {};
  return (
    <div className="modal-backdrop">
      <section className="modal report-modal">
        <div className="modal-head"><h2>{report.title}</h2><button type="button" onClick={onClose}>Fermer</button></div>
        <div className="report-actions"><button type="button" onClick={onExportPdf}><Icon name="file" />Export PDF</button></div>
        <section className="report-grid">
          <Panel title="General Information"><Kpi label="Number of trainings" value={summary.trainings} /><Kpi label="Number of participants" value={summary.participants} /><Kpi label="Number of trainers" value={summary.trainers} /></Panel>
          <Panel title="Attendance"><Kpi label="Attendance rate" value={`${summary.attendance_rate}%`} /><Kpi label="Absence rate" value={`${summary.absence_rate}%`} /></Panel>
          <Panel title="Progress"><Kpi label="Validated participants" value={summary.validated_participants} /><Kpi label="Average progress" value={`${summary.average_progress}%`} /></Panel>
          <Panel title="Impact"><Kpi label="Satisfaction" value={`${summary.satisfaction}/5`} /><Kpi label="Content" value={`${evaluation.contenu || 0}/5`} /><Kpi label="Animation" value={`${evaluation.animation || 0}/5`} /></Panel>
        </section>
        <Panel title="Statistics">
          <div className="analytics-bars">
            {(analytics.progression || []).slice(0, 8).map((item) => <Progress key={item.title} label={item.title} value={item.progress || 0} status={item.status} />)}
          </div>
        </Panel>
        <Panel title="Most successful trainings">
          <div className="compact-list">{(analytics.top_trainings || []).map((item) => <div key={item.id}><strong>{item.title}</strong><span>{item.progress}% progression</span></div>)}</div>
        </Panel>
      </section>
    </div>
  );
}

function Kpi({ label, value }) {
  return <div className="kpi-line"><span>{label}</span><strong>{value ?? 0}</strong></div>;
}

function Panel({ title, children }) {
  return <section className="panel"><h2>{title}</h2>{children}</section>;
}

function MiniChart({ stats }) {
  const max = Math.max(stats.formations || 1, stats.sessions || 1, stats.themes || 1, stats.documents || 1, stats.absences || 1);
  const items = [
    ['Formations', stats.formations, 'book'],
    ['Sessions', stats.sessions, 'calendar'],
    ['Themes', stats.themes, 'layers'],
    ['Documents', stats.documents, 'file'],
    ['Absences', stats.absences, 'alert'],
  ];
  return (
    <div className="mini-chart">
      {items.map(([label, value, icon]) => (
        <div className="chart-row" key={label}>
          <span><Icon name={icon} />{label}</span>
          <div><i style={{ width: `${Math.max(8, (value / max) * 100)}%` }} /></div>
          <b>{value}</b>
        </div>
      ))}
    </div>
  );
}

function Progress({ label, value, status }) {
  return <div className="progress-row"><div><strong>{label}</strong><span>{status}</span></div><div className="bar"><i style={{ width: `${value}%` }} /></div><b>{value}%</b></div>;
}

function renderCell(column, value) {
  if (column === 'roles') {
    return <div className="tag-list">{(value || []).map((role) => <span key={role.id || role.name}>{role.label || role.name}</span>)}</div>;
  }
  if (column === 'status') {
    return <span className={`status-badge status-${String(value || '').replace('_', '-')}`}>{formatValue(value)}</span>;
  }
  if (column === 'progress') {
    return <div className="table-progress"><div className="bar"><i style={{ width: `${value || 0}%` }} /></div><b>{value || 0}%</b></div>;
  }
  if (column.includes('score')) {
    return <span className="score-pill">{formatValue(value)}/5</span>;
  }
  if (column === 'training_count' || column === 'participants_count') {
    return <strong>{value || 0}</strong>;
  }
  const formatted = formatValue(value);
  const isLongText = ['description', 'comment', 'justification'].includes(column);
  return <span className={`cell-text ${isLongText ? 'cell-multiline' : ''}`} title={typeof formatted === 'string' ? formatted : undefined}>{formatted}</span>;
}

function columnClass(column) {
  if (column === 'description' || column === 'comment' || column === 'justification') return 'col-description';
  if (['title', 'formation.title', 'formationSession.formation.title'].includes(column)) return 'col-title';
  if (['email', 'file_name', 'profile_title', 'equipment', 'roles', 'responsable.name', 'user.name', 'animateur.name', 'centre.name'].includes(column)) return 'col-medium';
  if (['status', 'type', 'archived'].includes(column)) return 'col-status';
  if (column.includes('score') || ['progress', 'capacity', 'sort_order', 'formation_id', 'user_id', 'participant_id', 'progression_delta', 'training_count', 'participants_count'].includes(column)) return 'col-number';
  if (column.includes('date') || ['starts_at', 'ends_at', 'start_date', 'end_date', 'check_in', 'check_out', 'created_at', 'reviewed_at', 'issued_at'].includes(column)) return 'col-date';
  return '';
}

function tableLabel(column) {
  const labels = {
    name: 'Nom',
    email: 'Email',
    matricule: 'Matricule',
    profile_title: 'Fonction',
    status: 'Statut',
    label: 'Libelle',
    description: 'Description',
    title: 'Titre',
    type: 'Type',
    start_date: 'Debut',
    end_date: 'Fin',
    progress: 'Progression',
    participants_count: 'Participants',
    training_count: 'Number of Trainings',
    sort_order: 'Ordre',
    'formation.title': 'Formation',
    'theme.title': 'Theme',
    'animateur.name': 'Animateur',
    'responsable.name': 'Trainer',
    'siteFormation.name': 'Site',
    'salle.name': 'Salle',
    starts_at: 'Debut',
    ends_at: 'Fin',
    'user.name': 'Formateur',
    'formationSession.formation.title': 'Session',
    absence_date: 'Date',
    justification: 'Justification',
    file_name: 'Fichier',
    archived: 'Archive',
    hotel_name: 'Hotel',
    city: 'Ville',
    formation_id: 'Formation',
    user_id: 'Formateur',
    check_in: 'Arrivee',
    check_out: 'Depart',
    from_city: 'Depart',
    to_city: 'Arrivee',
    travel_date: 'Date',
    transport_mode: 'Transport',
    content_score: 'Contenu',
    animation_score: 'Animation',
    logistics_score: 'Logistique',
    impact_score: 'Impact',
    comment: 'Commentaire',
    created_at: 'Cree le',
    participant_id: 'Participant',
    'participant.name': 'Participant',
    'reviewedBy.name': 'Valide par',
    'centre.name': 'Centre',
    decision_note: 'Decision',
    reviewed_at: 'Revu le',
    required_formation_id: 'Prerequis',
    'requiredFormation.title': 'Prerequis',
    rule: 'Regle',
    trainer_score: 'Trainer',
    training_score: 'Formation',
    trainer_id: 'Trainer',
    'trainer.name': 'Trainer',
    competency: 'Competence',
    score: 'Score',
    progression_delta: 'Progression',
    feedback: 'Feedback',
    reference: 'Reference',
    issued_at: 'Emission',
    code: 'Code',
    region: 'Region',
    capacity: 'Capacite',
    manager_name: 'Responsable',
    equipment: 'Equipements',
  };
  return labels[column] || column.replaceAll('.', ' ');
}

function metricHint(label, value) {
  if (label === 'Impact moyen') return 'Satisfaction et impact';
  if (Number(value) === 0) return 'A surveiller';
  return 'Donnees en temps reel';
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) return new Date(value).toLocaleString('fr-FR');
  if (typeof value === 'object') return value.title || value.name || JSON.stringify(value);
  return value;
}

function summaryValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => item?.label || item?.name || item?.title || item).filter(Boolean).join(', ') || '-';
  }
  if (value && typeof value === 'object') {
    return value.label || value.title || value.name || '-';
  }
  return formatValue(value);
}

function normalizeInputValue(value, type) {
  if (!value || value instanceof File) return '';
  if (type === 'datetime-local') return String(value).slice(0, 16);
  if (type === 'date') return String(value).slice(0, 10);
  return value;
}
