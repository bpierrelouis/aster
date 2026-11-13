/* Code inconnu : signalement rapide d'un matériel absent de la campagne, à traiter dans ORION.
   Dans l'inventaire d'un lieu, ce lieu est utilisé ; sinon le lieu est demandé. */
import { useNavigate, useSearchParams } from 'react-router';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { annoncer, constater } from '../core/etat.ts';
import { useRecon } from '../hooks/use-recon.ts';
import { lieuDe, nomLieu, parametreDe } from '../core/vue.ts';
import { Ecran } from '../ui/parts.tsx';
import { DEVICE_TYPES } from '#shared/catalog.ts';
import { monthYear } from '#shared/format.ts';
import type { DeviceTypeId } from '#shared/types.ts';

export function Inconnu() {
  const { vue } = useRecon();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const code = params.get('code') ?? '';
  const contexte = lieuDe(params.get('lieu'));
  const [lieu, setLieu] = useState(params.get('lieu') ?? '');
  const [type, setType] = useState<DeviceTypeId>('uc');
  const [modele, setModele] = useState('');
  const [marque, setMarque] = useState(params.get('marque') ?? '');
  const [serie, setSerie] = useState(params.get('serie') ?? (code.length <= 40 && !code.includes(':') ? code : ''));
  const garantieFin = Number(params.get('garantie')) || undefined;

  async function signaler(e: FormEvent) {
    e.preventDefault();
    const salleId = lieuDe(lieu) ?? null;
    await constater({ type: 'inconnu', code: code || serie.trim(), salleId, materielId: null, saisie: { type, modele: modele.trim(), marque: marque.trim() || null, serie: serie.trim() || null, ...(garantieFin && { garantieFin }) } });
    annoncer(`Matériel signalé en ${nomLieu(vue, salleId)} · à ajouter dans ORION`, 'accent');
    navigate(contexte === undefined ? '/' : `/scanner?lieu=${encodeURIComponent(parametreDe(contexte))}`, { replace: true, state: { ignorer: code } });
  }

  return <Ecran titre="Matériel inconnu">
    {code && <p className="carte code-lu"><span className="surtitre">Code lu</span><code>{code}</code>
      {garantieFin && <span className="discret">Fin de garantie : {monthYear(garantieFin)}</span>}</p>}
    <form className="carte formulaire" onSubmit={(e) => void signaler(e)}>
      {contexte === undefined
        ? <label className="champ"><span>Lieu</span>
          <select required value={lieu} onChange={(e) => setLieu(e.target.value)}>
            <option value="" disabled>Choisir le lieu</option>
            <option value="stock">Stock</option>
            {vue.salles.map((s) => <option key={s.id} value={s.id}>{s.nom} · bâtiment {s.batiment}</option>)}
          </select>
        </label>
        : <p className="discret">Lieu : <strong>{nomLieu(vue, contexte)}</strong></p>}
      <label className="champ"><span>Type</span>
        <select value={type} onChange={(e) => setType(e.target.value as DeviceTypeId)}>
          {DEVICE_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </label>
      <label className="champ"><span>Modèle</span><input required maxLength={250} value={modele} onChange={(e) => setModele(e.target.value)} autoComplete="off" /></label>
      <label className="champ"><span>Marque <small>facultatif</small></span><input maxLength={120} value={marque} onChange={(e) => setMarque(e.target.value)} autoComplete="off" /></label>
      <label className="champ"><span>Numéro de série <small>facultatif</small></span><input maxLength={120} value={serie} onChange={(e) => setSerie(e.target.value)} autoComplete="off" autoCapitalize="characters" spellCheck={false} /></label>
      <button className="bouton bouton--principal" type="submit">Signaler le matériel</button>
    </form>
  </Ecran>;
}
