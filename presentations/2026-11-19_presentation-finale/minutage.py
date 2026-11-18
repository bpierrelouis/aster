"""Minutage du conducteur, mesuré par synthèse vocale.

Usage (Windows) : py -3 minutage.py CONDUCTEUR.md

Pour chaque diapositive (titre « ### »), le texte dit est lu par la voix française
de Windows (SAPI, Microsoft Hortense, débit normal) et la durée du fichier audio
produit est mesurée. S'y ajoutent 1 s par révélation et 5 s par passage de parole.
Dans les démonstrations, la parole et la manipulation de chaque étape se déroulent
en parallèle : la durée retenue est donc la plus longue des deux.
Texte dit : hors démonstration, tout le texte sauf les gestes entre crochets ;
en démonstration, les seules répliques entre guillemets « ». Sans SAPI, la durée
est estimée à 150 mots par minute.
"""
import os, re, subprocess, sys, wave

MOTS_PAR_MINUTE, REVELATION, PASSAGE = 150, 1, 5
VOIX = "Microsoft Hortense Desktop"


def lire(texte, dossier, n):
    """Durée en secondes du texte lu par SAPI, ou None si la synthèse est indisponible."""
    if sys.platform != "win32":
        return None
    prefixe = f".minutage-{os.getpid()}-{n}"
    src = os.path.join(dossier, prefixe + ".txt")
    wav = os.path.join(dossier, prefixe + ".wav")
    try:
        with open(src, "w", encoding="utf-8") as f:
            f.write(texte)
    except OSError:
        return None
    try:
        ps = ("Add-Type -AssemblyName System.Speech; $s = New-Object System.Speech.Synthesis.SpeechSynthesizer; "
              f"$s.SelectVoice('{VOIX}'); $s.Rate = 0; $s.SetOutputToWaveFile('{wav}'); "
              f"$s.Speak([IO.File]::ReadAllText('{src}', [Text.Encoding]::UTF8)); $s.Dispose()")
        if subprocess.run(["powershell", "-NoProfile", "-Command", ps], capture_output=True).returncode:
            return None
        try:
            with wave.open(wav) as audio:
                return audio.getnframes() / audio.getframerate()
        except (OSError, EOFError, wave.Error):
            return None
    finally:
        for chemin in (src, wav):
            try:
                os.remove(chemin)
            except OSError:
                pass


def texte_dit(corps):
    corps = "\n".join(l for l in corps.splitlines() if not l.startswith("Seulement"))  # passage optionnel
    sans_gestes = re.sub(r"\[[^\]]*\]", " ", corps)
    if re.search(r"manipulation ≈", corps):
        dit = " ".join(re.findall(r"«\s*(.*?)\s*»", sans_gestes, re.S))
        dit += " " + " ".join(re.findall(r"^\*(.*)\*$", corps, re.M))
    else:
        dit = sans_gestes
    return re.sub(r"\s+", " ", dit.replace("*", "").replace("`", "")).strip()


def duree_parole(texte, dossier, n):
    mots = len(re.findall(r"[\wÀ-ÿ’'-]+", texte))
    return mots, lire(texte, dossier, n) or mots / MOTS_PAR_MINUTE * 60


def duree_demo(corps, dossier, n):
    """Mesure chaque étape en faisant coïncider parole et manipulation."""
    corps = "\n".join(l for l in corps.splitlines() if not l.startswith("Seulement"))
    etapes = re.findall(
        r"^\d+\. .*?manipulation ≈ (\d+) s\.(.*?)(?=^\d+\.|\Z)",
        corps,
        re.S | re.M,
    )
    mots, parole, total = 0, 0.0, 0.0
    for i, (manipulation, contenu) in enumerate(etapes):
        sans_gestes = re.sub(r"\[[^\]]*\]", " ", contenu)
        dit = " ".join(re.findall(r"«\s*(.*?)\s*»", sans_gestes, re.S))
        dit = re.sub(r"\s+", " ", dit).strip()
        mots_etape, parole_etape = duree_parole(dit, dossier, f"{n}-{i}")
        mots += mots_etape
        parole += parole_etape
        total += max(parole_etape, int(manipulation))

    transitions = " ".join(re.findall(r"^\*([^*]+)\*$", corps, re.M))
    mots_transition, parole_transition = duree_parole(transitions, dossier, f"{n}-t")
    mots += mots_transition
    parole += parole_transition
    passages = PASSAGE * len(re.findall(r"^\*[^*]+\*$", corps, re.M))
    revelations = REVELATION * len(re.findall(r"\[Révéler", corps))
    return mots, parole, revelations + passages, total + parole_transition + revelations + passages


def mmss(s):
    s = int(round(s))
    return f"{s // 60}:{s % 60:02d}"


def main(chemin):
    source = open(chemin, encoding="utf-8").read()
    sections = re.findall(r"^### ([^\n]+)\n(.*?)(?=^##)", source + "\n##", re.S | re.M)
    debut, lignes = 0.0, []
    dossier_parent = os.path.dirname(os.path.abspath(chemin))
    dossier = dossier_parent
    for n, (titre, corps) in enumerate(sections):
        if "attente" in titre:
            continue
        if re.search(r"manipulation ≈", corps):
            mots, parole, actions, total = duree_demo(corps, dossier, n)
        else:
            dit = texte_dit(corps)
            mots, parole = duree_parole(dit, dossier, n)
            revelations = len(re.findall(r"\[Révéler", corps)) * REVELATION
            passages = PASSAGE * len(re.findall(r"^\*[^*]+\*$", corps, re.M))
            actions = revelations + passages
            total = parole + actions
        lignes.append((titre.split(" · ")[0], mots, parole, actions, total, debut))
        debut += total
    print(f"{'Diapositive':38}{'mots':>6}{'parole':>8}{'actions':>8}{'total':>7}  horaire")
    for titre, mots, parole, autres, total, d in lignes:
        print(f"{titre[:38]:38}{mots:6}{parole:7.0f}s{autres:7.0f}s{mmss(total):>7}  {mmss(d)} → {mmss(d + total)}")
    print(f"Total : {mmss(debut)} pour 25:00, marge {mmss(25 * 60 - debut)}")


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    main(sys.argv[1] if len(sys.argv) > 1 else "CONDUCTEUR.md")
