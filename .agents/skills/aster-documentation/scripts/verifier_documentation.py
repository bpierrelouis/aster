#!/usr/bin/env python3
"""Contrôles structurels en lecture seule, sans dépendance ni accès réseau.

Périmètre : liens Markdown inline et de référence (existence des fichiers,
sans validation des ancres), conflits, noms/numéros du premier niveau de docs/,
sommaire du README, références RG, absence de prose dans les fichiers de
diagrammes et libellés des couples Mocodo URL/SVG.
Le sens métier, les cardinalités et la mise en page exigent une revue humaine.
"""

import argparse
import base64
from collections import defaultdict
from dataclasses import asdict, dataclass
import json
from pathlib import Path
import re
import sys
from urllib.parse import parse_qs, unquote, urlsplit
import xml.etree.ElementTree as ET
import zlib


@dataclass
class Finding:
    niveau: str
    code: str
    fichier: str
    ligne: int
    message: str


def prose_lines(text):
    """Ignorer les exemples en blocs de code, conserver les vrais numéros."""
    fence = None
    for number, line in enumerate(text.splitlines(), 1):
        marker = re.match(r"^\s*(`{3,}|~{3,})(.*)$", line)
        if marker:
            token, tail = marker.groups()
            if fence is None:
                fence = token
            elif token[0] == fence[0] and len(token) >= len(fence) and not tail.strip():
                fence = None
            continue
        if fence is None:
            yield number, re.sub(r"`+[^`]*`+", "", line)


def destinations(lines):
    """Liens inline, images et références explicites ; ignorer les raccourcis."""
    definitions = {}
    for number, line in lines:
        match = re.match(r"^\s{0,3}\[([^]]+)\]:\s*(<[^>]+>|\S+)", line)
        if match:
            label, target = match.groups()
            definitions[" ".join(label.lower().split())] = target.strip("<>")
            yield number, target.strip("<>")
    for number, line in lines:
        if re.match(r"^\s{0,3}\[[^]]+\]:", line):
            continue
        for match in re.finditer(r"!?\[[^]\n]*\]\(", line):
            rest = line[match.end():].lstrip()
            if rest.startswith("<"):
                end = rest.find(">")
                if end != -1:
                    yield number, rest[1:end]
                continue
            depth, target = 0, []
            escaped = False
            for char in rest:
                if escaped:
                    target.append(char)
                    escaped = False
                    continue
                if char == "\\":
                    escaped = True
                    continue
                if char == ")" and depth == 0 or char.isspace() and depth == 0:
                    break
                depth += (char == "(") - (char == ")")
                target.append(char)
            if target:
                yield number, "".join(target)
        for match in re.finditer(r"!?\[([^]\n]+)\]\[([^]\n]*)\]", line):
            label = " ".join((match[2] or match[1]).lower().split())
            yield number, definitions.get(label)


def audit(root):
    findings = []

    def report(level, code, path, line, message):
        findings.append(Finding(level, code, str(path.relative_to(root)), line, message))

    paths = [p for p in (root / "README.md", root / "AGENTS.md") if p.is_file()]
    paths += sorted((root / "docs").rglob("*.md"))
    skill = root / ".agents/skills/aster-documentation"
    paths += sorted(skill.rglob("*.md"))
    texts = {}
    local_links = defaultdict(set)
    rg_definitions = defaultdict(list)
    rg_mentions = []
    for path in paths:
        try:
            text = path.read_text(encoding="utf-8")
        except (OSError, UnicodeError) as exc:
            report("erreur", "LECTURE", path, 1, str(exc))
            continue
        texts[path] = text
        # Les marqueurs de conflit sont aussi interdits dans les blocs de code.
        for number, line in enumerate(text.splitlines(), 1):
            if re.match(r"^(?:<{7}|>{7}|={7})(?:\s|$)", line):
                report("erreur", "CONFLIT", path, number, "Marqueur de conflit Git.")
        lines = list(prose_lines(text))
        for number, target in destinations(lines):
            if target is None:
                report("erreur", "REFERENCE_LIEN", path, number, "Référence de lien non définie.")
                continue
            parsed = urlsplit(target)
            if parsed.scheme or parsed.netloc or not parsed.path:
                continue
            dest = (path.parent / unquote(parsed.path)).resolve()
            local_links[path].add(dest)
            if not dest.exists():
                report("erreur", "LIEN_ABSENT", path, number, f"Cible absente : {target}")
        # Les modèles du skill ne constituent pas des règles métier du projet.
        if not path.is_relative_to(root / "docs"):
            continue
        diagram_name = re.search(r"(?:^|-)(?:DIAGRAMMES?|DCU|MCD)(?:-|\.)", path.name)
        if diagram_name or "```mermaid" in text:
            # Les libellés internes des diagrammes restent autorisés.
            block = re.compile(r"(?m)^(`{3,}|~{3,})(?:mermaid|plantuml|mocodo|dot|graphviz)[ \t]*\n.*?^\1[ \t]*(?:\n|$)", re.S)
            blocks = list(block.finditer(text))
            remainder = block.sub(lambda m: "\n" * m[0].count("\n"), text)
            image = re.compile(r'^!\[[^]\n]*\]\((?:<[^>\n]+>|[^()\s]+)(?:\s+"[^"\n]*")?\)$')
            heading = re.compile(r"^#{1,6} +\S.*$")
            extras = [(n, line) for n, line in enumerate(remainder.splitlines(), 1) if line.strip() and not image.fullmatch(line.strip()) and not heading.fullmatch(line.strip())]
            if extras:
                report("erreur", "DIAGRAMME_TEXTE", path, extras[0][0], "Texte explicatif hors diagramme (seuls les titres sont autorisés) : à documenter dans le glossaire, le cadrage ou les règles.")
            elif not blocks and not any(image.fullmatch(line.strip()) for line in remainder.splitlines()):
                report("erreur", "DIAGRAMME_VIDE", path, 1, "Aucun bloc de diagramme ou image intégrée.")
        for number, line in lines:
            definitions = re.findall(r"(?:\*\*|^#{1,6}\s+)(RG-\d+)\s*[—–:]", line)
            for identifier in definitions:
                rg_definitions[identifier].append((path, number))
            rg_mentions.extend((identifier, path, number) for identifier in re.findall(r"\bRG-\d+\b", line))

    for identifier, locations in rg_definitions.items():
        if len(locations) > 1:
            for path, number in locations:
                report("avertissement", "RG_DUPLIQUEE", path, number, f"Plusieurs définitions de {identifier}.")
    for identifier, path, number in rg_mentions:
        if identifier not in rg_definitions:
            report("erreur", "RG_ABSENTE", path, number, f"Aucune définition de {identifier} trouvée.")

    docs = sorted((root / "docs").glob("*.md"))
    numbers = defaultdict(list)
    readme = root / "README.md"
    for path in docs:
        match = re.fullmatch(r"(\d{2})-([\w-]+)\.md", path.name)
        if not match or match[2] != match[2].upper() or "_" in match[2]:
            report("avertissement", "NOM_DOCUMENT", path, 1, "Nom attendu : NN-TITRE-EN-MAJUSCULES.md.")
        if match:
            numbers[int(match[1])].append(path)
        if readme in texts and path.resolve() not in local_links[readme]:
            report("avertissement", "SOMMAIRE", path, 1, "Document absent des liens du README.")
    for number, files in numbers.items():
        if len(files) > 1:
            for path in files:
                report("avertissement", "NUMERO_DUPLIQUE", path, 1, f"Préfixe {number:02} partagé par plusieurs documents Markdown.")
    if numbers:
        missing = sorted(set(range(min(numbers), max(numbers) + 1)) - numbers.keys())
        if missing:
            report("avertissement", "NUMEROTATION", root / "docs", 1, "Numéros sans document Markdown : " + ", ".join(f"{n:02}" for n in missing) + ". Vérifier avant toute renumérotation.")

    for source in sorted((root / "docs").rglob("*-MOCODO.url")):
        svg = source.with_name(source.name.replace("-MOCODO.url", ".svg"))
        if not svg.exists():
            report("erreur", "MOCODO_SVG", source, 1, f"Rendu absent : {svg.name}")
            continue
        try:
            url = source.read_text(encoding="utf-8").strip()
            payload = parse_qs(urlsplit(url).query)["mcd"][0]
            decoded = zlib.decompress(base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4))).decode("utf-8")
            tree = ET.parse(svg)
            labels = {"".join(node.itertext()).strip() for node in tree.iter() if node.tag.endswith("}text") or node.tag == "text"}
            expected = set()
            for line in decoded.splitlines():
                line = line.strip()
                if not line or line.startswith((":", "%")):
                    continue
                left, _, attrs = line.partition(":")
                expected.add(left.split(",")[0].strip())
                expected.update(attr.strip().lstrip("_") for attr in attrs.split(",") if attr.strip())
            absent = sorted(expected - labels)
            if absent:
                report("erreur", "MOCODO_LIBELLES", svg, 1, "Libellés de la source absents du SVG : " + ", ".join(absent))
        except (OSError, UnicodeError, ValueError, KeyError, IndexError, zlib.error, ET.ParseError) as exc:
            report("erreur", "MOCODO_LECTURE", source, 1, f"Couple Mocodo illisible : {exc}")
    return findings


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[4], help="Racine du dépôt ASTER.")
    parser.add_argument("--json", action="store_true", help="Résultat structuré.")
    parser.add_argument("--strict-warnings", action="store_true", help="Échec également sur les avertissements.")
    args = parser.parse_args()
    root = args.root.resolve()
    if not (root / "docs").is_dir() or not (root / "README.md").is_file():
        parser.error("La racine doit contenir README.md et docs/.")
    findings = audit(root)
    errors = sum(item.niveau == "erreur" for item in findings)
    warnings = len(findings) - errors
    if args.json:
        print(json.dumps({"erreurs": errors, "avertissements": warnings, "constats": [asdict(item) for item in findings]}, ensure_ascii=False, indent=2))
    else:
        for item in findings:
            print(f"{item.niveau.upper()} {item.fichier}:{item.ligne} [{item.code}] {item.message}")
        print(f"{errors} erreur(s), {warnings} avertissement(s).")
        print("Contrôle structurel seulement : ancres, cardinalités, rendu et cohérence métier à relire.")
    return int(bool(errors or (args.strict_warnings and warnings)))


if __name__ == "__main__":
    sys.exit(main())
