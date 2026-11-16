/* ==========================================================================
   Pagination des tableaux : 25 lignes par page ; retour à la première page
   quand les filtres (clé reset) changent. Pied affiché par <Pagination>.
   ========================================================================== */

import { useState } from 'react';

const PAGE_SIZE = 25;

/** Lignes de la page courante (bornée au nombre de pages) et propriétés du pied <Pagination> */
export function usePagination<T>(list: readonly T[], reset = '') {
  const [page, setPage] = useState(1);
  const [key, setKey] = useState(reset);
  if (key !== reset) { setKey(reset); setPage(1); }
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const current = Math.min(Math.max(1, page), pages);
  return { rows: list.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE), pager: { current, pages, onPage: setPage } };
}
