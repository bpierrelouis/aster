/* ==========================================================================
   Mode interface seule (npm run dev:ui) : changer d'utilisateur depuis le
   menu du compte, pour passer d'un profil à l'autre. Le serveur de ce mode
   expose /api/dev ; le menu ne l'affiche que si import.meta.env.MODE vaut
   « ui », ce composant est donc absent du build de production.
   ========================================================================== */

import { FilterSelect } from '../../ui/filter-select.tsx';
import { useEffect, useState } from 'react';
import { notify } from '../../ui/overlays.tsx';
import { role as roleOf } from '#shared/catalog.ts';
import type { Compte, Id } from '#shared/types.ts';

/** Comptes actifs et compte courant, fournis par le serveur de ce mode (/api/dev/comptes) */
type ComptesDev = { courant: Id; comptes: (Pick<Compte, 'id' | 'nom' | 'role'> & { ecole: string | null })[] };

export function UserSwitch() {
  const [data, setData] = useState<ComptesDev | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/dev/comptes', { signal: controller.signal }).then((r) => (r.ok ? r.json() : null)).then(setData).catch(() => {});
    return () => controller.abort();
  }, []);
  if (!data) return null;

  async function change(id: Id) {
    const response = await fetch('/api/dev/compte', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    if (response.ok) location.assign('/accueil'); // l'écran courant peut être interdit au nouveau profil
    else notify('Changement d’utilisateur impossible', { tone: 'warn', icon: 'alertes' });
  }

  return <div className="pop-group">
    <span className="pop-note">Changer d’utilisateur</span>
    <FilterSelect aria-label="Changer d’utilisateur" value={data.courant} onChange={(e) => change(e.target.value)}
      options={data.comptes.map((c) => ({ value: c.id, label: `${c.nom} · ${roleOf(c.role).label}`, group: c.ecole ?? 'Toutes les écoles' }))} />
  </div>;
}
