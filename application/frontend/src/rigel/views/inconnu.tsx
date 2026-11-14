/* Code inconnu du parc : avertissement, confirmation, puis saisie (à la main, ou en partie par lecture du numéro de
   série). À la synchronisation, ORION ajoute le matériel au parc, affecté au lieu, installation confirmée.
   Dans l'inventaire d'un lieu, ce lieu est utilisé ; sinon le lieu est demandé. */
import { useNavigate, useSearchParams } from 'react-router';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { annoncer, constater } from '../core/etat.ts';
import { useRigel } from '../hooks/use-rigel.ts';
import { lieuDe, nomLieu, parametreDe } from '../core/vue.ts';
import { Ecran } from '../ui/parts.tsx';
import { DEVICE_TYPES } from '#shared/catalog.ts';
import { monthYear } from '#shared/format.ts';
import type { DeviceTypeId } from '#shared/types.ts';

export function Inconnu() {
  const { vue } = useRigel();
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
  const [confirme, setConfirme] = useState(false);
  const retour = () => navigate(contexte === undefined ? '/' : `/scanner?lieu=${encodeURIComponent(parametreDe(contexte))}`, { replace: true, state: { ignorer: code } });

  async function ajouter(e: FormEvent) {
    e.preventDefault();
    const salleId = lieuDe(lieu) ?? null;
    await constater({ type: 'inconnu', code: code || serie.trim(), salleId, materielId: null, saisie: { type, modele: modele.trim(), marque: marque.trim() || null, serie: serie.trim() || null, ...(garantieFin && { garantieFin }) } });
    annoncer(`Ajouté au parc · ${nomLieu(vue, salleId)}`, 'accent');
    retour();
  }

  return <Ecran titre="Matériel inconnu">
    {code && <p className="carte code-lu"><span className="surtitre">Code lu</span><code>{code}</code>
      {garantieFin && <span className="discret">Fin de garantie : {monthYear(garantieFin)}</span>}</p>}
    {!confirme ? <>
      <p className="avertissement" role="alert">Matériel inconnu du système : il ne provient probablement pas du stock. Voulez-vous vraiment l’installer ici ?</p>
      <div className="pile">
        <button className="bouton bouton--principal" type="button" onClick={() => setConfirme(true)}>Installer ici</button>
        <button className="bouton" type="button" onClick={retour}>Annuler</button>
      </div>
    </> : <form className="carte formulaire" onSubmit={(e) => void ajouter(e)}>
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
      <button className="bouton bouton--principal" type="submit">Ajouter au parc</button>
    </form>}
  </Ecran>;
}
