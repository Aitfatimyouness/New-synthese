import './App.css';
import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

const labels = {
  admin: 'Administrateur systeme',
  responsable_cdc: 'Responsable CDC',
  responsable_formation: 'Responsable de formation',
  responsable_dr: 'Responsable DR',
  formateur_participant: 'Formateur participant',
  formateur_animateur: 'Formateur animateur',
};

const roleFocus = {
  admin: ['Gouvernance complete', 'Utilisateurs, roles et referentiels', 'Rapports consolides'],
  responsable_cdc: ['Qualite pedagogique', 'Themes et ressources', 'Evaluation des impacts'],
  responsable_formation: ['Planification active', 'Sessions et progression', 'Coordination animateurs'],
  responsable_dr: ['Pilotage regional', 'Sites, hebergements, deplacements', 'Alertes absences'],
  formateur_participant: ['Mon parcours', 'Documents et evaluations', 'Suivi de presence'],
  formateur_animateur: ['Animation sessions', 'Absences et progression', 'Retours participants'],
};

const roleSkins = {
  admin: { tone: 'Administration', gradient: 'linear-gradient(135deg, #073b55, #0b7f5b 48%, #1f66b2)', glow: '#0b7f5b' },
  responsable_cdc: { tone: 'Qualite pedagogique', gradient: 'linear-gradient(135deg, #12305f, #2157a8 50%, #00a06a)', glow: '#2157a8' },
  responsable_formation: { tone: 'Planification', gradient: 'linear-gradient(135deg, #082f49, #0b7f5b 45%, #d8a124)', glow: '#d8a124' },
  responsable_dr: { tone: 'Pilotage regional', gradient: 'linear-gradient(135deg, #0f2742, #0c6f76 45%, #2157a8)', glow: '#0c6f76' },
  formateur_participant: { tone: 'Parcours formateur', gradient: 'linear-gradient(135deg, #10233e, #2157a8 48%, #0b7f5b)', glow: '#2157a8' },
  formateur_animateur: { tone: 'Animation formation', gradient: 'linear-gradient(135deg, #0a3d33, #0b7f5b 48%, #d8a124)', glow: '#0b7f5b' },
};

const dashboardCopy = {
  admin: 'Vue executive consolidee pour piloter les roles, les referentiels et la performance globale.',
  responsable_cdc: 'Un cockpit qualite pour suivre les themes, l impact pedagogique et les contenus critiques.',
  responsable_formation: 'Un espace de planification pour orchestrer les sessions, la capacite et la progression.',
  responsable_dr: 'Un centre regional pour surveiller les sites, les deplacements, l hebergement et les alertes.',
  formateur_participant: 'Votre parcours personnel avec les documents, evaluations et prochaines sessions.',
  formateur_animateur: 'Votre studio d animation pour suivre les groupes, absences et retours participants.',
};

const platformSignals = [
  { value: 'CDC', label: 'Themes et ressources' },
  { value: 'DR', label: 'Centres et logistique' },
  { value: 'CSV', label: 'Rapports exportables' },
];

const moduleAccents = {
  users: 'Identites',
  themes: 'Pedagogie',
  centers: 'Sites',
  formations: 'Programmes',
  sessions: 'Planning',
  absences: 'Presence',
  accommodations: 'Logistique',
  travels: 'Mobilite',
  documents: 'Ressources',
  evaluations: 'Impact',
  reports: 'Reporting',
};

const moduleIllustrationSkins = {
  users: ['#00b877', '#22d3ee', 'users'],
  themes: ['#075ca8', '#00b877', 'book'],
  centers: ['#075ca8', '#d8a124', 'building'],
  formations: ['#00b877', '#075ca8', 'graduation'],
  sessions: ['#22d3ee', '#d8a124', 'calendar'],
  absences: ['#ef4444', '#f5c542', 'userCheck'],
  accommodations: ['#0b7f5b', '#22d3ee', 'bed'],
  travels: ['#075ca8', '#00b877', 'route'],
  documents: ['#075ca8', '#22d3ee', 'file'],
  evaluations: ['#d8a124', '#00b877', 'star'],
  reports: ['#22d3ee', '#075ca8', 'chart'],
};

const navIcons = {
  dashboard: 'dashboard',
  users: 'users',
  themes: 'book',
  centers: 'building',
  formations: 'graduation',
  sessions: 'calendar',
  absences: 'userCheck',
  accommodations: 'bed',
  travels: 'route',
  documents: 'file',
  evaluations: 'star',
  reports: 'chart',
};

const moduleVisuals = {
  users: { title: 'Gestion des profils', text: 'Roles, directions, CDC et activation des comptes sont regroupes dans une vue claire.', points: ['Profils OFPPT', 'Roles utilisateurs', 'Coordonnees'], variant: 'people' },
  themes: { title: 'Ressources pedagogiques', text: 'Les themes structurent les objectifs, domaines et competences visees.', points: ['Objectifs', 'Domaines', 'Competences'], variant: 'learning' },
  centers: { title: 'Carte des centres', text: 'Une lecture rapide des sites, villes, capacites et responsables.', points: ['Villes', 'Capacite', 'Responsables'], variant: 'campus' },
  formations: { title: 'Architecture des formations', text: 'Les programmes restent lisibles avec statut, planning et profil cible.', points: ['Statuts', 'Profils', 'Calendrier'], variant: 'formation' },
  sessions: { title: 'Organisation des sessions', text: 'Sessions, salles, participants et animateurs restent coordonnes dans un espace unique.', points: ['Planning', 'Animateurs', 'Participants'], variant: 'calendar' },
  absences: { title: 'Suivi de presence', text: 'Les absences et retards sont visibles sans alourdir la lecture operationnelle.', points: ['Dates', 'Types', 'Motifs'], variant: 'presence' },
  accommodations: { title: 'Hebergement', text: 'Hotels, villes, dates et couts sont presentes comme un suivi logistique propre.', points: ['Hotels', 'Dates', 'Couts'], variant: 'logistics' },
  travels: { title: 'Deplacements', text: 'Les trajets et transports sont organises autour des sessions de formation.', points: ['Origine', 'Destination', 'Transport'], variant: 'travel' },
  documents: { title: 'Bibliotheque formation', text: 'Les supports et fichiers restent accessibles selon leur categorie et visibilite.', points: ['Supports', 'Categories', 'Archives'], variant: 'documents' },
  evaluations: { title: 'Retours et impact', text: 'Les scores et avis donnent une lecture simple de la qualite des formations.', points: ['Contenu', 'Animation', 'Logistique'], variant: 'evaluation' },
  reports: { title: 'Rapports OFPPT', text: 'Les exports et rapports donnent une vue consolidee des activites de formation.', points: ['Participation', 'Progression', 'Evaluations'], variant: 'reports' },
};

const photoAssets = {
  dashboard: {
    src: '/visuals/workspace-desk.jpg',
    focus: 'center',
  },
  training: {
    src: '/visuals/learning-center.jpg',
    focus: 'center',
  },
  learning: {
    src: '/visuals/learning-center.jpg',
    focus: 'center',
  },
  formation: {
    src: '/visuals/java-classroom.jpg',
    focus: 'center',
  },
  documents: {
    src: '/visuals/workspace-desk.jpg',
    focus: 'center',
  },
  reports: {
    src: '/visuals/workspace-desk.jpg',
    focus: 'center',
  },
  calendar: {
    src: '/visuals/computer-classroom.jpg',
    focus: 'center',
  },
  presence: {
    src: '/visuals/computer-classroom.jpg',
    focus: 'center',
  },
  campus: {
    src: '/visuals/computer-classroom.jpg',
    focus: 'center',
  },
  logistics: {
    src: '/visuals/computer-classroom.jpg',
    focus: 'center',
  },
  travel: {
    src: '/visuals/computer-classroom.jpg',
    focus: 'center',
  },
  people: {
    src: '/visuals/learning-center.jpg',
    focus: 'center',
  },
  evaluation: {
    src: '/visuals/java-classroom.jpg',
    focus: 'center',
  },
  module: {
    src: '/visuals/learning-center.jpg',
    focus: 'center',
  },
};

function photoUrl(variant = 'module') {
  return (photoAssets[variant] || photoAssets.module).src;
}

const resources = {
  users: { title: 'Utilisateurs et roles', roles: ['admin'], fields: [
    ['name', 'Nom complet'], ['email', 'Email', 'email'], ['password', 'Mot de passe', 'password'], ['role', 'Role', 'select:roles'],
    ['phone', 'Telephone'], ['direction', 'Direction'], ['cdc', 'CDC'], ['active', 'Actif', 'checkbox']
  ] },
  themes: { title: 'Themes et ressources', roles: ['admin', 'responsable_cdc', 'responsable_formation'], fields: [
    ['title', 'Titre'], ['domain', 'Domaine'], ['duration_hours', 'Duree heures', 'number'], ['objectives', 'Objectifs', 'textarea'], ['skills_targeted', 'Competences visees', 'textarea']
  ] },
  centers: { title: 'Centres et sites', roles: ['admin', 'responsable_dr', 'responsable_formation'], fields: [
    ['name', 'Nom'], ['city', 'Ville'], ['capacity', 'Capacite', 'number'], ['manager_name', 'Responsable'], ['phone', 'Telephone'], ['address', 'Adresse', 'textarea']
  ] },
  formations: { title: 'Formations', roles: ['admin', 'responsable_cdc', 'responsable_formation', 'responsable_dr'], fields: [
    ['theme_id', 'Theme', 'select:themes'], ['title', 'Titre'], ['status', 'Statut', 'select:formationStatus'], ['target_profile', 'Profil cible'],
    ['planned_start_date', 'Debut prevu', 'date'], ['planned_end_date', 'Fin prevue', 'date'], ['description', 'Description', 'textarea']
  ] },
  sessions: { title: 'Planification des sessions', roles: ['admin', 'responsable_formation', 'responsable_dr', 'responsable_cdc', 'formateur_animateur', 'formateur_participant'], fields: [
    ['formation_id', 'Formation', 'select:formations'], ['center_id', 'Centre', 'select:centers'], ['animator_id', 'Animateur', 'select:animators'],
    ['code', 'Code'], ['start_date', 'Date debut', 'date'], ['end_date', 'Date fin', 'date'], ['place', 'Lieu/Salle'], ['status', 'Statut', 'select:sessionStatus'],
    ['capacity', 'Capacite', 'number'], ['participant_ids', 'Participants', 'multiselect:participants'], ['logistics_notes', 'Notes logistiques', 'textarea']
  ] },
  absences: { title: 'Absences', roles: ['admin', 'responsable_formation', 'responsable_dr', 'formateur_animateur', 'formateur_participant'], fields: [
    ['formation_session_id', 'Session', 'select:sessions'], ['user_id', 'Formateur absent', 'select:participants'], ['absence_date', 'Date absence', 'date'], ['type', 'Type', 'select:absenceTypes'], ['reason', 'Motif', 'textarea']
  ] },
  accommodations: { title: 'Hebergement', roles: ['admin', 'responsable_dr', 'responsable_formation', 'formateur_participant'], fields: [
    ['formation_session_id', 'Session', 'select:sessions'], ['user_id', 'Formateur', 'select:participants'], ['hotel_name', 'Hotel'], ['city', 'Ville'],
    ['check_in', 'Arrivee', 'date'], ['check_out', 'Depart', 'date'], ['cost', 'Cout', 'number'], ['status', 'Statut', 'select:logisticStatus']
  ] },
  travels: { title: 'Deplacements', roles: ['admin', 'responsable_dr', 'responsable_formation', 'formateur_participant'], fields: [
    ['formation_session_id', 'Session', 'select:sessions'], ['user_id', 'Formateur', 'select:participants'], ['origin', 'Origine'], ['destination', 'Destination'],
    ['transport_mode', 'Transport'], ['travel_date', 'Date', 'date'], ['cost', 'Cout', 'number'], ['status', 'Statut', 'select:logisticStatus']
  ] },
  documents: { title: 'Documents', roles: ['admin', 'responsable_cdc', 'responsable_formation', 'responsable_dr', 'formateur_participant', 'formateur_animateur'], fields: [
    ['formation_id', 'Formation', 'select:formations'], ['formation_session_id', 'Session', 'select:sessions'], ['title', 'Titre'], ['category', 'Categorie'],
    ['visible_roles', 'Roles visibles', 'multiselect:roles'], ['file', 'Fichier', 'file'], ['archived', 'Archive', 'checkbox']
  ] },
  evaluations: { title: 'Evaluations', roles: ['admin', 'responsable_formation', 'responsable_cdc', 'formateur_participant', 'formateur_animateur'], fields: [
    ['formation_session_id', 'Session', 'select:sessions'], ['participant_id', 'Participant', 'select:participants'], ['score_content', 'Contenu /5', 'number'],
    ['score_animator', 'Animateur /5', 'number'], ['score_logistics', 'Logistique /5', 'number'], ['feedback', 'Avis', 'textarea'],
    ['skills_acquired', 'Competences acquises', 'textarea'], ['impact_expected', 'Impact attendu', 'textarea']
  ] },
  reports: { title: 'Rapports', roles: ['admin', 'responsable_cdc', 'responsable_formation', 'responsable_dr'], fields: [
    ['title', 'Titre'], ['type', 'Type', 'select:reportTypes']
  ] },
};

const writeRoles = {
  users: ['admin'],
  centers: ['admin', 'responsable_dr', 'responsable_formation'],
  themes: ['admin', 'responsable_cdc', 'responsable_formation'],
  formations: ['admin', 'responsable_cdc', 'responsable_formation', 'responsable_dr'],
  sessions: ['admin', 'responsable_formation', 'responsable_dr', 'responsable_cdc'],
  absences: ['admin', 'responsable_formation', 'responsable_dr', 'formateur_animateur'],
  accommodations: ['admin', 'responsable_dr', 'responsable_formation'],
  travels: ['admin', 'responsable_dr', 'responsable_formation'],
  documents: ['admin', 'responsable_cdc', 'responsable_formation', 'responsable_dr', 'formateur_animateur'],
  evaluations: ['admin', 'responsable_formation', 'responsable_cdc', 'formateur_participant', 'formateur_animateur'],
  reports: ['admin', 'responsable_cdc', 'responsable_formation', 'responsable_dr'],
};

const fixedOptions = {
  formationStatus: ['planifiee', 'ouverte', 'en_cours', 'cloturee', 'annulee'],
  sessionStatus: ['planifiee', 'confirmee', 'en_cours', 'cloturee', 'annulee'],
  absenceTypes: ['justifiee', 'non_justifiee', 'retard'],
  logisticStatus: ['planifie', 'reserve', 'valide', 'annule'],
  reportTypes: ['global', 'participation', 'progression', 'evaluations', 'absences'],
};

function api(token) {
  return axios.create({ baseURL: API_URL, headers: { Authorization: `Bearer ${token}` } });
}

function can(user, key) {
  return user && (resources[key]?.roles.includes(user.role) || user.role === 'admin');
}

function BrandLogo({ size = 'md', label = false }) {
  return <div className={`logo-wrap logo-${size}`}>
    <span className="logo-glow" />
    <img src="/ofppt-logo-hd.png" alt="OFPPT" />
    {label && <div className="logo-label"><strong>OFPPT</strong><span>Formation Suite</span></div>}
  </div>;
}

function Login({ onLogin, theme, onThemeToggle }) {
  const [form, setForm] = useState({ email: 'admin@ofppt.test', password: 'password123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`${API_URL}/login`, form);
      onLogin(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Connexion impossible.');
    } finally {
      setLoading(false);
    }
  }

  return <main className="login-page" style={{ '--login-photo': `url("${photoUrl('dashboard')}")` }}>
    <div className="ambient ambient-one" />
    <div className="ambient ambient-two" />
    <div className="particle-field"><span /><span /><span /><span /><span /></div>
    <div className="login-theme"><ThemeToggle theme={theme} onToggle={onThemeToggle} /></div>
    <section className="login-panel">
      <div className="login-copy">
        <BrandLogo size="hero" />
        <p className="eyebrow">Suite Formation OFPPT</p>
        <h1>Gestion des formations des formateurs OFPPT</h1>
        <p className="muted">Un espace premium pour organiser les sessions, suivre les ressources, coordonner la logistique et consulter les rapports.</p>
        <div className="login-metrics">
          <span>Sessions planifiees</span><span>Documents centralises</span><span>Evaluations suivies</span><span>Rapports exportables</span>
        </div>
        <div className="login-visual-shell">
          <FuturisticVisual variant="training" title="Espace formation OFPPT" />
          <div className="signal-strip">
            {platformSignals.map(signal => <span key={signal.value}><strong>{signal.value}</strong>{signal.label}</span>)}
          </div>
        </div>
      </div>
      <form onSubmit={submit} className="login-card premium-card">
        <BrandLogo size="card" />
        <div className="login-card-aura" />
        <p className="eyebrow">Acces utilisateur</p>
        <h2>Connexion</h2>
        {error && <Toast tone="danger" text={error} />}
        <FieldShell label="Email" icon="@"><input className="premium-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></FieldShell>
        <FieldShell label="Mot de passe" icon="**"><input className="premium-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required /></FieldShell>
        <PremiumButton type="submit" block disabled={loading}>{loading ? 'Connexion...' : 'Se connecter'}</PremiumButton>
        <small className="helper">Comptes: admin@ofppt.test, cdc@ofppt.test, formation@ofppt.test, dr@ofppt.test, participant@ofppt.test, animateur@ofppt.test. Mot de passe: password123.</small>
      </form>
    </section>
  </main>;
}

function Shell({ user, token, onLogout, theme, onThemeToggle }) {
  const nav = Object.entries(resources).filter(([key]) => can(user, key));

  return <BrowserRouter>
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <BrandLogo size="nav" label />
        </div>
        <NavLink to="/" label="Tableau de bord" icon={navIcons.dashboard} />
        {nav.map(([key, item]) => <NavLink key={key} to={`/module/${key}`} label={item.title} icon={navIcons[key]} />)}
        <PremiumButton tone="ghost" className="sidebar-logout" icon="logout" onClick={onLogout}>Deconnexion</PremiumButton>
      </aside>
      <main className="content">
        <header className="topbar">
          <div className="topbar-identity"><BrandLogo size="mini" /><div><strong>{user.name}</strong><span>{labels[user.role]}</span></div></div>
          <div className="topbar-actions">
            <ThemeToggle theme={theme} onToggle={onThemeToggle} />
            <span className="connection-pill"><Icon name="pulse" /> API connectee</span>
          </div>
        </header>
        <Routes>
          <Route path="/" element={<Dashboard user={user} token={token} />} />
          <Route path="/module/:resource" element={<Module user={user} token={token} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  </BrowserRouter>;
}

function NavLink({ to, label, icon }) {
  const location = useLocation();
  const active = location.pathname === to;
  return <Link className={active ? 'active' : ''} to={to}><span className="nav-icon"><Icon name={icon} /></span><span>{label}</span></Link>;
}

function Dashboard({ user, token }) {
  const [data, setData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    Promise.all([api(token).get('/dashboard'), api(token).get('/analytics')])
      .then(([dashboard, report]) => {
        if (live) {
          setData(dashboard.data);
          setAnalytics(report.data);
        }
      })
      .catch(() => setError('Impossible de charger le tableau de bord.'));
    return () => { live = false; };
  }, [token]);

  if (error) return <div className="page"><Toast tone="danger" text={error} /></div>;
  if (!data) return <Loading text="Chargement du tableau de bord..." />;

  async function exportCsv() {
    const res = await api(token).get('/reports/export.csv', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rapport-ofppt.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  const skin = roleSkins[user.role] || roleSkins.admin;

  return <div className="page">
    <div className="hero-band" style={{ '--hero-gradient': skin.gradient, '--hero-glow': skin.glow, '--hero-photo': `url("${photoUrl('dashboard')}")` }}>
      <div>
        <div className="hero-brandline"><BrandLogo size="hero-small" /><p className="eyebrow">{skin.tone}</p></div>
        <h1>Tableau de bord operationnel</h1>
        <p className="muted">{dashboardCopy[user.role] || 'Toutes les mesures proviennent de l API Laravel et de la base de donnees.'}</p>
      </div>
      <div className="hero-side">
        <span>{labels[user.role]}</span>
        <strong>{Object.values(data.stats).reduce((sum, value) => sum + Number(value || 0), 0)}</strong>
        <em>elements suivis</em>
        <PremiumButton tone="light" icon="download" onClick={exportCsv}>Exporter CSV</PremiumButton>
      </div>
    </div>

    <DashboardCommandStrip data={data} user={user} />

    <section className="stats-grid">
      {Object.entries(data.stats).map(([k, v], index) => <StatCard key={k} label={human(k)} value={v} index={index} />)}
    </section>

    <VisualFeatureBand />

    <section className="grid-3">
      <Panel title="Priorites du role">
        {(roleFocus[user.role] || []).map(item => <div className="focus-row" key={item}><span />{item}</div>)}
      </Panel>
      <Panel title="Sessions a venir">
        {data.alerts.upcoming_sessions.length ? data.alerts.upcoming_sessions.map(s => <Row key={s.id} a={s.code} b={s.formation?.title} c={s.start_date} />) : <Empty text="Aucune session planifiee." variant="calendar" />}
      </Panel>
      <Panel title="Alertes absences">
        {data.alerts.absence_risk.length ? data.alerts.absence_risk.map(a => <Row key={a.user_id} a={a.user?.name} b={`${a.total} absences`} c="A suivre" />) : <Empty text="Aucune alerte critique." variant="presence" />}
      </Panel>
      <Panel title="Activite recente">
        <Timeline items={[
          ['Dashboard', 'Statistiques synchronisees depuis la base', 'Live'],
          ['Documents', `${data.recent_documents.length} ressources recentes`, 'Docs'],
          ['Planning', `${data.alerts.upcoming_sessions.length} sessions a venir`, 'Next'],
        ]} />
      </Panel>
    </section>

    <section className="grid-2">
      <Panel title="Analyse evaluations">
        {analytics && <BarChart rows={[
          ['Contenu', analytics.evaluations.content, 5],
          ['Animateur', analytics.evaluations.animator, 5],
          ['Logistique', analytics.evaluations.logistics, 5],
        ]} />}
      </Panel>
      <Panel title="Absences par type">
        {analytics?.absences?.by_type?.length ? <BarChart rows={analytics.absences.by_type.map(x => [human(x.type), x.total, Math.max(analytics.absences.total, 1)])} /> : <Empty text="Aucune absence enregistree." variant="presence" />}
      </Panel>
      <Panel title="Mon parcours">
        {data.my_path.length ? data.my_path.map(s => <Row key={s.id} a={s.code} b={s.formation?.title} c={`${s.pivot?.progress_percent || 0}%`} />) : <Empty text="Aucune session affectee." variant="formation" />}
      </Panel>
      <Panel title="Documents recents">
        {data.recent_documents.length ? data.recent_documents.map(d => <Row key={d.id} a={d.title} b={d.category} c={d.archived ? 'Archive' : 'Actif'} />) : <Empty text="Aucun document." variant="documents" />}
      </Panel>
      <Panel title="Progression operationnelle">
        <ProgressDashboard stats={data.stats} />
      </Panel>
      <Panel title="Organisation formation">
        <InsightVisual />
      </Panel>
    </section>
  </div>;
}

function Module({ user, token }) {
  const { resource } = useParams();
  const config = resources[resource];
  const client = useMemo(() => api(token), [token]);
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState({});
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: 'id', dir: 'desc' });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!config || !can(user, resource)) navigate('/');
  }, [config, user, resource, navigate]);

  const load = useCallback(async () => {
    if (!config) return;
    setLoading(true);
    try {
      const { data } = await client.get(`/${resource}`, { params: { search, per_page: 100 } });
      setRows(data.data || data);
    } catch (err) {
      setNotice({ tone: 'danger', text: err.response?.data?.message || 'Chargement impossible.' });
    } finally {
      setLoading(false);
    }
  }, [client, config, resource, search]);

  useEffect(() => {
    load();
    client.get('/options').then(r => setOptions(r.data)).catch(() => {});
  }, [client, load]);

  if (!config) return <Navigate to="/" />;

  const sorted = [...rows].sort((a, b) => {
    const av = String(valueForSort(a, sort.key, resource) ?? '').toLowerCase();
    const bv = String(valueForSort(b, sort.key, resource) ?? '').toLowerCase();
    return sort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
  });
  const perPage = 8;
  const totalPages = Math.max(Math.ceil(sorted.length / perPage), 1);
  const pageRows = sorted.slice((page - 1) * perPage, page * perPage);

  function changeSort(key) {
    setSort(current => current.key === key ? { key, dir: current.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
  }

  async function save(values) {
    setNotice({ tone: 'loading', text: 'Enregistrement en cours...' });
    try {
      const hasFile = config.fields.some(f => f[2] === 'file');
      const payload = hasFile ? toFormData(values) : normalize(values);
      if (editing?.id) {
        await client.post(`/${resource}/${editing.id}?_method=PUT`, payload, hasFile ? { headers: { 'Content-Type': 'multipart/form-data' } } : {});
      } else {
        await client.post(`/${resource}`, payload, hasFile ? { headers: { 'Content-Type': 'multipart/form-data' } } : {});
      }
      setEditing(null);
      setNotice({ tone: 'success', text: 'Operation enregistree avec succes.' });
      await load();
    } catch (err) {
      setNotice({ tone: 'danger', text: err.response?.data?.message || Object.values(err.response?.data?.errors || {}).flat().join(' ') || 'Erreur de validation.' });
    }
  }

  async function remove(id) {
    if (!window.confirm('Supprimer cet element ?')) return;
    await client.delete(`/${resource}/${id}`);
    setNotice({ tone: 'success', text: 'Element supprime.' });
    load();
  }

  async function downloadDocument(id) {
    const res = await client.get(`/documents/${id}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  return <div className="page">
    <div className="module-hero" style={{ '--module-photo': `url("${photoUrl(moduleVisuals[resource]?.variant)}")` }}>
      <div>
        <p className="eyebrow">{moduleAccents[resource] || 'Module'} OFPPT</p>
        <h1>{config.title}</h1>
        <span>{rows.length} donnees synchronisees avec la base Laravel</span>
      </div>
      {canWrite(user, resource) && <PremiumButton icon="plus" onClick={() => setEditing({})}>Nouveau</PremiumButton>}
    </div>
    {notice && <Toast tone={notice.tone} text={notice.text} />}
    <div className="toolbar premium-card">
      <FieldShell label="Recherche" icon="search"><input className="premium-input" placeholder="Rechercher dans la base..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></FieldShell>
      <PremiumButton tone="secondary" icon="filter" onClick={load}>Filtrer</PremiumButton>
      <span>{rows.length} elements</span>
    </div>
    <ModuleVisualSection resource={resource} count={rows.length} />
    {editing !== null && <Editor config={config} resource={resource} item={editing} options={options} user={user} onCancel={() => setEditing(null)} onSave={save} />}
    <div className="table-card premium-card">
      {loading ? <Loading text="Chargement des donnees..." compact /> : <table className="premium-table">
        <thead><tr>
          <th><button onClick={() => changeSort('primary')}>Element</button></th>
          <th><button onClick={() => changeSort('details')}>Details</button></th>
          <th><button onClick={() => changeSort('status')}>Statut</button></th>
          <th></th>
        </tr></thead>
        <tbody>{pageRows.map(row => <tr key={row.id}>
          <td><strong>{primary(row, resource)}</strong><small>{row.code || row.email || row.city || ''}</small></td>
          <td>{details(row, resource)}</td>
          <td><span className={`status status-${statusTone(row.status || row.role || row.type || row.category)}`}>{human(row.status || row.role || row.type || row.category || '-')}</span></td>
          <td className="actions">
            {resource === 'documents' && row.file_path && <PremiumButton size="sm" tone="success" icon="download" onClick={() => downloadDocument(row.id)}>Telecharger</PremiumButton>}
            {canWrite(user, resource) && <PremiumButton size="sm" tone="secondary" icon="edit" onClick={() => setEditing(row)}>Modifier</PremiumButton>}
            {canWrite(user, resource) && <PremiumButton size="sm" tone="danger" icon="trash" onClick={() => remove(row.id)}>Supprimer</PremiumButton>}
          </td>
        </tr>)}</tbody>
      </table>}
      {!loading && !pageRows.length && <Empty text="Aucune donnee trouvee." variant={moduleVisuals[resource]?.variant || 'documents'} />}
      <div className="pagination-bar">
        <PremiumButton size="sm" tone="secondary" icon="left" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Precedent</PremiumButton>
        <span>Page {page} / {totalPages}</span>
        <PremiumButton size="sm" tone="secondary" icon="right" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Suivant</PremiumButton>
      </div>
    </div>
  </div>;
}

function Editor({ config, resource, item, options, user, onCancel, onSave }) {
  const [values, setValues] = useState(() => fromItem(item, resource));
  function set(name, value) { setValues(v => ({ ...v, [name]: value })); }
  function submit(e) { e.preventDefault(); onSave(values); }

  const hiddenForRole = ([name]) =>
    resource === 'evaluations' && user.role === 'formateur_participant' && name === 'participant_id';

  return <div className="modal-backdrop">
    <form className="editor premium-card premium-modal" onSubmit={submit}>
      <div className="editor-head">
        <div><p className="eyebrow">Edition rapide</p><h2>{item.id ? 'Modifier' : 'Creer'}</h2></div>
        <button type="button" className="close-button" onClick={onCancel} aria-label="Fermer"><Icon name="close" /></button>
      </div>
      <div className="form-grid">
        {config.fields.filter(field => !hiddenForRole(field)).map(([name, label, type = 'text']) =>
          <Field key={name} name={name} label={label} type={type} value={values[name]} options={options} onChange={set} />
        )}
      </div>
      <div className="form-actions"><PremiumButton type="button" tone="secondary" icon="close" onClick={onCancel}>Annuler</PremiumButton><PremiumButton type="submit" icon="save">Enregistrer</PremiumButton></div>
    </form>
    </div>
  ;
}

function Field({ name, label, type, value, options, onChange }) {
  const [kind, source] = type.split(':');
  const opts = source ? optionList(source, options) : [];
  if (kind === 'textarea') return <FieldShell label={label} icon="text"><textarea className="premium-input" value={value || ''} onChange={e => onChange(name, e.target.value)} /></FieldShell>;
  if (kind === 'checkbox') return <label className="checkline"><input type="checkbox" checked={!!value} onChange={e => onChange(name, e.target.checked)} />{label}</label>;
  if (kind === 'file') return <FieldShell label={label} icon="upload"><input className="premium-input" type="file" onChange={e => onChange(name, e.target.files[0])} /></FieldShell>;
  if (kind === 'select') return <FieldShell label={label} icon="select"><select className="premium-input" value={value || ''} onChange={e => onChange(name, e.target.value)}><option value="">-- Choisir --</option>{opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></FieldShell>;
  if (kind === 'multiselect') return <FieldShell label={label} icon="layers"><select className="premium-input" multiple value={value || []} onChange={e => onChange(name, Array.from(e.target.selectedOptions).map(o => o.value))}>{opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></FieldShell>;
  return <FieldShell label={label} icon={kind === 'date' ? 'calendar' : kind === 'number' ? 'hash' : 'input'}><input className="premium-input" type={kind} value={value ?? ''} onChange={e => onChange(name, e.target.value)} /></FieldShell>;
}

function FieldShell({ label, icon, children }) {
  return <label className="field-shell"><span>{label}</span><div className="input-frame">{icon && <em><Icon name={icon} /></em>}{children}</div></label>;
}

function Panel({ title, children }) {
  return <PremiumCard className="panel">
    <h2>{title}</h2>
    {children}
  </PremiumCard>;
}

function Row({ a, b, c }) {
  return <div className="list-row"><strong>{a || '-'}</strong><span>{b || ''}</span><em>{c || ''}</em></div>;
}

function BarChart({ rows }) {
  return <div className="bar-chart">{rows.map(([label, value, max]) => {
    const pct = Math.min(100, Math.round((Number(value || 0) / Number(max || 1)) * 100));
    return <div className="bar-row" key={label}>
      <div><span>{label}</span><strong>{value}</strong></div>
      <div className="bar-track"><span style={{ width: `${pct}%` }} /></div>
    </div>;
  })}</div>;
}

function PremiumCard({ children, className = '' }) {
  return <section className={`premium-card ${className}`}>{children}</section>;
}

function PremiumButton({ children, tone = 'primary', size = 'md', block = false, icon, className = '', ...props }) {
  return <button className={`premium-button premium-button-${tone} premium-button-${size}${block ? ' premium-button-block' : ''} ${className}`} {...props}>{icon && <Icon name={icon} />}{children}</button>;
}

function ThemeToggle({ theme, onToggle }) {
  return <button className="theme-toggle" onClick={onToggle} type="button" aria-label="Changer le theme">
    <span className="theme-toggle-track"><span /></span>
    {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
  </button>;
}

function StatCard({ label, value, index }) {
  return <article className="stat-card premium-card" style={{ '--delay': `${index * 55}ms` }}>
    <div className="stat-orb">{String(index + 1).padStart(2, '0')}</div>
    <span>{label}</span>
    <strong>{value}</strong>
    <div className="stat-line" />
  </article>;
}

function DashboardCommandStrip({ data, user }) {
  const totalStats = Object.values(data.stats).reduce((sum, value) => sum + Number(value || 0), 0);
  const upcoming = data.alerts.upcoming_sessions.length;
  const absenceRisks = data.alerts.absence_risk.length;
  const docs = data.recent_documents.length;
  const cards = [
    ['Pilotage', labels[user.role] || 'OFPPT', 'shield'],
    ['Elements actifs', totalStats, 'pulse'],
    ['Sessions proches', upcoming, 'calendar'],
    ['Alertes presence', absenceRisks || 'Stable', absenceRisks ? 'warning' : 'check'],
    ['Docs recents', docs, 'file'],
  ];
  return <section className="command-strip">
    {cards.map(([label, value, icon]) => <article className="command-card" key={label}>
      <span><Icon name={icon} /></span>
      <div><small>{label}</small><strong>{value}</strong></div>
    </article>)}
  </section>;
}

function Icon({ name }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="8" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="15" width="7" height="6" rx="1.5" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="9.5" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z" /></>,
    building: <><path d="M4 21V5a2 2 0 0 1 2-2h9v18" /><path d="M15 8h3a2 2 0 0 1 2 2v11" /><path d="M8 7h3M8 11h3M8 15h3" /></>,
    graduation: <><path d="m22 10-10-5-10 5 10 5 10-5Z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /><path d="M22 10v6" /></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
    userCheck: <><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="9.5" cy="7" r="4" /><path d="m16 11 2 2 4-4" /></>,
    bed: <><path d="M3 7v14M21 12v9M3 14h18" /><path d="M7 14V9a2 2 0 0 1 2-2h3a3 3 0 0 1 3 3v4" /></>,
    route: <><circle cx="6" cy="19" r="3" /><circle cx="18" cy="5" r="3" /><path d="M6 16c0-5 12-3 12-8" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></>,
    star: <path d="m12 2 2.9 6 6.6.9-4.8 4.7 1.1 6.5L12 17l-5.8 3.1 1.1-6.5-4.8-4.7 6.6-.9L12 2Z" />,
    chart: <><path d="M3 3v18h18" /><path d="m7 15 4-4 3 3 5-7" /></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></>,
    pulse: <path d="M3 12h4l2-7 4 14 2-7h6" />,
    download: <><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
    filter: <path d="M3 5h18l-7 8v5l-4 2v-7L3 5Z" />,
    edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></>,
    trash: <><path d="M3 6h18" /><path d="M8 6V4h8v2M19 6l-1 15H6L5 6" /></>,
    left: <path d="m15 18-6-6 6-6" />,
    right: <path d="m9 18 6-6-6-6" />,
    close: <path d="M18 6 6 18M6 6l12 12" />,
    save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" /><path d="M17 21v-8H7v8M7 3v5h8" /></>,
    text: <><path d="M4 7V4h16v3M9 20h6M12 4v16" /></>,
    upload: <><path d="M12 21V9" /><path d="m17 14-5-5-5 5" /><path d="M5 3h14" /></>,
    select: <><path d="m8 9 4-4 4 4" /><path d="m16 15-4 4-4-4" /></>,
    layers: <><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 17 9 5 9-5" /></>,
    hash: <><path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" /></>,
    input: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 9h10M7 13h6" /></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
    warning: <><path d="m12 3 10 18H2L12 3Z" /><path d="M12 9v5M12 18h.01" /></>,
    check: <path d="m20 6-11 11-5-5" />,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>{paths[name] || paths.input}</svg>;
}

function Timeline({ items }) {
  return <div className="timeline">{items.map(([title, text, tag]) =>
    <div className="timeline-item" key={title}>
      <span />
      <div><strong>{title}</strong><p>{text}</p></div>
      <em>{tag}</em>
    </div>
  )}</div>;
}

function ProgressDashboard({ stats }) {
  const values = Object.entries(stats).slice(0, 4);
  const max = Math.max(...values.map(([, value]) => Number(value || 0)), 1);
  return <div className="progress-grid">{values.map(([label, value]) => {
    const pct = Math.min(100, Math.round((Number(value || 0) / max) * 100));
    return <div className="progress-tile" key={label}>
      <div className="progress-ring" style={{ '--pct': `${pct}%` }}><strong>{pct}%</strong></div>
      <span>{human(label)}</span>
    </div>;
  })}</div>;
}

function VisualFeatureBand() {
  const items = [
    ['Planification', 'Sessions, centres et animateurs dans une lecture unifiee.', 'calendar'],
    ['Ressources', 'Documents et themes accessibles depuis les modules concernes.', 'documents'],
    ['Suivi', 'Absences, evaluations et progression restent faciles a comparer.', 'reports'],
  ];
  return <section className="visual-feature-band">
    {items.map(([title, text, variant]) => <VisualFeatureCard key={title} title={title} text={text} variant={variant} />)}
  </section>;
}

function VisualFeatureCard({ title, text, variant }) {
  return <article className="visual-feature-card premium-card">
    <FuturisticVisual variant={variant} title={title} />
    <div>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  </article>;
}

function ModuleVisualSection({ resource, count }) {
  const visual = moduleVisuals[resource] || moduleVisuals.formations;
  return <section className="module-visual-section premium-card">
    <div className="module-visual-copy">
      <p className="eyebrow">{moduleAccents[resource] || 'Module'}</p>
      <h2>{visual.title}</h2>
      <p>{visual.text}</p>
      <div className="module-visual-points">
        {visual.points.map(point => <span key={point}>{point}</span>)}
      </div>
    </div>
    <ModuleCardIllustration resource={resource} />
    <div className="module-visual-metric">
      <strong>{count}</strong>
      <span>elements</span>
    </div>
    <FuturisticVisual variant={visual.variant} title={visual.title} />
  </section>;
}

function ModuleCardIllustration({ resource }) {
  const [primaryColor, secondaryColor, icon] = moduleIllustrationSkins[resource] || ['#00b877', '#22d3ee', 'dashboard'];
  return <div className="module-card-illustration" style={{ '--ill-primary': primaryColor, '--ill-secondary': secondaryColor }} aria-hidden="true">
    <svg viewBox="0 0 220 150" role="presentation">
      <defs>
        <linearGradient id={`ill-${resource}-a`} x1="0" x2="1" y1="0" y2="1">
          <stop stopColor={primaryColor} stopOpacity="0.95" />
          <stop offset="1" stopColor={secondaryColor} stopOpacity="0.92" />
        </linearGradient>
        <linearGradient id={`ill-${resource}-b`} x1="0" x2="1">
          <stop stopColor="#f8fcff" stopOpacity="0.92" />
          <stop offset="1" stopColor="#f8fcff" stopOpacity="0.58" />
        </linearGradient>
      </defs>
      <path d="M32 118c24-52 58-24 82-72 18-36 58-24 76 8 18 34-2 74-48 82-38 7-78 24-110-18Z" fill={`url(#ill-${resource}-a)`} opacity="0.16" />
      <rect x="52" y="36" width="104" height="78" rx="18" fill={`url(#ill-${resource}-b)`} stroke="currentColor" opacity="0.72" />
      <rect x="74" y="58" width="104" height="78" rx="18" fill="var(--bg-card-strong)" stroke="currentColor" opacity="0.9" />
      <path d="M96 88h56M96 108h40" stroke="var(--ill-primary)" strokeWidth="8" strokeLinecap="round" opacity="0.9" />
      <circle cx="75" cy="55" r="20" fill={`url(#ill-${resource}-a)`} />
      <foreignObject x="60" y="40" width="30" height="30">
        <span className="module-card-illustration-icon"><Icon name={icon} /></span>
      </foreignObject>
      <path d="M156 42h28M170 28v28" stroke="var(--ill-secondary)" strokeWidth="7" strokeLinecap="round" opacity="0.74" />
      <circle cx="176" cy="118" r="8" fill="var(--ill-secondary)" opacity="0.72" />
      <circle cx="43" cy="86" r="6" fill="var(--ill-primary)" opacity="0.5" />
    </svg>
  </div>;
}

function Toast({ tone, text }) {
  return <div className={`toast-line toast-${tone}`}>{tone === 'loading' && <span className="spinner" />}{text}</div>;
}

function Empty({ text, variant = 'documents' }) {
  return <div className="empty-state">
    <EmptyVisual variant={variant} />
    <p>{text}</p>
    <span>Les donnees apparaitront ici des que le module sera synchronise.</span>
  </div>;
}

function Loading({ text, compact = false }) {
  return <div className={compact ? 'loading compact' : 'loading'}><span className="spinner" />{text}</div>;
}

function optionList(source, options) {
  if (fixedOptions[source]) return fixedOptions[source].map(v => ({ value: v, label: human(v) }));
  if (source === 'roles') return (options.roles || []).map(v => typeof v === 'string' ? { value: v, label: labels[v] || v } : { value: v.key, label: v.label });
  if (source === 'participants') return (options.users || []).filter(u => u.role?.includes('formateur')).map(u => ({ value: String(u.id), label: `${u.name} (${labels[u.role]})` }));
  if (source === 'animators') return (options.users || []).filter(u => u.role === 'formateur_animateur').map(u => ({ value: String(u.id), label: u.name }));
  return (options[source] || []).map(o => ({ value: String(o.id), label: o.title || o.name || o.code }));
}

function normalize(values) {
  const copy = { ...values };
  Object.keys(copy).forEach(k => {
    if (copy[k] === '') copy[k] = null;
    if (Array.isArray(copy[k])) copy[k] = copy[k].map(v => Number.isFinite(Number(v)) ? Number(v) : v);
  });
  return copy;
}

function toFormData(values) {
  const fd = new FormData();
  Object.entries(values).forEach(([k, v]) => {
    if (v === null || v === undefined || v === '') return;
    if (Array.isArray(v)) v.forEach(x => fd.append(`${k}[]`, x));
    else fd.append(k, v);
  });
  return fd;
}

function fromItem(item, resource) {
  const copy = { ...item };
  if (resource === 'sessions' && item.participants) copy.participant_ids = item.participants.map(p => String(p.id));
  if (resource === 'documents' && item.visible_roles) copy.visible_roles = item.visible_roles;
  if (resource === 'users' && item.id) copy.password = '';
  return copy;
}

function primary(row, resource) {
  return row.title || row.name || row.code || row.hotel_name || row.origin || `${resources[resource].title} #${row.id}`;
}

function details(row, resource) {
  if (resource === 'sessions') return `${row.formation?.title || ''} - ${row.start_date} au ${row.end_date}`;
  if (resource === 'formations') return row.theme?.title || row.description;
  if (resource === 'absences') return `${row.user?.name || ''} - ${row.absence_date}`;
  if (resource === 'evaluations') return `${row.participant?.name || ''} - scores ${row.score_content}/${row.score_animator}/${row.score_logistics}`;
  if (resource === 'travels') return `${row.origin} -> ${row.destination} (${row.travel_date})`;
  if (resource === 'accommodations') return `${row.city} du ${row.check_in} au ${row.check_out}`;
  return row.description || row.domain || row.address || row.feedback || '';
}

function canWrite(user, resource) {
  return Boolean(user && writeRoles[resource]?.includes(user.role));
}

function valueForSort(row, key, resource) {
  if (key === 'primary') return primary(row, resource);
  if (key === 'details') return details(row, resource);
  if (key === 'status') return row.status || row.role || row.type || row.category;
  return row[key];
}

function human(value) {
  return String(value).replaceAll('_', ' ');
}

function statusTone(value = '') {
  if (['cloturee', 'valide', 'justifiee', 'admin', 'active'].includes(value)) return 'success';
  if (['en_cours', 'confirmee', 'ouverte', 'reserve'].includes(value)) return 'info';
  if (['annulee', 'non_justifiee'].includes(value)) return 'danger';
  if (['retard', 'planifiee', 'planifie'].includes(value)) return 'warning';
  return 'neutral';
}

function FuturisticVisual({ variant = 'dashboard', title }) {
  const asset = photoAssets[variant] || photoAssets.module;
  return <div
    className={`future-visual photo-visual photo-visual-${variant}`}
    aria-label={title}
    role="img"
    style={{ '--photo': `url("${asset.src}")`, '--photo-focus': asset.focus }}
  >
    <PhotoOverlay variant={variant} />
  </div>;
}

function InsightVisual() {
  return <div className="insight-visual">
    {['Centres', 'Sessions', 'Documents', 'Evaluations'].map((label, index) =>
      <div className="insight-node" key={label} style={{ '--i': index }}>
        <strong>{String(index + 1).padStart(2, '0')}</strong>
        <span>{label}</span>
      </div>
    )}
  </div>;
}

function PhotoOverlay({ variant }) {
  if (['documents'].includes(variant)) return <div className="photo-ui photo-ui-docs"><span /><span /><span /><em>DOC</em></div>;
  if (['reports', 'dashboard'].includes(variant)) return <div className="photo-ui photo-ui-chart"><span /><span /><span /><i /></div>;
  if (['calendar', 'presence'].includes(variant)) return <div className="photo-ui photo-ui-list"><span /><span /><span /></div>;
  if (['campus', 'logistics', 'travel'].includes(variant)) return <div className="photo-ui photo-ui-route"><span /><i /><span /></div>;
  if (['evaluation'].includes(variant)) return <div className="photo-ui photo-ui-score"><strong>4.6</strong><span>Evaluation</span></div>;
  return <div className="photo-ui photo-ui-training"><span>Session</span><i /><em>OFPPT</em></div>;
}

function EmptyVisual({ variant }) {
  if (['calendar', 'presence'].includes(variant)) return <svg className="empty-visual" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="25" y="16" width="70" height="50" rx="8" stroke="currentColor" strokeWidth="2" />
    <path d="M25 31H95M43 10V22M77 10V22M42 45H78M42 57H66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M72 56L80 64L96 45" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
  if (['reports', 'evaluation'].includes(variant)) return <svg className="empty-visual" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="22" y="16" width="76" height="48" rx="8" stroke="currentColor" strokeWidth="2" />
    <path d="M36 53V42M54 53V31M72 53V38M88 53V25M34 59H92" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
  </svg>;
  if (['formation', 'learning', 'training'].includes(variant)) return <svg className="empty-visual" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="28" y="14" width="64" height="38" rx="7" stroke="currentColor" strokeWidth="2" />
    <path d="M42 28H78M42 39H66M23 66H97M46 52L39 66M74 52L81 66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="35" cy="61" r="6" stroke="currentColor" strokeWidth="2" />
    <circle cx="85" cy="61" r="6" stroke="currentColor" strokeWidth="2" />
  </svg>;
  return <svg className="empty-visual" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M32 14H74L90 30V66H32V14Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="M74 14V31H90M45 39H76M45 50H76M45 61H65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>;
}

function App() {
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem('ofppt_auth');
    return raw ? JSON.parse(raw) : null;
  });
  const [theme, setTheme] = useState(() => localStorage.getItem('ofppt_theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('ofppt_theme', theme);
    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;
  }, [theme]);

  function onLogin(data) {
    localStorage.setItem('ofppt_auth', JSON.stringify(data));
    setAuth(data);
  }

  async function logout() {
    try { await api(auth.token).post('/logout'); } catch {}
    localStorage.removeItem('ofppt_auth');
    setAuth(null);
  }

  return auth
    ? <Shell user={auth.user} token={auth.token} onLogout={logout} theme={theme} onThemeToggle={() => setTheme(v => v === 'dark' ? 'light' : 'dark')} />
    : <Login onLogin={onLogin} theme={theme} onThemeToggle={() => setTheme(v => v === 'dark' ? 'light' : 'dark')} />;
}

export default App;
