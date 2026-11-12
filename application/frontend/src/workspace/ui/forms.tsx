/* ==========================================================================
   Formulaires des sheets : Entrée ou le bouton du pied soumettent.
   onSave(FormData) enregistre ; une erreur levée s'affiche sous les champs,
   sinon le sheet se ferme. Interrupteur (Switch) commun aux formulaires.
   ========================================================================== */

import { useRef, useState } from 'react';
import type { ComponentProps, SubmitEvent } from 'react';
import { Icon } from './icons.tsx';
import { useSheetClose } from './overlays.tsx';
import type { ButtonTone } from './overlays.tsx';

export type SheetFormProps = Omit<ComponentProps<'form'>, 'id' | 'onSubmit'> & {
  id: string;
  /** Enregistre les champs (synchrone ou async, résultat ignoré) ; une erreur levée s'affiche sous les champs */
  onSave: (data: FormData) => unknown;
};

export function SheetForm({ id, onSave, children, ...props }: SheetFormProps) {
  const close = useSheetClose();
  const [error, setError] = useState('');
  const busy = useRef(false);

  async function submit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy.current) return;
    const button = e.nativeEvent.submitter as HTMLButtonElement | null;
    busy.current = true;
    if (button) button.disabled = true;
    setError('');
    try {
      await onSave(new FormData(e.currentTarget));
      close(true);
    } catch (err) {
      setError((err as Error).message);
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

/** Interrupteur : bouton glissant (role switch), libellé pour les lecteurs d'écran, raison d'un refus en infobulle */
export function Switch({ on, onChange, label, disabled = false, tip }: { on: boolean; onChange: (on: boolean) => void; label: string; disabled?: boolean; tip?: string }) {
  return <button type="button" role="switch" className="switch" aria-checked={on} aria-label={label} disabled={disabled} data-tip={tip}
    onClick={() => onChange(!on)}><span className="switch-knob" /></button>;
}

/** Pied d'un sheet de formulaire : Annuler et le bouton de soumission (tone : primary, ou danger pour une action destructrice). */
export function SheetFormActions({ form, label = 'Enregistrer', icon = null, tone = 'primary' }: { form: string; label?: string; icon?: string | null; tone?: ButtonTone }) {
  return <>
    <button className="btn btn--ghost" type="button" data-sheet-close="">Annuler</button>
    <button className={`btn btn--${tone}`} type="submit" form={form}>{icon && <Icon name={icon} size={18} />}<span>{label}</span></button>
  </>;
}
