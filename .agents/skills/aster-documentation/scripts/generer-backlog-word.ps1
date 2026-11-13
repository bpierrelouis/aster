param([string]$Racine = (Resolve-Path "$PSScriptRoot/../../../..").Path)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$source = Join-Path $Racine 'docs/19-BACKLOG-ET-SUIVI-PROJET.md'
$destination = Join-Path $Racine 'docs/19-BACKLOG-ET-SUIVI-PROJET.docx'
$assets = Join-Path $Racine 'docs/assets/backlog'
[IO.Directory]::CreateDirectory($assets) | Out-Null
$lines = [IO.File]::ReadAllLines($source)
$names = @('BAELDE','VILBERT-TAHON','BONNEY','PHOMMAVONGSA','LE MAÎTRE')
$series = @()
foreach ($name in $names) {
    $row = $lines | Where-Object { $_.StartsWith("| $name |") -and $_.Contains('%') }
    if (@($row).Count -ne 1) { throw "Progression introuvable : $name" }
    $series += ,@(($row -split '\|')[2..8] | ForEach-Object { [double]($_ -replace '[^0-9.]','') })
}
$dates = @('2026-10-20','2026-10-24','2026-11-05','2026-11-10','2026-11-13','2026-11-16','2026-11-18','2026-11-19') | ForEach-Object { [datetime]::ParseExact($_,'yyyy-MM-dd',[Globalization.CultureInfo]::InvariantCulture) }
$labels = @('20/10','24/10','05/11','10/11','13/11','16/11','18/11','19/11')
$remaining = @(100.0)
for ($i=0; $i -lt 7; $i++) {
    $sum = 0.0
    foreach ($values in $series) { $sum += $values[$i] }
    $remaining += 100 - $sum / 5
}
. "$PSScriptRoot/graphiques-backlog-svg.ps1"
function Escape([string]$Text) { [Security.SecurityElement]::Escape($Text) }
function Runs([string]$Text) {
    $result = New-Object Text.StringBuilder
    foreach ($part in [regex]::Split($Text,'(\*\*.*?\*\*|\[[^\]]+\]\([^)]+\))')) {
        if (!$part) { continue }
        $bold = $part.StartsWith('**')
        if ($bold) { $part=$part.Substring(2,$part.Length-4) }
        if ($part -match '^\[([^\]]+)\]\(([^)]+)\)$') {
            $label=Escape $Matches[1]; $url=Escape $Matches[2]
            [void]$result.Append("<w:fldSimple w:instr='HYPERLINK &quot;$url&quot;'><w:r><w:rPr><w:color w:val='176B87'/><w:u w:val='single'/></w:rPr><w:t>$label</w:t></w:r></w:fldSimple>")
        } else {
            $pr=if ($bold) { '<w:rPr><w:b/></w:rPr>' } else { '' }
            [void]$result.Append("<w:r>$pr<w:t xml:space='preserve'>$(Escape $part)</w:t></w:r>")
        }
    }
    $result.ToString()
}
function Paragraph([string]$Text,[string]$Style='Normal') { "<w:p><w:pPr><w:pStyle w:val='$Style'/></w:pPr>$(Runs $Text)</w:p>" }
function Picture([string]$Id,[int]$Number) {
    "<w:p><w:pPr><w:jc w:val='center'/></w:pPr><w:r><w:drawing><wp:inline distT='0' distB='0' distL='0' distR='0'><wp:extent cx='8800000' cy='4400000'/><wp:docPr id='$Number' name='$Id'/><a:graphic><a:graphicData uri='http://schemas.openxmlformats.org/drawingml/2006/picture'><pic:pic><pic:nvPicPr><pic:cNvPr id='$Number' name='$Id.png'/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed='$Id'/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x='0' y='0'/><a:ext cx='8800000' cy='4400000'/></a:xfrm><a:prstGeom prst='rect'><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>"
}
$body = New-Object Text.StringBuilder
for ($i=0; $i -lt $lines.Count; $i++) {
    $line=$lines[$i].TrimEnd()
    if (!$line) { continue }
    if ($line.StartsWith('|')) {
        $rows=@()
        while ($i -lt $lines.Count -and $lines[$i].StartsWith('|')) {
            if ($lines[$i] -notmatch '^\|[\s:|\-]+\|$') { $rows+= ,@(($lines[$i].Trim().Trim('|') -split '\|') | ForEach-Object { $_.Trim() }) }
            $i++
        }
        $i--
        $cols=$rows[0].Count
        [void]$body.Append("<w:tbl><w:tblPr><w:tblStyle w:val='BacklogTable'/><w:tblW w:w='14550' w:type='dxa'/><w:tblLayout w:type='fixed'/></w:tblPr><w:tblGrid>")
        $widths = switch ($cols) { 7 { @(650,2350,1800,1800,650,1400,5900) } 8 { @(2400,1500,1500,1500,1500,1900,1900,1950) } default { @(for ($c=0; $c -lt $cols; $c++) { [int](14550/$cols) }) } }
        foreach ($width in $widths) { [void]$body.Append("<w:gridCol w:w='$width'/>") }
        [void]$body.Append('</w:tblGrid>')
        for ($r=0; $r -lt $rows.Count; $r++) {
            $head=if ($r -eq 0) { '<w:tblHeader/>' } else { '' }
            [void]$body.Append("<w:tr><w:trPr><w:cantSplit/>$head</w:trPr>")
            for ($c=0; $c -lt $cols; $c++) {
                $fill=if ($r -eq 0) { '183348' } elseif ($r%2 -eq 0) { 'F0F4F7' } else { 'FFFFFF' }
                $style=if ($r -eq 0) { 'TableHeader' } else { 'TableText' }
                [void]$body.Append("<w:tc><w:tcPr><w:tcW w:w='$($widths[$c])' w:type='dxa'/><w:shd w:fill='$fill'/><w:vAlign w:val='center'/></w:tcPr>$(Paragraph $rows[$r][$c] $style)</w:tc>")
            }
            [void]$body.Append('</w:tr>')
        }
        [void]$body.Append('</w:tbl>')
    } elseif ($line.StartsWith('### ')) { [void]$body.Append((Paragraph $line.Substring(4) 'Heading2'))
    } elseif ($line.StartsWith('## ')) {
        if ($line.StartsWith('## 6.')) {
            [void]$body.Append((Paragraph 'Graphiques de suivi' 'Heading1'))
            [void]$body.Append((Paragraph 'Le burndown représente un indice de travail restant, de 100 à 0, calculé comme 100 moins la moyenne des cinq taux du tableau. Chaque lot reçoit le même poids, faute de charge estimée commune. Il ne représente ni des heures, ni des points, ni un nombre de tâches terminées. Le point de départ au 20 octobre est fixé conventionnellement à 100.'))
            [void]$body.Append((Picture 'burndown' 1))
            [void]$body.Append((Paragraph "Lecture : au 13 novembre, les taux retenus donnent 77 % d’avancement moyen, soit 23 % de travail restant. Les pointillés prolongent la trajectoire vers les objectifs de remise ; la droite grise est une référence linéaire." 'Caption'))
            [void]$body.Append('<w:p><w:r><w:br w:type="page"/></w:r></w:p>')
            [void]$body.Append((Paragraph 'Avancement des lots au 13 novembre' 'Heading2'))
            [void]$body.Append((Picture 'progression' 2))
            [void]$body.Append((Paragraph 'Les barres montrent la progression au 13 novembre ; les courbes retracent la trajectoire et les objectifs. Les gains en points se rapportent au 5 novembre. Les lots ont des tailles différentes.' 'Caption'))
        }
        [void]$body.Append((Paragraph $line.Substring(3) 'Heading1'))
    } elseif ($line.StartsWith('# ')) { [void]$body.Append((Paragraph $line.Substring(2) 'Title'))
    } elseif ($line.StartsWith('- ')) { [void]$body.Append((Paragraph ('• '+$line.Substring(2))))
    } else { [void]$body.Append((Paragraph $line)) }
}
$ns='xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"'
$document="<?xml version='1.0' encoding='UTF-8'?><w:document $ns><w:body>$body<w:sectPr><w:footerReference w:type='default' r:id='footer'/><w:pgSz w:w='16838' w:h='11906' w:orient='landscape'/><w:pgMar w:top='650' w:right='1100' w:bottom='650' w:left='1100' w:header='400' w:footer='400'/></w:sectPr></w:body></w:document>"
$styles=@'
<?xml version="1.0" encoding="UTF-8"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="21"/><w:color w:val="243746"/><w:lang w:val="fr-FR"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="110" w:line="260" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>
<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="100" w:after="250"/></w:pPr><w:rPr><w:b/><w:sz w:val="44"/><w:color w:val="183348"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:pageBreakBefore/><w:outlineLvl w:val="0"/><w:spacing w:after="220"/></w:pPr><w:rPr><w:b/><w:sz w:val="32"/><w:color w:val="176B87"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:outlineLvl w:val="1"/><w:spacing w:before="220" w:after="100"/></w:pPr><w:rPr><w:b/><w:sz w:val="25"/><w:color w:val="183348"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="TableText"><w:name w:val="Table text"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="40" w:before="40" w:line="220" w:lineRule="auto"/></w:pPr><w:rPr><w:sz w:val="18"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="TableHeader"><w:name w:val="Table header"/><w:basedOn w:val="TableText"/><w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="18"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Caption"><w:name w:val="caption"/><w:basedOn w:val="Normal"/><w:rPr><w:i/><w:sz w:val="18"/><w:color w:val="536878"/></w:rPr></w:style>
<w:style w:type="table" w:styleId="BacklogTable"><w:name w:val="Backlog table"/><w:tblPr><w:tblCellMar><w:top w:w="65" w:type="dxa"/><w:left w:w="90" w:type="dxa"/><w:bottom w:w="65" w:type="dxa"/><w:right w:w="90" w:type="dxa"/></w:tblCellMar><w:tblBorders><w:bottom w:val="single" w:sz="4" w:color="DBE3E9"/><w:insideH w:val="single" w:sz="4" w:color="DBE3E9"/></w:tblBorders></w:tblPr></w:style>
</w:styles>
'@
$contentTypes='<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="svg" ContentType="image/svg+xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/></Types>'
$rels='<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="document" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'
$docRels='<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="styles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="burndown" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/burndown.svg"/><Relationship Id="progression" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/progression.svg"/><Relationship Id="footer" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/></Relationships>'
$footer='<?xml version="1.0" encoding="UTF-8"?><w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:jc w:val="right"/></w:pPr><w:r><w:rPr><w:sz w:val="16"/><w:color w:val="536878"/></w:rPr><w:t>ASTER · Backlog et suivi du projet — </w:t></w:r><w:fldSimple w:instr="PAGE"/></w:p></w:ftr>'
$file=[IO.File]::Open($destination,[IO.FileMode]::Create)
$zip=New-Object IO.Compression.ZipArchive $file,([IO.Compression.ZipArchiveMode]::Create)
try {
    $parts=@{'[Content_Types].xml'=$contentTypes; '_rels/.rels'=$rels; 'word/document.xml'=$document; 'word/styles.xml'=$styles; 'word/_rels/document.xml.rels'=$docRels; 'word/footer1.xml'=$footer}
    foreach ($part in $parts.GetEnumerator()) {
        [xml]$check=$part.Value
        $entry=$zip.CreateEntry($part.Key)
        $writer=New-Object IO.StreamWriter ($entry.Open()),(New-Object Text.UTF8Encoding $false)
        $writer.Write($part.Value); $writer.Dispose()
    }
    [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip,(Join-Path $assets 'BURNDOWN.svg'),'word/media/burndown.svg') | Out-Null
    [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip,(Join-Path $assets 'PROGRESSION-EQUIPE.svg'),'word/media/progression.svg') | Out-Null
} finally { $zip.Dispose(); $file.Dispose() }
# Word inscrit les SVG avec ses extensions natives et sa prévisualisation de compatibilité.
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
    $doc = $word.Documents.Open($destination)
    $svgFiles = @('BURNDOWN.svg','PROGRESSION-EQUIPE.svg')
    for ($index=2; $index -ge 1; $index--) {
        $old = $doc.InlineShapes.Item($index)
        $range = $old.Range.Duplicate
        $old.Delete()
        $picture = $doc.InlineShapes.AddPicture((Join-Path $assets $svgFiles[$index-1]),$false,$true,$range)
        $picture.Width = 693
        $picture.Height = 346.5
    }
    $doc.Save()
    $doc.Close(0)
} finally {
    $word.Quit()
    [Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}
Write-Output "DOCX : $destination"
Write-Output "Indice restant : $($remaining -join ', ')"
