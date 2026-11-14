#!/usr/bin/env python3
"""Versions et archives de la documentation ORION.

Le registre archive/registre.json fait foi. Il produit :
- archive/README.md, compte rendu global des évolutions de chaque fichier ;
- l'en-tête de version des fichiers Markdown suivis (entre les marqueurs
  <!-- version:debut --> et <!-- version:fin -->, à ne pas modifier à la main).

Commandes (depuis la racine du dépôt) :
  python3 .agents/skills/orion-documentation/scripts/versions.py publier <fichier> --majeure|--mineure -m "Modification"
      Après avoir modifié le fichier, avant le commit : référence la version
      précédente par son dernier commit (copie conservée seulement pour design/),
      enregistre la nouvelle version et régénère les en-têtes et le compte rendu.
  python3 .agents/skills/orion-documentation/scripts/versions.py retirer <fichier> -m "Motif"
      Supprime un fichier remplacé ou abandonné ; sa dernière version reste
      référencée par son commit (copie conservée seulement pour design/).
  python3 .agents/skills/orion-documentation/scripts/versions.py renommer <ancien> <nouveau> --majeure|--mineure -m "Modification"
      Déplace un fichier suivi (git mv) en conservant son historique : la
      version en vigueur est référencée par son dernier commit à l'ancien chemin.
  python3 .agents/skills/orion-documentation/scripts/versions.py rendre
      Régénère les en-têtes et le compte rendu à partir du registre.

Version majeure : changement de sens (décision, règle, périmètre, structure).
Version mineure : correction ou précision sans changement de sens.
"""

import argparse
import datetime
import json
import re
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
    if "BROUILLON" in nom:
        return "Brouillon interne"
    if chemin.startswith("design/"):
        return "Ressource de préparation"
    if nom.startswith("01-"):
        return "Source fournie par l’encadrement"
    if nom.startswith(("02-", "03-")):
        return "Source de travail interne"
    if "BACKLOG-TECHNIQUE" in nom:
        return "Pilotage interne"
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
    if fichier.suffix != ".md" or fiche.get("retire") or fiche.get("sans_entete") or not fichier.exists():
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
        "La version en vigueur est le fichier lui-même ; chaque version remplacée est retrouvée dans l’historique Git par son commit "
        "(`git show <commit>:<chemin>`). Seules les versions de `design/`, qui font partie de la capture du besoin, sont copiées, dans [design/](design/index.html) : "
        "chartes, maquettes et présentation du dossier, avec leurs logos et icônes d’époque. "
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
            out += ["| Version | Date | Modification | Commit | Copie |", "| --- | --- | --- | --- | --- |"]
            for v in reversed(f["versions"]):
                commit = f"`{v['commit']}`" + (f" (`{v['chemin']}`)" if v.get("chemin") else "") if v.get("commit") else "en vigueur"
                lien = f"[archive]({v['archive']})" if v.get("archive") else "—"
                out.append(f"| {v['version']} | {date_fr(v['date'])} | {cellule(v['modification'])} | {commit} | {lien} |")
    (ARCHIVE / "README.md").write_text("\n".join(out) + "\n", encoding="utf-8")


# --- Archives du design ------------------------------------------------------
# Les anciennes versions de design/ sont copiées dans archive/design/, classées
# par nature (chartes, maquettes, readme). Les ressources qu'elles chargent
# (logos, icônes, favicon…) sont copiées depuis le même commit dans
# archive/design/ressources/<date>/, une seule fois par contenu, et leurs liens
# sont réécrits : chaque version archivée s'ouvre telle qu'elle était.
DESIGN = ARCHIVE / "design"
RESSOURCES = DESIGN / "ressources"
REF = re.compile(r"""(?<=["'(])(?!https?:|data:|mailto:|#|/)([^"'()\s<>]+?\.(?:svg|png|gif|jpe?g|webp|woff2?|ttf|css|js|html|md))(?=[#?"')])""")
CATEGORIES = {"chartes": "Chartes graphiques", "maquettes": "Maquettes", "readme": "Présentation du dossier design"}


def categorie(chemin):
    p = Path(chemin)
    if p.name == "README.md":
        return "readme"
    return "chartes" if "charte" in chemin else "maquettes"


def nom_design(chemin, version, date):
    p = Path(chemin)
    base = p.parent.name if p.stem == "index" else p.stem
    return f"design/{categorie(chemin)}/{base}-v{version}-{date}{p.suffix}"


def blob(commit, chemin):
    r = subprocess.run(["git", "show", f"{commit}:{chemin}"], cwd=ROOT, capture_output=True)
    return r.stdout if r.returncode == 0 else None


def date_commit(commit):
    return subprocess.run(["git", "show", "-s", "--format=%cs", commit], cwd=ROOT, capture_output=True, text=True, check=True).stdout.strip()


def ressource(relatif, contenu, date):
    """Copie une ressource une seule fois par contenu ; renvoie son chemin."""
    if RESSOURCES.exists():
        for existant in sorted(RESSOURCES.glob(f"*/{relatif}")):
            if existant.read_bytes() == contenu:
                return existant
    cible = RESSOURCES / date / relatif
    cible.parent.mkdir(parents=True, exist_ok=True)
    cible.write_bytes(contenu)
    return cible


def relatif_a(cible, depuis):
    import os
    return Path(os.path.relpath(cible, depuis.parent)).as_posix()


def copier_design(origine, commit, nom):
    """Copie origine (au commit donné) dans archive/<nom> avec ses ressources, liens réécrits."""
    import posixpath
    destination_fichier = ARCHIVE / nom
    texte = blob(commit, origine).decode("utf-8")
    remplacements = {}
    for ref in set(REF.findall(texte)):
        resolu = posixpath.normpath(posixpath.join(posixpath.dirname(origine), ref))
        if resolu.startswith(".."):
            continue
        actuel = ROOT / resolu
        if resolu.endswith((".html", ".md")) or resolu.startswith(("design/maquettes/captures/", "application/")):
            # Pages et captures : version en vigueur, sinon dernière version archivée à cette date.
            if actuel.exists():
                remplacements[ref] = relatif_a(actuel, destination_fichier)
            else:
                fiche = charger().get(resolu)
                date = date_commit(commit)
                copies = [v for v in (fiche or {}).get("versions", []) if v.get("commit") and v["date"] <= date] if fiche else []
                if copies:
                    remplacements[ref] = relatif_a(ARCHIVE / nom_design(resolu, copies[-1]["version"], copies[-1]["date"]), destination_fichier)
            continue
        contenu = blob(commit, resolu)
        if contenu is None:
            # Ressource déplacée depuis : même chemin relatif sous les dossiers de ressources de l'époque.
            for racine in ("design/assets", "da"):
                contenu = blob(commit, f"{racine}/{ref}")
                if contenu is not None:
                    resolu = f"{racine}/{ref}"
                    break
        if contenu is not None:
            rel = re.sub(r"^(design/assets/|da/|design/)", "", resolu)
            remplacements[ref] = relatif_a(ressource(rel, contenu, date_commit(commit)), destination_fichier)
    for ref, nouveau in remplacements.items():
        texte = re.sub(r"(?<=[\"'(])" + re.escape(ref) + r"(?=[#?\"')])", nouveau, texte)
    destination_fichier.parent.mkdir(parents=True, exist_ok=True)
    destination_fichier.write_text(texte, encoding="utf-8")


def galerie(registre):
    """Page d'accès aux anciennes versions du design : archive/design/index.html."""
    from html import escape
    groupes = {c: [] for c in CATEGORIES}
    for chemin, fiche in registre.items():
        if not chemin.startswith("design/"):
            continue
        copies = [v for v in fiche["versions"] if v.get("archive")]
        if copies:
            groupes[categorie(chemin)].append((chemin, fiche, copies))
    sections = []
    for cle, titre in CATEGORIES.items():
        cartes = []
        for chemin, fiche, copies in sorted(groupes[cle], key=lambda g: g[2][-1]["date"], reverse=True):
            statut = "Retiré" if fiche.get("retire") else "En vigueur : " + f'<a href="../../{escape(chemin)}">{escape(chemin)}</a>'
            lignes = "".join(
                f'<li><a href="{escape(Path(v["archive"]).relative_to("design").as_posix())}"><b>v{escape(v["version"])}</b> · {date_fr(v["date"])}</a>'
                f'<span>{escape(v.get("resume") or v["modification"])}</span></li>'
                for v in reversed(copies)
            )
            nom = (Path(chemin).parent.name if Path(chemin).stem == "index" else Path(chemin).stem).replace("-", " ")
            cartes.append(f'<article><h3>{escape(nom[:1].upper() + nom[1:])}</h3>'
                          f'<p class="statut">{statut}</p><ul>{lignes}</ul></article>')
        if cartes:
            sections.append(f'<section><h2>{titre}</h2><div class="grille">{"".join(cartes)}</div></section>')
    logos = sorted(RESSOURCES.glob("*/logos/*.svg")) + sorted(RESSOURCES.glob("*/favicon.svg")) if RESSOURCES.exists() else []
    vignettes = "".join(
        f'<figure{" class=\"sombre\"" if "inverse" in l.name else ""}><img src="{escape(l.relative_to(DESIGN).as_posix())}" alt=""><figcaption>{escape(l.name)}<br>{escape(l.parent.parent.name if l.parent.name == "logos" else l.parent.name)}</figcaption></figure>'
        for l in logos)
    page = f"""<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Anciens designs ORION</title>
<style>
:root {{ --fond:#f6f7f9; --carte:#fff; --texte:#17243b; --doux:#5b6475; --trait:#e3e6eb; --accent:#2563eb; }}
@media (prefers-color-scheme: dark) {{ :root {{ --fond:#0b1220; --carte:#131c2e; --texte:#e6eaf2; --doux:#9aa4b5; --trait:#243048; --accent:#60a5fa; }} }}
* {{ box-sizing:border-box; }}
body {{ margin:0; background:var(--fond); color:var(--texte); font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif; }}
main {{ max-width:1100px; margin:0 auto; padding:40px 16px 64px; }}
h1 {{ font-size:28px; margin:0 0 8px; }} h2 {{ font-size:19px; margin:40px 0 14px; }} h3 {{ font-size:16px; margin:0 0 4px; }}
p.intro {{ color:var(--doux); max-width:760px; margin:0; }}
a {{ color:var(--accent); text-decoration:none; }} a:hover {{ text-decoration:underline; }}
.grille {{ display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:14px; }}
article {{ background:var(--carte); border:1px solid var(--trait); border-radius:12px; padding:16px 18px; }}
.statut {{ color:var(--doux); font-size:13px; margin:0 0 10px; overflow-wrap:anywhere; }}
ul {{ list-style:none; margin:0; padding:0; }} li {{ padding:7px 0; border-top:1px solid var(--trait); display:flex; flex-direction:column; gap:2px; }}
li span {{ color:var(--doux); font-size:13px; }}
.logos {{ display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:12px; }}
figure {{ margin:0; background:#fff; border:1px solid var(--trait); border-radius:12px; padding:14px; text-align:center; }}
figure img {{ max-width:100%; height:56px; object-fit:contain; background:repeating-conic-gradient(#eef0f3 0 25%,#fff 0 50%) 0 0/12px 12px; border-radius:6px; }}
figure.sombre {{ background:#17243b; }} figure.sombre img {{ background:none; }} figure.sombre figcaption {{ color:#c9d1de; }}
figcaption {{ color:#5b6475; font-size:12px; margin-top:6px; overflow-wrap:anywhere; }}
</style>
</head>
<body>
<main>
<h1>Anciens designs ORION</h1>
<p class="intro">Versions remplacées des chartes graphiques, maquettes et présentation du dossier design, conservées parce qu’elles font partie de la conception et de la capture du besoin. Chaque version s’ouvre telle qu’elle était, avec ses logos et icônes d’époque (dossier <code>ressources/</code>, classé par date). Le design en vigueur est dans <a href="../../design/README.md">design/</a> ; l’historique de tous les documents est dans le <a href="../README.md">compte rendu des archives</a>. Page générée par versions.py, ne pas modifier à la main.</p>
{"".join(sections)}
<section><h2>Logos d’époque</h2><div class="logos">{vignettes}</div></section>
</main>
</body>
</html>
"""
    DESIGN.mkdir(parents=True, exist_ok=True)
    (DESIGN / "index.html").write_text(page, encoding="utf-8")


def rendre(registre):
    for chemin, fiche in registre.items():
        poser_entete(chemin, fiche)
    compte_rendu(registre)
    galerie(registre)


def suivante(version, majeure):
    x, y = map(int, version.split("."))
    return f"{x + 1}.0" if majeure else f"{x}.{y + 1}"


def dernier_commit(chemin):
    """Dernier commit qui contient la version en vigueur du fichier."""
    r = subprocess.run(["git", "log", "-1", "--format=%h", "--abbrev=7", "--", chemin], cwd=ROOT, capture_output=True, text=True)
    return r.stdout.strip() or None


def archiver_version(chemin, fiche):
    """Référence la version en vigueur par son commit ; copie seulement les fichiers de design/."""
    v = fiche["versions"][-1]
    commit = dernier_commit(chemin)
    if commit is None:
        sys.exit(f"{chemin} : absent de l'historique Git, version précédente introuvable.")
    v["commit"] = commit
    if chemin.startswith("design/"):
        nom = nom_design(chemin, v["version"], v["date"])
        copier_design(chemin, commit, nom)
        v["archive"] = nom


def publier(chemin, majeure, message):
    registre = charger()
    aujourdhui = datetime.date.today().isoformat()
    if chemin not in registre:
        registre[chemin] = {"destination": destination(chemin), "versions": [{"version": "1.0", "date": aujourdhui, "modification": message, "archive": None}]}
    else:
        fiche = registre[chemin]
        fiche["destination"] = destination(chemin)  # recalculée à chaque publication, selon le classement du README
        avant = fiche["versions"][-2] if len(fiche["versions"]) > 1 else None
        # Déjà publié depuis le dernier commit (ou renommé sans commit depuis) : même version, modification complétée.
        if avant and (avant.get("commit") == dernier_commit(chemin) or dernier_commit(chemin) is None):
            # Fichier déjà publié depuis le dernier commit : même version, modification complétée.
            fiche["versions"][-1]["modification"] += f" ; {message}"
            enregistrer(registre)
            rendre(registre)
            print(f"{chemin} : version {fiche['versions'][-1]['version']} complétée")
            return
        archiver_version(chemin, fiche)
        fiche["versions"].append({"version": suivante(fiche["versions"][-1]["version"], majeure), "date": aujourdhui, "modification": message, "archive": None})
    enregistrer(registre)
    rendre(registre)
    print(f"{chemin} : version {registre[chemin]['versions'][-1]['version']}")


def renommer(ancien, nouveau, majeure, message):
    registre = charger()
    if ancien not in registre or nouveau in registre:
        sys.exit(f"{ancien} : absent du registre, ou {nouveau} déjà suivi.")
    fiche = registre.pop(ancien)
    for v in fiche["versions"]:
        if v.get("commit") and not v.get("chemin"):
            v["chemin"] = ancien
    v = fiche["versions"][-1]
    v["commit"], v["chemin"] = dernier_commit(ancien), ancien
    subprocess.run(["git", "mv", ancien, nouveau], cwd=ROOT, check=True)
    fiche["destination"] = destination(nouveau)
    fiche["versions"].append({"version": suivante(v["version"], majeure), "date": datetime.date.today().isoformat(), "modification": message, "archive": None})
    registre[nouveau] = fiche
    enregistrer(registre)
    rendre(registre)
    print(f"{ancien} → {nouveau} : version {fiche['versions'][-1]['version']}")


def retirer(chemin, message):
    registre = charger()
    fiche = registre.setdefault(chemin, {"destination": destination(chemin), "versions": [{"version": "1.0", "date": datetime.date.today().isoformat(), "modification": "Version unique", "archive": None}]})
    archiver_version(chemin, fiche)
    fiche["retire"] = f"Retiré le {date_fr(datetime.date.today().isoformat())} : {message}"
    (ROOT / chemin).unlink()
    enregistrer(registre)
    rendre(registre)
    print(f"{chemin} : retiré, dernière version au commit {fiche['versions'][-1]['commit']}")


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
    n = sub.add_parser("renommer")
    n.add_argument("ancien")
    n.add_argument("nouveau")
    g = n.add_mutually_exclusive_group(required=True)
    g.add_argument("--majeure", action="store_true")
    g.add_argument("--mineure", action="store_true")
    n.add_argument("-m", "--message", required=True)
    sub.add_parser("rendre")
    args = parser.parse_args()
    if args.commande == "publier":
        publier(Path(args.fichier).as_posix(), args.majeure, args.message)
    elif args.commande == "renommer":
        renommer(Path(args.ancien).as_posix(), Path(args.nouveau).as_posix(), args.majeure, args.message)
    elif args.commande == "retirer":
        retirer(Path(args.fichier).as_posix(), args.message)
    else:
        rendre(charger())


if __name__ == "__main__":
    main()
