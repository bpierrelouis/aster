#!/usr/bin/env python3
"""Versions et archives de la documentation ORION.

Le registre archive/registre.json fait foi. Il produit :
- archive/README.md, compte rendu global des évolutions de chaque fichier ;
- l'en-tête de version des fichiers Markdown suivis (entre les marqueurs
  <!-- version:debut --> et <!-- version:fin -->, à ne pas modifier à la main).

Commandes (depuis la racine du dépôt) :
  python3 .agents/skills/orion-documentation/scripts/versions.py publier <fichier> --majeure|--mineure -m "Modification"
      Après avoir modifié le fichier, avant le commit : archive la version
      précédente telle qu'elle est dans le dernier commit (HEAD), enregistre
      la nouvelle version et régénère les en-têtes et le compte rendu.
  python3 .agents/skills/orion-documentation/scripts/versions.py retirer <fichier> -m "Motif"
      Déplace un fichier remplacé ou abandonné dans les archives.
  python3 .agents/skills/orion-documentation/scripts/versions.py rendre
      Régénère les en-têtes et le compte rendu à partir du registre.

Version majeure : changement de sens (décision, règle, périmètre, structure).
Version mineure : correction ou précision sans changement de sens.
"""

import argparse
import datetime
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(subprocess.run(["git", "rev-parse", "--show-toplevel"], capture_output=True, text=True, check=True).stdout.strip())
ARCHIVE = ROOT / "archive"
REGISTRE = ARCHIVE / "registre.json"
DEBUT, FIN = "<!-- version:debut", "<!-- version:fin -->"
BLOC = re.compile(r"\n?<!-- version:debut.*?<!-- version:fin -->\n?", re.S)


def destination(chemin):
    """Destination du fichier, selon le classement du README."""
    nom = Path(chemin).name
    if chemin.startswith("docs/temporaire/"):
        return "Brouillon interne"
    if chemin.startswith("design/"):
        return "Ressource de préparation"
    if nom.startswith("01-"):
        return "Source fournie par l’encadrement"
    if nom.startswith(("02-", "03-")):
        return "Source de travail interne"
    return "Production destinée à la remise"


def dossier(chemin):
    """Dossier d'archive propre au fichier : nom sans extension, chemin aplati hors docs/."""
    p = Path(chemin)
    if chemin.startswith("docs/"):
        return p.stem
    return "-".join(p.with_suffix("").parts)


def ancre(chemin):
    return re.sub(r"[^a-z0-9-]", "", re.sub(r"[\s/._]+", "-", dossier(chemin).lower()))


def charger():
    return json.loads(REGISTRE.read_text(encoding="utf-8")) if REGISTRE.exists() else {}


def enregistrer(registre):
    ARCHIVE.mkdir(exist_ok=True)
    REGISTRE.write_text(json.dumps(dict(sorted(registre.items())), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def date_fr(iso):
    return datetime.date.fromisoformat(iso).strftime("%d/%m/%Y")


def cellule(texte):
    return texte.replace("|", "\\|").replace("\n", " ")


def entete(chemin, fiche):
    v = fiche["versions"][-1]
    relatif = Path(*[".."] * (len(Path(chemin).parts) - 1), "archive", "README.md").as_posix()
    return (
        f"{DEBUT} : généré par versions.py, ne pas modifier à la main -->\n"
        "| Version | Mise à jour | Destination | Dernière évolution | Historique |\n"
        "| --- | --- | --- | --- | --- |\n"
        f"| {v['version']} | {date_fr(v['date'])} | {fiche['destination']} | {cellule(v.get('resume') or v['modification'])} | "
        f"[{len(fiche['versions'])} version{'s' if len(fiche['versions']) > 1 else ''}]({relatif}#{ancre(chemin)}) |\n"
        f"{FIN}\n"
    )


def poser_entete(chemin, fiche):
    fichier = ROOT / chemin
    if fichier.suffix != ".md" or fiche.get("retire") or not fichier.exists():
        return
    texte = BLOC.sub("\n", fichier.read_text(encoding="utf-8"), count=1)
    lignes = texte.split("\n")
    titre = next((i for i, l in enumerate(lignes) if l.startswith("# ")), None)
    if titre is None:
        sys.exit(f"{chemin} : titre de niveau 1 absent, en-tête impossible.")
    # Le titre, une ligne vide, l'en-tête, une ligne vide, puis le contenu.
    reste = "\n".join(lignes[titre + 1:]).lstrip("\n")
    texte = "\n".join(lignes[: titre + 1]) + "\n\n" + entete(chemin, fiche) + "\n" + reste
    fichier.write_text(texte, encoding="utf-8")


def compte_rendu(registre):
    actifs = {c: f for c, f in registre.items() if not f.get("retire")}
    retires = {c: f for c, f in registre.items() if f.get("retire")}
    out = [
        "# Archives de la documentation ORION",
        "",
        "Compte rendu des évolutions de chaque fichier suivi : version, date et modification. "
        "La version en vigueur est le fichier lui-même ; chaque version remplacée est conservée dans le dossier du fichier. "
        "Ce document et les en-têtes de version sont générés à partir de [registre.json](registre.json) "
        "par [versions.py](../.agents/skills/orion-documentation/scripts/versions.py) ; ne pas les modifier à la main.",
        "",
        "Numérotation : version majeure pour un changement de sens (décision, règle, périmètre, structure), "
        "version mineure pour une correction ou une précision. L’historique antérieur au 13 novembre 2026 est reconstitué "
        "depuis Git, à raison d’une version par jour de modification.",
        "",
        "## Vue d’ensemble",
        "",
        "| Fichier | Destination | Version | Mise à jour |",
        "| --- | --- | --- | --- |",
    ]
    for c, f in actifs.items():
        v = f["versions"][-1]
        out.append(f"| [{c}](../{c}) | {f['destination']} | [{v['version']}](#{ancre(c)}) | {date_fr(v['date'])} |")
    for titre, groupe in (("Fichiers en vigueur", actifs), ("Fichiers retirés", retires)):
        if not groupe:
            continue
        out += ["", f"## {titre}"]
        for c, f in groupe.items():
            out += ["", f"### {dossier(c)}", ""]
            if f.get("retire"):
                out += [f"Ancien emplacement : `{c}`. {f['retire']}", ""]
            else:
                out += [f"Fichier : [{c}](../{c}) · {f['destination']}", ""]
            out += ["| Version | Date | Modification | Fichier |", "| --- | --- | --- | --- |"]
            for v in reversed(f["versions"]):
                lien = f"[archive]({v['archive']})" if v.get("archive") else "en vigueur"
                out.append(f"| {v['version']} | {date_fr(v['date'])} | {cellule(v['modification'])} | {lien} |")
    (ARCHIVE / "README.md").write_text("\n".join(out) + "\n", encoding="utf-8")


def rendre(registre):
    for chemin, fiche in registre.items():
        poser_entete(chemin, fiche)
    compte_rendu(registre)


def suivante(version, majeure):
    x, y = map(int, version.split("."))
    return f"{x + 1}.0" if majeure else f"{x}.{y + 1}"


def contenu_head(chemin):
    r = subprocess.run(["git", "show", f"HEAD:{chemin}"], cwd=ROOT, capture_output=True)
    return r.stdout if r.returncode == 0 else None


def archiver_version(chemin, fiche, contenu):
    v = fiche["versions"][-1]
    p = Path(chemin)
    nom = f"{dossier(chemin)}/{p.stem}-v{v['version']}-{v['date']}{p.suffix}"
    (ARCHIVE / nom).parent.mkdir(parents=True, exist_ok=True)
    (ARCHIVE / nom).write_bytes(contenu)
    v["archive"] = nom


def publier(chemin, majeure, message):
    registre = charger()
    aujourdhui = datetime.date.today().isoformat()
    if chemin not in registre:
        registre[chemin] = {"destination": destination(chemin), "versions": [{"version": "1.0", "date": aujourdhui, "modification": message, "archive": None}]}
    else:
        fiche = registre[chemin]
        precedent = contenu_head(chemin)
        if precedent is None:
            sys.exit(f"{chemin} : absent du dernier commit, version précédente introuvable.")
        if (ROOT / chemin).exists() and (ROOT / chemin).suffix == ".md":
            precedent = BLOC.sub("\n", precedent.decode("utf-8"), count=1).encode("utf-8")
        avant = fiche["versions"][-2] if len(fiche["versions"]) > 1 else None
        if avant and avant.get("archive") and (ARCHIVE / avant["archive"]).read_bytes() == precedent:
            # Fichier déjà publié depuis le dernier commit : même version, modification complétée.
            fiche["versions"][-1]["modification"] += f" ; {message}"
            enregistrer(registre)
            rendre(registre)
            print(f"{chemin} : version {fiche['versions'][-1]['version']} complétée")
            return
        archiver_version(chemin, fiche, precedent)
        fiche["versions"].append({"version": suivante(fiche["versions"][-1]["version"], majeure), "date": aujourdhui, "modification": message, "archive": None})
    enregistrer(registre)
    rendre(registre)
    print(f"{chemin} : version {registre[chemin]['versions'][-1]['version']}")


def retirer(chemin, message):
    registre = charger()
    fiche = registre.setdefault(chemin, {"destination": destination(chemin), "versions": [{"version": "1.0", "date": datetime.date.today().isoformat(), "modification": "Version unique", "archive": None}]})
    fichier = ROOT / chemin
    archiver_version(chemin, fiche, BLOC.sub("\n", fichier.read_text(encoding="utf-8"), count=1).encode("utf-8") if fichier.suffix == ".md" else fichier.read_bytes())
    fiche["retire"] = f"Retiré le {date_fr(datetime.date.today().isoformat())} : {message}"
    fichier.unlink()
    enregistrer(registre)
    rendre(registre)
    print(f"{chemin} : archivé dans archive/{fiche['versions'][-1]['archive']}")


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="commande", required=True)
    p = sub.add_parser("publier")
    p.add_argument("fichier")
    g = p.add_mutually_exclusive_group(required=True)
    g.add_argument("--majeure", action="store_true")
    g.add_argument("--mineure", action="store_true")
    p.add_argument("-m", "--message", required=True)
    r = sub.add_parser("retirer")
    r.add_argument("fichier")
    r.add_argument("-m", "--message", required=True)
    sub.add_parser("rendre")
    args = parser.parse_args()
    if args.commande == "publier":
        publier(Path(args.fichier).as_posix(), args.majeure, args.message)
    elif args.commande == "retirer":
        retirer(Path(args.fichier).as_posix(), args.message)
    else:
        rendre(charger())


if __name__ == "__main__":
    main()
