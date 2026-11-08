// PDF autonome, sans dépendance ni accès à une infrastructure documentaire.
export function reportPdf(report, state) {
  const clean = (s) => String(s ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7e]/g, ' ').replace(/[\\()]/g, '\\$&');
  const lines = ['ASTER - Etat des lieux', report.id, `Declare par : ${report.auteur}`, `Date : ${new Date(report.createdAt).toLocaleDateString('fr-FR')}`, `Probleme : ${report.probleme}`, '', ...report.description.match(/.{1,88}(?:\s|$)|.{1,88}/g) || [], '', 'Materiels concernes :'];
  for (const id of report.materielIds) {
    const m = state.materiels.find((x) => x.id === id);
    const room = state.salles.find((x) => x.id === m?.salleId);
    lines.push(`${m?.idAster || id} - ${m?.modele || 'Materiel supprime'}`, `Localisation : ${room ? `${room.batiment} / ${room.nom}` : 'Stock'}`);
  }
  const pages = [];
  for (let i = 0; i < lines.length; i += 48) pages.push(lines.slice(i, i + 48));
  const objects = ['', '', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
  const kids = [];
  for (const page of pages) {
    const number = objects.length + 1;
    kids.push(`${number} 0 R`);
    const stream = `BT /F1 11 Tf 48 790 Td 15 TL ${page.map((l, i) => `${i ? 'T* ' : ''}(${clean(l)}) Tj`).join('\n')} ET`;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${number + 1} 0 R >>`, `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`);
  }
  objects[0] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[1] = `<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${pages.length} >>`;
  let content = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((obj, i) => { offsets.push(Buffer.byteLength(content)); content += `${i + 1} 0 obj\n${obj}\nendobj\n`; });
  const xref = Buffer.byteLength(content);
  content += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((n) => `${String(n).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(content);
}
