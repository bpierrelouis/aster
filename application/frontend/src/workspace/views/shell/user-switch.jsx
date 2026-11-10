/* ==========================================================================
   Mode interface seule (npm run dev:ui) : changer d'utilisateur depuis le
   menu du compte, pour passer d'un profil à l'autre. Le serveur de ce mode
   expose /api/dev ; le menu ne l'affiche que si import.meta.env.MODE vaut
   « ui », ce composant est donc absent du build de production.
   ========================================================================== */

import { useEffect, useState } from 'react';
import { notify } from '../../ui/overlays.jsx';
import { role as roleOf } from '#shared/catalog.js';

export function UserSwitch() {
  const [data, setData] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/dev/comptes', { signal: controller.signal }).then((r) => (r.ok ? r.json() : null)).then(setData).catch(() => {});
    return () => controller.abort();
  }, []);
  if (!data) return null;

  async function change(id) {
    const response = await fetch('/api/dev/compte', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    if (response.ok) location.assign('/accueil'); // l'écran courant peut être interdit au nouveau profil
    else notify('Changement d’utilisateur impossible', { tone: 'warn', icon: 'alertes' });
  }

  const ecoles = [...new Set(data.comptes.map((c) => c.ecole ?? 'Toutes les écoles'))];
  return <label className="pop-group">
    <span className="pop-note">Changer d’utilisateur</span>
    <select value={data.courant} onChange={(e) => change(e.target.value)}>
      {ecoles.map((e) => <optgroup key={e} label={e}>
        {data.comptes.filter((c) => (c.ecole ?? 'Toutes les écoles') === e).map((c) => <option key={c.id} value={c.id}>{c.nom} · {roleOf(c.role).label}</option>)}
      </optgroup>)}
    </select>
  </label>;
}
