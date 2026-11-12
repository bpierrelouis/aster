/* ==========================================================================
   Administration › Interventions : suivi des installations, désinstallations
   et réinitialisations demandées (core/interventions.js), comme celui des
   remontées. Une ligne par demande : une salle entière tient sur une ligne,
   avec son avancement ; le détail suit l'intervention et chacun des postes.
   Seul écran de suivi des interventions.
   ========================================================================== */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useStore } from '../../hooks/use-store.js';
import { useEscape } from '../../hooks/use-escape.js';
import { usePeek } from '../../ui/peek.js';
import { store } from '../../core/store.js';
import { batimentLabel } from '../../core/selectors.js';
import { interventions, titreIntervention, objetIntervention } from '../../core/interventions.js';
import { matcher } from '../../core/search.js';
import { ETATS_INTERVENTION, intervention, etatIntervention } from '#shared/catalog.js';
import { num, plural, ago, dateLong, dateShort } from '#shared/format.js';
import { Icon, Tile } from '../../ui/icons.jsx';
import { AppIcon } from '../../ui/app-icon.jsx';
import { PageHead, PosteEtat, Progress } from '../../widgets/parts.jsx';

const BASE = '/administration/interventions';
const CIBLE_LIBELLE = { salle: 'Salle entière', postes: 'Postes', poste: 'Poste' };

function EtatPill({ type, etat }) {
  const e = ETATS_INTERVENTION[etat];
  return <span className={`pill pill--${e.tone}`}><Icon name={e.icon} size={14} />{etatIntervention(type, etat)}</span>;
}

/** Application installée ou désinstallée ; Windows pour une réinstallation */
function Lead({ o, size = 40, tile = 'm' }) {
  const app = o.applicationId && store.state.applications.find((a) => a.id === o.applicationId);
  return app ? <AppIcon name={app.nom} size={size} /> : <Tile name={intervention(o.type).icon} color="var(--accent)" size={tile} />;
}

/** Cible : salle entière ou postes d'une salle (la salle et le nombre de postes), ou un poste */
function Cible({ x }) {
  const { kind, salle, label } = x.cible;
  return kind === 'poste'
    ? <span className="chip chip--pin"><Icon name="desktop" size={13} />{label}</span>
    : <><span className="chip chip--pin" data-tip={salle && batimentLabel(salle.batiment)}><Icon name="pin" size={13} />{salle?.nom ?? 'Salle retirée'}</span>
      <span className="row-meta">{kind === 'salle' ? plural(x.n.total, 'poste') : `${plural(x.n.total, 'poste choisi', 'postes choisis')}`}</span></>;
}

const avancement = (x) => <Progress value={x.n.fait / x.n.total} label={`Avancement : ${num(x.n.fait)} sur ${plural(x.n.total, 'poste')}`} />;

function Row({ x, selected }) {
  const { o } = x;
  return <li>
    <Link className={`rm-row ${selected ? 'is-selected' : ''}`} to={`${BASE}/${o.id}`} aria-current={selected ? 'true' : 'false'}>
      <Lead o={o} />
      <span className="rm-main">
        <span className="rm-title">{titreIntervention(o)}</span>
        <span className="row-sub"><Cible x={x} /><span className="row-meta"><Icon name="user" size={13} />{o.par}</span></span>
        {x.n.total > 1 && avancement(x)}
      </span>
      <span className="rm-side"><EtatPill type={o.type} etat={x.etat} /><span className="rm-age">{ago(o.at)}</span></span>
    </Link>
  </li>;
}

const reponses = (n) => (n.fait + n.echec ? `${num(n.fait + n.echec)} sur ${plural(n.total, 'poste')} ${n.fait + n.echec > 1 ? 'ont' : 'a'} répondu` : 'Aucun poste n’a encore répondu');

/** Suivi : demande, intervention sur les postes, fin (faite ou en échec) */
function Timeline({ x }) {
  const { o, n } = x;
  const t = intervention(o.type);
  const fini = x.etat === 'fait' || x.etat === 'echec';
  return <ol className="timeline">
    <li className="tl-item is-done"><span className="tl-dot"><Icon name="documents" size={16} /></span>
      <div className="tl-body"><b>Demande enregistrée</b><span>{dateLong(o.at)}</span><span>{o.par}</span></div></li>
    <li className={`tl-item is-done tl-item--${fini ? 'encours' : `${x.etat} is-current`}`}><span className="tl-dot"><Icon name={t.icon} size={16} /></span>
      <div className="tl-body"><b>{fini ? `${t.label} sur ${x.n.total > 1 ? 'les postes' : 'le poste'}` : t.etats[x.etat]}</b><span>{reponses(n)}</span>
        {n.attente > 0 && <span>{plural(n.attente, 'poste éteint ou indisponible', 'postes éteints ou indisponibles')}, en attente de {n.attente > 1 ? 'leur' : 'son'} retour</span>}</div></li>
    {fini
      ? <li className={`tl-item is-done is-current tl-item--${x.etat}`}><span className="tl-dot"><Icon name={ETATS_INTERVENTION[x.etat].icon} size={16} /></span>
        <div className="tl-body"><b>{x.etat === 'echec' ? `Échec sur ${plural(n.echec, 'poste')}` : t.etats.fait}</b><span>{o.termineLe ? dateLong(o.termineLe) : ''}</span></div></li>
      : <li className="tl-item tl-item--todo"><span className="tl-dot"><Icon name="checkCircle" size={16} /></span>
        <div className="tl-body"><b>{t.etats.fait}</b><span>Une fois que tous les postes l’auront fait</span></div></li>}
  </ol>;
}

function Detail({ x }) {
  const navigate = useNavigate();
  const scroll = usePeek('.rm-detail');
  useEscape(() => navigate(BASE), Boolean(x));
  if (!x) return <div ref={scroll} className="insp-scroll"><div className="rm-empty"><Tile name="clock" color="var(--accent)" size="xl" /><p>Sélectionnez une intervention pour suivre son avancement, poste par poste.</p></div></div>;
  const { o } = x;
  const t = intervention(o.type);
  return <div ref={scroll} className="insp-scroll">
    <div className="insp-head">
      <Lead o={o} size={44} tile="l" />
      <div className="insp-title"><h2>{objetIntervention(o)}</h2><span><EtatPill type={o.type} etat={x.etat} /></span></div>
      <div className="insp-actions"><Link className="icon-btn" to={BASE} aria-label="Fermer le détail" data-tip="Fermer (Échap)"><Icon name="close" size={18} /></Link></div>
    </div>
    <ul className="facts">
      <li><span><Icon name={t.icon} size={18} />Intervention</span><b>{t.label}</b></li>
      <li><span><Icon name={x.cible.kind === 'poste' ? 'desktop' : 'pin'} size={18} />{CIBLE_LIBELLE[x.cible.kind]}</span><b>{x.cible.label}</b></li>
      <li><span><Icon name="user" size={18} />Demandée par</span><b>{o.par}</b></li>
      <li><span><Icon name="clock" size={18} />Demandée</span><b>{dateShort(o.at)}</b></li>
    </ul>
    <section className="insp-block">
      <h3 className="insp-section-title"><Icon name="clock" size={18} />Suivi</h3>
      <Timeline x={x} />
    </section>
    <section className="insp-block" aria-label="Postes">
      <h3 className="insp-section-title"><Icon name="desktop" size={18} />{x.n.total > 1 ? `Postes de ${x.cible.salle?.nom ?? 'la salle'}` : 'Poste'}</h3>
      {x.n.total > 1 && avancement(x)}
      <ul className="rows rows--flat">{x.postes.map(({ id, poste, etat }) => <li key={id}>
        <div className="row">
          <Tile name="desktop" color="var(--c1)" size="m" />
          <span className="row-main"><span className="row-title">{poste?.nomReseau ?? 'Poste retiré'}</span><span className="row-sub">{poste && <PosteEtat p={poste} />}</span></span>
          <EtatPill type={o.type} etat={etat} />
        </div>
      </li>)}</ul>
    </section>
  </div>;
}

export function Interventions({ id }) {
  useStore();
  const [query, setQuery] = useState('');
  const listScroll = usePeek('.rm-panel');
  const all = interventions();
  const matches = matcher(query);
  const list = all.filter((x) => matches(titreIntervention(x.o), x.cible.salle?.nom, x.postes.map((p) => p.poste?.nomReseau).join(' '), x.o.par));
  return <>
    <PageHead title="Suivi des interventions" />
    <div className={`rm-layout ${id ? 'has-selection' : ''}`}>
      <section className="rm-panel glass" aria-label="Interventions">
        <div className="rm-toolbar">
          <label className="field field--search field--compact"><Icon name="recherche" size={20} /><input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Application, salle, poste, auteur…" aria-label="Filtrer les interventions" /></label>
          <span className="rm-count" aria-live="polite">{num(list.length)}</span>
        </div>
        <div ref={listScroll} className="rm-scroll">
          {list.length
            ? <ul className="rm-list">{list.map((x) => <Row key={x.o.id} x={x} selected={x.o.id === id} />)}</ul>
            : <div className="w-empty w-empty--l"><Icon name={query ? 'recherche' : 'download'} size={32} />
              <span>{query ? 'Aucune intervention ne correspond à cette recherche.' : 'Aucune intervention demandée. Installez ou désinstallez une application depuis Applications, réinitialisez des postes depuis Postes.'}</span></div>}
        </div>
      </section>
      <aside className="rm-detail glass" aria-live="polite"><Detail x={all.find((x) => x.o.id === id)} /></aside>
    </div>
  </>;
}
