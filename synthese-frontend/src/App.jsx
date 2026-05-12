import { useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
const LOGO_PATH = import.meta.env.VITE_OFPPT_LOGO || '/ofppt-logo.png';

const roleHome = {
  administrateur: 'dashboard',
  responsable_cdc: 'formations',
  responsable_formation: 'sessions',
  responsable_dr: 'rapports',
  formateur_participant: 'formations',
  formateur_animateur: 'absences',
};

const roleLabels = {
  administrateur: 'Administrateur systeme',
  responsable_cdc: 'Responsable CDC',
  responsable_formation: 'Responsable de formation',
  responsable_dr: 'Responsable DR',
  formateur_participant: 'Formateur participant',
  formateur_animateur: 'Formateur animateur',
};

const roleMissions = {
  administrateur: ['Maintenance systeme', 'Securite et comptes', 'Roles et permissions', 'Supervision globale'],
  responsable_cdc: ['Proposer les plans', 'Creer les formations', 'Coordonner les parcours', 'Gerer les themes'],
  responsable_formation: ['Valider les formations', 'Planifier les sessions', 'Organiser salles et sites', 'Suivre le calendrier'],
  responsable_dr: ['Consulter les plans', 'Suivre les absences', 'Lire les rapports', 'Analyser les statistiques'],
  formateur_participant: ['Suivre ses formations', 'Consulter les documents', 'Telecharger les ressources', 'Remplir les evaluations'],
  formateur_animateur: ['Gerer les absences', 'Ajouter les supports', 'Enrichir les contenus', 'Suivre les participants'],
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

const moduleVisuals = {
  formations: { eyebrow: 'Catalogue', text: 'Parcours techniques CDC et pedagogiques SFP avec suivi de progression.' },
  themes: { eyebrow: 'Contenus', text: 'Themes classes selon un ordre logique et rattaches aux formations.' },
  sessions: { eyebrow: 'Calendrier', text: 'Planification des sessions, salles, sites et animateurs.' },
  absences: { eyebrow: 'Suivi', text: 'Presence, absences, justifications et alertes operationnelles.' },
  documents: { eyebrow: 'Ressources', text: 'Supports pedagogiques centralises, consultables et telechargeables.' },
  rapports: { eyebrow: 'Analyse', text: 'Rapports de participation, progression, absences et impact.' },
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
  rapports: 'chart',
  users: 'users',
  roles: 'shield',
  permissions: 'shield',
  centres: 'building',
  'sites-formation': 'map',
  salles: 'door',
};

const statIcons = {
  Formations: 'book',
  Sessions: 'calendar',
  Themes: 'layers',
  Absences: 'alert',
  Documents: 'file',
  'Impact moyen': 'chart',
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
  code: 'Code',
  region: 'Région',
  capacity: 'Capacité',
  manager_name: 'Responsable',
  equipment: 'Équipements',
};

const modules = {
  users: { title: 'Utilisateurs', permission: 'users.read', write: 'users.write', columns: ['name', 'email', 'matricule', 'profile_title', 'status'], fields: [['name', 'Nom complet'], ['email', 'Email', 'email'], ['password', 'Mot de passe', 'password'], ['matricule', 'Matricule'], ['phone', 'Telephone'], ['profile_title', 'Fonction'], ['status', 'Statut', 'select', ['actif', 'suspendu']]] },
  roles: { title: 'Roles', permission: 'roles.read', write: 'roles.write', columns: ['label', 'name', 'description'], fields: [['label', 'Libelle'], ['name', 'Code'], ['description', 'Description', 'textarea']] },
  permissions: { title: 'Permissions', permission: 'roles.read', write: 'roles.write', columns: ['label', 'name'], fields: [['label', 'Libelle'], ['name', 'Code permission']] },
  formations: { title: 'Formations', permission: 'formations.read', write: 'formations.write', columns: ['title', 'type', 'status', 'start_date', 'end_date', 'progress'], fields: [['title', 'Titre'], ['description', 'Description', 'textarea'], ['start_date', 'Date debut', 'date'], ['end_date', 'Date fin', 'date'], ['status', 'Statut', 'select', ['proposee', 'validee', 'planifiee', 'en_cours', 'terminee', 'annulee']], ['type', 'Type', 'select', ['Formation technique CDC', 'Formation pédagogique SFP']], ['category', 'Categorie'], ['level', 'Niveau'], ['capacity', 'Capacite', 'number'], ['progress', 'Progression', 'number'], ['centre_id', 'ID centre', 'number'], ['responsable_id', 'ID responsable', 'number']] },
  themes: { title: 'Themes', permission: 'themes.read', write: 'themes.write', columns: ['sort_order', 'title', 'formation.title', 'animateur.name', 'start_date', 'end_date', 'progress'], fields: [['formation_id', 'ID formation', 'number'], ['animateur_id', 'ID animateur', 'number'], ['title', 'Titre'], ['description', 'Description', 'textarea'], ['start_date', 'Date debut', 'date'], ['end_date', 'Date fin', 'date'], ['sort_order', 'Ordre', 'number'], ['progress', 'Progression', 'number']] },
  sessions: { title: 'Planification', permission: 'planning.read', write: 'planning.write', columns: ['title', 'formation.title', 'siteFormation.name', 'salle.name', 'starts_at', 'ends_at', 'status'], fields: [['formation_id', 'ID formation', 'number'], ['theme_id', 'ID theme', 'number'], ['site_formation_id', 'ID site', 'number'], ['salle_id', 'ID salle', 'number'], ['animateur_id', 'ID animateur', 'number'], ['title', 'Titre'], ['starts_at', 'Debut', 'datetime-local'], ['ends_at', 'Fin', 'datetime-local'], ['room', 'Salle texte'], ['status', 'Statut', 'select', ['planifiee', 'confirmee', 'reportee', 'terminee']], ['notes', 'Notes', 'textarea']] },
  absences: { title: 'Absences', permission: 'absences.read', write: 'absences.write', columns: ['user.name', 'formationSession.formation.title', 'absence_date', 'status', 'justification'], fields: [['formation_session_id', 'ID session', 'number'], ['user_id', 'ID formateur', 'number'], ['absence_date', 'Date', 'date'], ['status', 'Statut', 'select', ['present', 'absent', 'justifie', 'non_justifie']], ['justification', 'Justification', 'textarea']] },
  documents: { title: 'Documents', permission: 'documents.read', write: 'documents.write', columns: ['title', 'type', 'formation.title', 'theme.title', 'file_name', 'archived'], fields: [['formation_id', 'ID formation', 'number'], ['theme_id', 'ID theme', 'number'], ['title', 'Titre'], ['type', 'Type', 'select', ['PDF', 'Word', 'PowerPoint', 'Image', 'Video', 'Support']], ['file', 'Fichier', 'file'], ['archived', 'Archive', 'checkbox']] },
  hebergements: { title: 'Hebergements', permission: 'logistique.read', write: 'logistique.write', columns: ['hotel_name', 'city', 'formation_id', 'user_id', 'check_in', 'check_out', 'status'], fields: [['formation_id', 'ID formation', 'number'], ['user_id', 'ID formateur', 'number'], ['hotel_name', 'Hotel'], ['city', 'Ville'], ['check_in', 'Arrivee', 'date'], ['check_out', 'Depart', 'date'], ['status', 'Statut', 'select', ['reserve', 'confirme', 'annule']]] },
  deplacements: { title: 'Deplacements', permission: 'logistique.read', write: 'logistique.write', columns: ['from_city', 'to_city', 'travel_date', 'transport_mode', 'status'], fields: [['formation_id', 'ID formation', 'number'], ['user_id', 'ID formateur', 'number'], ['from_city', 'Ville depart'], ['to_city', 'Ville arrivee'], ['travel_date', 'Date', 'date'], ['transport_mode', 'Transport'], ['status', 'Statut', 'select', ['planifie', 'confirme', 'annule']]] },
  evaluations: { title: 'Evaluations', permission: 'evaluations.read', write: 'evaluations.write', columns: ['formation_id', 'user_id', 'content_score', 'animation_score', 'logistics_score', 'impact_score', 'comment'], fields: [['formation_id', 'ID formation', 'number'], ['content_score', 'Note contenu /5', 'number'], ['animation_score', 'Note animation /5', 'number'], ['logistics_score', 'Note logistique /5', 'number'], ['impact_score', 'Impact competences /5', 'number'], ['comment', 'Avis et commentaire', 'textarea']] },
  rapports: { title: 'Rapports', permission: 'rapports.read', write: 'rapports.write', columns: ['title', 'type', 'created_at'], fields: [['title', 'Titre'], ['type', 'Type', 'select', ['participation', 'progression', 'absences', 'evaluations', 'impact']]] },
  centres: { title: 'Centres CDC', permission: 'centres.read', write: 'centres.write', columns: ['code', 'name', 'region', 'city'], fields: [['code', 'Code'], ['name', 'Nom'], ['region', 'Region'], ['city', 'Ville'], ['address', 'Adresse', 'textarea']] },
  'sites-formation': { title: 'Sites de formation', permission: 'logistique.read', write: 'logistique.write', columns: ['name', 'city', 'capacity', 'manager_name'], fields: [['centre_id', 'ID CDC', 'number'], ['name', 'Nom'], ['city', 'Ville'], ['address', 'Adresse', 'textarea'], ['capacity', 'Capacite', 'number'], ['manager_name', 'Responsable']] },
  salles: { title: 'Salles', permission: 'logistique.read', write: 'logistique.write', columns: ['name', 'siteFormation.name', 'capacity', 'equipment', 'status'], fields: [['site_formation_id', 'ID site', 'number'], ['name', 'Nom'], ['capacity', 'Capacite', 'number'], ['equipment', 'Equipements'], ['status', 'Statut', 'select', ['disponible', 'reservee', 'maintenance']]] },
};

const SPECIAL_SCREENS = new Set(['dashboard', 'profile']);
const BUSINESS_DELETE_LOCKED = new Set(['formations', 'themes', 'sessions', 'absences', 'documents', 'evaluations', 'rapports']);

function permissionsFromUser(user) {
  return new Set(user?.roles?.flatMap((role) => role.permissions || []) || []);
}

function hashScreen() {
  const value = decodeURIComponent(window.location.hash.replace(/^#\/?/, '') || '');
  return value || '';
}

function isScreenAllowed(screen, permissions) {
  if (SPECIAL_SCREENS.has(screen)) return true;
  const config = modules[screen];
  return Boolean(config && permissions.has(config.permission));
}

function fallbackScreen(user, permissions) {
  const role = user?.roles?.[0]?.name;
  const preferred = roleHome[role] || 'dashboard';
  return isScreenAllowed(preferred, permissions) ? preferred : 'dashboard';
}

function resolveInitialScreen(user) {
  const permissions = permissionsFromUser(user);
  const requested = hashScreen() || localStorage.getItem('ofppt_screen') || fallbackScreen(user, permissions);
  return isScreenAllowed(requested, permissions) ? requested : fallbackScreen(user, permissions);
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

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('ofppt_theme', theme);
  }, [theme]);

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
    const resolved = isScreenAllowed(nextScreen, permissions) ? nextScreen : fallbackScreen(user, permissions);
    setScreen(resolved);
    setSidebarOpen(false);
    localStorage.setItem('ofppt_screen', resolved);
    window.history.replaceState(null, '', `#/${resolved}`);
  };

  useEffect(() => {
    if (!user || !authReady || isScreenAllowed(screen, permissions)) return;
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
    ['sessions', 'Planning', 'planning.read'],
    ['absences', 'Absences', 'absences.read'],
    ['documents', 'Documents', 'documents.read'],
    ['hebergements', 'Hebergements', 'logistique.read'],
    ['deplacements', 'Deplacements', 'logistique.read'],
    ['evaluations', 'Evaluations', 'evaluations.read'],
    ['rapports', 'Rapports', 'rapports.read'],
    ['users', 'Utilisateurs', 'users.read'],
    ['roles', 'Roles', 'roles.read'],
    ['permissions', 'Permissions', 'roles.read'],
    ['centres', 'Centres CDC', 'centres.read'],
    ['sites-formation', 'Sites', 'logistique.read'],
    ['salles', 'Salles', 'logistique.read'],
  ].filter((item) => item[2] === 'permissionless' || can(item[2]));

  return (
    <div className="app-shell">
      {toast && <div className="toast">{toast}</div>}
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
          <div className="topbar-search"><Icon name="grid" /><span>Plateforme OFPPT</span></div>
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
            ? <ModulePage name={screen} config={modules[screen]} canWrite={can(modules[screen]?.write)} setToast={setToast} currentUser={user} />
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

function Dashboard({ role, setScreen, can }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api('/dashboard').then(setData).catch((err) => setError(err.message)); }, []);
  if (error) return <div className="content"><Notice type="error" title="Dashboard indisponible" text={error} /></div>;
  if (!data) return <div className="content"><div className="skeleton" /></div>;
  const hero = roleHero[role] || roleHero.formateur_participant;

  const cards = [
    ['Formations', data.stats.formations, 'formations'],
    ['Sessions', data.stats.sessions, 'sessions'],
    ['Themes', data.stats.themes, 'themes'],
    ['Absences', data.stats.absences, 'absences'],
    ['Documents', data.stats.documents, 'documents'],
    ['Impact moyen', `${data.stats.evaluation_average}/5`, 'evaluations'],
  ].filter((card) => card[2] === 'formations' || can(`${card[2] === 'sessions' ? 'planning' : card[2]}.read`));

  return (
    <div className="content">
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
      </section>
      <section className="stats-grid">{cards.map(([label, value, target]) => <button className="stat-card" key={label} onClick={() => setScreen(target)}><div className="stat-icon"><Icon name={statIcons[label]} /></div><span>{label}</span><strong>{value}</strong><small>{metricHint(label, value)}</small></button>)}</section>
      <section className="dashboard-grid">
        <Panel title="Responsabilites du profil"><div className="mission-list">{(roleMissions[role] || []).map((mission) => <span key={mission}>{mission}</span>)}</div></Panel>
        <Panel title="Vue analytique"><MiniChart stats={data.stats} /></Panel>
        <Panel title="Progression des formations">{data.progression.map((item) => <Progress key={item.title} label={item.title} value={item.progress} status={item.status} />)}</Panel>
        <Panel title="Sessions a venir"><div className="timeline">{data.sessions.map((s) => <div key={s.id}><strong>{s.title}</strong><span>{s.formation?.title}</span><small>{new Date(s.starts_at).toLocaleString('fr-FR')}</small></div>)}</div></Panel>
        <Panel title="Alertes absences"><div className="compact-list">{data.alerts.map((a) => <div key={a.id}><strong>{a.user?.name}</strong><span>{a.status}</span></div>)}</div></Panel>
        <Panel title="Activite recente"><div className="compact-list">{data.activity.map((a) => <div key={a.id}><strong>{a.module}</strong><span>{a.description}</span></div>)}</div></Panel>
      </section>
    </div>
  );
}

function ModulePage({ name, config, canWrite, setToast, currentUser }) {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({});
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [details, setDetails] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [formationFilter, setFormationFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const canDelete = canWrite && !BUSINESS_DELETE_LOCKED.has(name);

  const load = () => {
    setLoading(true);
    setError('');
    const filter = formationFilter && ['themes', 'sessions', 'documents'].includes(name) ? `&formation_id=${formationFilter}` : '';
    api(`/${name}?q=${encodeURIComponent(q)}&page=${page}${filter}`).then((data) => {
      setRows(data.data || []);
      setMeta(data);
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  };

  useEffect(load, [name, page, formationFilter]);

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

  const openDetails = async (row) => {
    if (name !== 'formations') return;
    const data = await api(`/formations/${row.id}`);
    setDetails(data);
  };

  return (
    <div className="content">
      <ModuleHeader name={name} title={config.title} canWrite={canWrite} onCreate={() => setEditing({})} />
      <div className="toolbar">
        <div className="search-box"><Icon name="grid" /><input placeholder="Recherche..." value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} /></div>
        {['themes', 'sessions', 'documents'].includes(name) && <input placeholder="Filtrer par ID formation" value={formationFilter} onChange={(e) => setFormationFilter(e.target.value)} />}
        <button onClick={load}><Icon name="grid" />Filtrer</button>
        {name === 'sessions' && <button onClick={() => setToast('Calendrier: utilisez Precedent/Suivant pour naviguer dans les sessions planifiees')}><Icon name="calendar" />Vue calendrier</button>}
        {name === 'rapports' && <button onClick={() => window.print()}><Icon name="file" />Export PDF</button>}
      </div>
      {error && <Notice type="error" title="Action impossible" text={error} />}
      {loading ? <div className="skeleton" /> : <DataTable moduleName={name} rows={rows} columns={config.columns} canWrite={canWrite} canDelete={canDelete} onEdit={setEditing} onDelete={setPendingDelete} onDetails={openDetails} />}
      <div className="pagination"><button disabled={page <= 1} onClick={() => setPage(page - 1)}>Precedent</button><span>Page {meta.current_page || page} / {meta.last_page || 1}</span><button disabled={page >= (meta.last_page || 1)} onClick={() => setPage(page + 1)}>Suivant</button></div>
      {pendingDelete && <ConfirmModal title="Confirmer la suppression" text={`Voulez-vous supprimer cet element du module ${config.title} ?`} onCancel={() => setPendingDelete(null)} onConfirm={() => remove(pendingDelete.id)} />}
      {details && <FormationDetails formation={details} onClose={() => setDetails(null)} />}
      {editing && <Editor moduleName={name} config={config} item={editing} currentUser={currentUser} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); setToast('Enregistrement effectue'); load(); }} />}
    </div>
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

function DataTable({ moduleName, rows, columns, canWrite, canDelete, onEdit, onDelete, onDetails }) {
  return (
    <div className={`table-wrap table-${moduleName}`}>
      <table>
        <thead><tr>{columns.map((c) => <th key={c} className={columnClass(c)}>{tableLabel(c)}</th>)}<th className="col-actions">Actions</th></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => <td key={column} className={columnClass(column)}>{renderCell(column, valueAt(row, column))}</td>)}
              <td className="actions">
                {moduleName === 'formations' && <button onClick={() => onDetails(row)}><Icon name="book" />Details</button>}
                {moduleName === 'documents' && row.file_name && <a className="table-link" href={`${API_URL}/documents/${row.id}/preview`} onClick={(e) => { e.preventDefault(); previewDocument(row.id); }}>Preview</a>}
                {moduleName === 'documents' && row.file_name && <a className="table-link" href={`${API_URL}/documents/${row.id}/download`} onClick={(e) => { e.preventDefault(); downloadDocument(row.id); }}>Download</a>}
                {canWrite && <button onClick={() => onEdit(row)}><Icon name="file" />Modifier</button>}
                {canDelete && <button onClick={() => onDelete(row)}><Icon name="alert" />Supprimer</button>}
              </td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={columns.length + 1} className="empty"><Icon name="grid" /><strong>Aucune donnee trouvee</strong><span>Ajustez les filtres ou ajoutez un nouvel element si votre role le permet.</span></td></tr>}
        </tbody>
      </table>
    </div>
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
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `document-${id}`;
  link.click();
  URL.revokeObjectURL(url);
}

async function previewDocument(id) {
  const response = await fetch(`${API_URL}/documents/${id}/preview`, { headers: { Authorization: `Bearer ${localStorage.getItem('ofppt_token')}` } });
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function Editor({ moduleName, config, item, currentUser, onClose, onSaved }) {
  const [form, setForm] = useState(() => ({ ...item }));
  const [error, setError] = useState('');

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
        Object.entries(form).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') body.append(key, value);
        });
      }
      await api(item.id ? `/${moduleName}/${item.id}` : `/${moduleName}`, {
        method: hasFile ? 'POST' : item.id ? 'PUT' : 'POST',
        body: hasFile ? body : JSON.stringify(body),
        headers: item.id && hasFile ? { 'X-HTTP-Method-Override': 'PUT' } : undefined,
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={submit}>
        <div className="modal-head"><h2>{item.id ? 'Modifier' : 'Creer'} - {config.title}</h2><button type="button" onClick={onClose}>Fermer</button></div>
        <div className="form-grid">
          {config.fields.map(([key, label, type = 'text', options]) => (
            <label key={key} className={type === 'textarea' ? 'wide' : ''}>{label}
              {type === 'textarea' ? <textarea value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /> :
                type === 'select' ? <select value={form[key] || options[0]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}>{options.map((o) => <option key={o}>{o}</option>)}</select> :
                  type === 'checkbox' ? <input type="checkbox" checked={Boolean(form[key])} onChange={(e) => setForm({ ...form, [key]: e.target.checked ? 1 : 0 })} /> :
                    type === 'file' ? <input type="file" onChange={(e) => setForm({ ...form, [key]: e.target.files[0] })} /> :
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
      </section>
    </div>
  );
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
  if (column === 'status') {
    return <span className={`status-badge status-${String(value || '').replace('_', '-')}`}>{formatValue(value)}</span>;
  }
  if (column === 'progress') {
    return <div className="table-progress"><div className="bar"><i style={{ width: `${value || 0}%` }} /></div><b>{value || 0}%</b></div>;
  }
  if (column.includes('score')) {
    return <span className="score-pill">{formatValue(value)}/5</span>;
  }
  return formatValue(value);
}

function columnClass(column) {
  if (['title', 'description', 'comment', 'justification', 'formation.title', 'formationSession.formation.title'].includes(column)) return 'col-wide';
  if (['email', 'file_name', 'profile_title', 'equipment'].includes(column)) return 'col-medium';
  if (['status', 'type', 'archived'].includes(column)) return 'col-status';
  if (column.includes('score') || ['progress', 'capacity', 'sort_order', 'formation_id', 'user_id'].includes(column)) return 'col-number';
  if (column.includes('date') || ['starts_at', 'ends_at', 'start_date', 'end_date', 'check_in', 'check_out', 'created_at'].includes(column)) return 'col-date';
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
    sort_order: 'Ordre',
    'formation.title': 'Formation',
    'theme.title': 'Theme',
    'animateur.name': 'Animateur',
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
  if (typeof value === 'string' && value.includes('T')) return new Date(value).toLocaleString('fr-FR');
  if (typeof value === 'object') return value.title || value.name || JSON.stringify(value);
  return value;
}

function normalizeInputValue(value, type) {
  if (!value || value instanceof File) return '';
  if (type === 'datetime-local') return String(value).slice(0, 16);
  if (type === 'date') return String(value).slice(0, 10);
  return value;
}
