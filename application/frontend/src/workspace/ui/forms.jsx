/* ==========================================================================
   Formulaires des sheets : Entrée ou le bouton du pied soumettent.
   onSave(FormData) enregistre ; une erreur levée s'affiche sous les champs,
   sinon le sheet se ferme.
   ========================================================================== */

import { useRef, useState } from 'react';
import { Icon } from './icons.jsx';
import { useSheetClose } from './overlays.jsx';

export function SheetForm({ id, onSave, children, ...props }) {
  const close = useSheetClose();
  const [error, setError] = useState('');
  const busy = useRef(false);

  async function submit(e) {
    e.preventDefault();
    if (busy.current) return;
    const button = e.nativeEvent.submitter;
    busy.current = true;
    if (button) button.disabled = true;
    setError('');
    try {
      await onSave(new FormData(e.currentTarget));
      close(true);
    } catch (err) {
      setError(err.message);
    } finally {
      busy.current = false;
      if (button) button.disabled = false;
    }
  }

  return <form id={id} className="form" onSubmit={submit} {...props}>
    {children}
    <p className="form-error" role="alert" hidden={!error}>{error}</p>
  </form>;
}

/** Pied d'un sheet de formulaire : Annuler et le bouton de soumission. */
export function SheetFormActions({ form, label = 'Enregistrer', icon = null }) {
  return <>
    <button className="btn btn--ghost" type="button" data-sheet-close="">Annuler</button>
    <button className="btn btn--primary" type="submit" form={form}>{icon && <Icon name={icon} size={18} />}<span>{label}</span></button>
  </>;
}
