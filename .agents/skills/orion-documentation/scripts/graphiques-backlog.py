#!/usr/bin/env python3
"""Graphiques du backlog ORION, produits depuis le projet GitHub (bpierrelouis, n° 2).

Écrit docs/assets/backlog/BURNDOWN.svg et docs/assets/backlog/PROGRESSION-EQUIPE.svg.
Prérequis : `gh` authentifié avec le droit `project` (lecture).
Usage, depuis la racine du dépôt : python3 .agents/skills/orion-documentation/scripts/graphiques-backlog.py [AAAA-MM-JJ]
La date facultative fixe le jour de situation (par défaut : aujourd'hui).
"""

import datetime as dt
import json
import subprocess
import sys
from html import escape
from pathlib import Path

ROOT = Path(subprocess.run(["git", "rev-parse", "--show-toplevel"], capture_output=True, text=True, check=True).stdout.strip())
SORTIE = ROOT / "docs" / "assets" / "backlog"
DEBUT, FIN, BASCULE = dt.date(2026, 10, 19), dt.date(2026, 11, 19), dt.date(2026, 11, 9)
MEMBRES = {"bpierrelouis": "BAELDE", "AlexV2204": "VILBERT-TAHON", "bbrandon971": "BONNEY",
           "WhiteYorozuya": "PHOMMAVONGSA", "louloubreizh": "LE MAÎTRE"}
FOND, CARTE, ENCRE, DOUX, ACCENT, CHAUD, TRAIT = "#F4F7FA", "#FFFFFF", "#163246", "#617786", "#087E8B", "#D78435", "#D9E2E8"
FINIS = {"Done", "Archive"}


def elements():
    out = subprocess.run(["gh", "project", "item-list", "2", "--owner", "bpierrelouis", "--limit", "500", "--format", "json"],
                         capture_output=True, text=True, check=True).stdout
    return json.loads(out)["items"]


def jour(texte):
    return dt.date.fromisoformat(texte) if texte else None


def texte(x, y, contenu, taille=22, couleur=ENCRE, graisse=400, ancre="start"):
    return f"<text x='{x}' y='{y}' font-size='{taille}' fill='{couleur}' font-weight='{graisse}' text-anchor='{ancre}'>{escape(str(contenu))}</text>"


def cadre(titre, sur_titre, sous_titre, corps, hauteur=900):
    return (f"<svg xmlns='http://www.w3.org/2000/svg' width='1800' height='{hauteur}' viewBox='0 0 1800 {hauteur}' role='img'>"
            f"<title>{escape(titre)}</title><g font-family='Calibri, Arial, sans-serif'>"
            f"<rect x='0' y='0' width='1800' height='{hauteur}' rx='28' fill='{FOND}'/>"
            + texte(65, 65, sur_titre, 21, ACCENT, 700) + texte(65, 123, titre, 44, ENCRE, 700) + texte(65, 163, sous_titre, 25, DOUX)
            + corps + "</g></svg>")


def tuile(x, valeur, libelle, couleur):
    return (f"<rect x='{x}' y='192' width='530' height='115' rx='18' fill='{CARTE}'/>"
            f"<rect x='{x}' y='211' width='5' height='76' rx='2' fill='{couleur}'/>"
            + texte(x + 25, 249, valeur, 43, ENCRE, 700) + texte(x + 25, 282, libelle, 22, DOUX))


def burndown(items, situation):
    perimetre = [i for i in items if i.get("iteration")]
    fini = lambda i, d: i.get("status") in FINIS and (jour(i.get("fin")) or DEBUT) <= d
    jours = [DEBUT + dt.timedelta(n) for n in range((FIN - DEBUT).days + 1)]
    reste = {d: sum(not fini(i, d) for i in perimetre) for d in jours if d <= situation}
    total = len(perimetre)
    x0, x1, y0, y1 = 120, 1720, 380, 820
    X = lambda d: x0 + (x1 - x0) * (d - DEBUT).days / (FIN - DEBUT).days
    Y = lambda v: y1 - (y1 - y0) * v / max(total, 1)
    corps = tuile(65, f"{total - reste[max(reste)]} / {total}", "Tickets terminés", ACCENT)
    corps += tuile(635, reste[max(reste)], "Tickets restants", CHAUD)
    corps += tuile(1205, "19 NOV.", "Remise", ACCENT)
    corps += f"<rect x='65' y='340' width='1670' height='530' rx='18' fill='{CARTE}'/>"
    for v in range(0, total + 1, max(1, total // 5)):
        corps += f"<line x1='{x0}' y1='{Y(v):.1f}' x2='{x1}' y2='{Y(v):.1f}' stroke='{TRAIT}'/>" + texte(x0 - 12, Y(v) + 7, v, 18, DOUX, ancre="end")
    for d in (DEBUT, BASCULE, FIN):
        corps += texte(X(d), y1 + 32, d.strftime("%d/%m"), 18, DOUX, ancre="middle")
    corps += f"<line x1='{X(BASCULE):.1f}' y1='{y0}' x2='{X(BASCULE):.1f}' y2='{y1}' stroke='{DOUX}' stroke-dasharray='6 6'/>"
    corps += texte((X(DEBUT) + X(BASCULE)) / 2, y0 - 10, "Sprint 1", 20, DOUX, 700, "middle") + texte((X(BASCULE) + X(FIN)) / 2, y0 - 10, "Sprint 2", 20, DOUX, 700, "middle")
    corps += f"<line x1='{X(DEBUT):.1f}' y1='{Y(total):.1f}' x2='{X(FIN):.1f}' y2='{Y(0):.1f}' stroke='{DOUX}' stroke-width='2' stroke-dasharray='10 8'/>"
    points = " ".join(f"{X(d):.1f},{Y(v):.1f}" for d, v in sorted(reste.items()))
    corps += f"<polyline points='{points}' fill='none' stroke='{CHAUD}' stroke-width='5' stroke-linejoin='round'/>"
    corps += texte(x1, y0 + 30, "— travail restant réel", 20, CHAUD, 700, "end") + texte(x1, y0 + 58, "- - rythme idéal", 20, DOUX, 400, "end")
    return cadre("Du travail engagé à la remise finale", "01 / PILOTAGE DU BACKLOG",
                 f"Burndown · tickets des sprints 1 et 2 restants · situation au {situation.strftime('%d/%m/%Y')} · source : projet GitHub", corps)


def progression(items, situation):
    lignes = []
    for login, nom in MEMBRES.items():
        siens = [i for i in items if login in (i.get("assignees") or [])]
        faits = sum(i.get("status") in FINIS for i in siens)
        encours = sum(i.get("status") in ("In progress", "In review") for i in siens)
        lignes.append((nom, faits, encours, len(siens) - faits - encours))
    maxi = max(sum(l[1:]) for l in lignes) or 1
    corps = f"<rect x='65' y='200' width='1670' height='{120 * len(lignes) + 80}' rx='18' fill='{CARTE}'/>"
    for k, (nom, faits, encours, reste) in enumerate(lignes):
        y = 250 + 120 * k
        corps += texte(100, y + 40, nom, 26, ENCRE, 700)
        x = 420
        for valeur, couleur in ((faits, ACCENT), (encours, CHAUD), (reste, TRAIT)):
            largeur = 1200 * valeur / maxi
            if valeur:
                corps += f"<rect x='{x:.1f}' y='{y + 10}' width='{largeur:.1f}' height='44' rx='8' fill='{couleur}'/>"
                if largeur > 40:
                    corps += texte(x + largeur / 2, y + 41, valeur, 20, CARTE if couleur != TRAIT else ENCRE, 700, "middle")
            x += largeur
    bas = 250 + 120 * len(lignes) + 60
    corps += (f"<rect x='420' y='{bas}' width='22' height='22' rx='4' fill='{ACCENT}'/>" + texte(452, bas + 19, "Terminés", 20, DOUX)
              + f"<rect x='620' y='{bas}' width='22' height='22' rx='4' fill='{CHAUD}'/>" + texte(652, bas + 19, "En cours ou en relecture", 20, DOUX)
              + f"<rect x='940' y='{bas}' width='22' height='22' rx='4' fill='{TRAIT}'/>" + texte(972, bas + 19, "À faire", 20, DOUX))
    return cadre("Répartition du travail par membre", "02 / PROGRESSION DE L’ÉQUIPE",
                 f"Tickets assignés par statut · situation au {situation.strftime('%d/%m/%Y')} · source : projet GitHub", corps, bas + 70)


def main():
    situation = dt.date.fromisoformat(sys.argv[1]) if len(sys.argv) > 1 else dt.date.today()
    items = elements()
    SORTIE.mkdir(parents=True, exist_ok=True)
    (SORTIE / "BURNDOWN.svg").write_text(burndown(items, min(situation, FIN)), encoding="utf-8")
    (SORTIE / "PROGRESSION-EQUIPE.svg").write_text(progression(items, situation), encoding="utf-8")
    print(f"{len(items)} éléments ; graphiques écrits dans {SORTIE.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
