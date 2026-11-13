# Génération vectorielle des graphiques du suivi ; données fournies par le générateur Word.
function Svg-Text($X,$Y,$Text,$Size=24,$Fill='#183348',$Weight='400') {
    "<text x='$X' y='$Y' font-size='$Size' fill='$Fill' font-weight='$Weight'>$([Security.SecurityElement]::Escape([string]$Text))</text>"
}
function Svg-Rect($X,$Y,$W,$H,$Fill,$Radius=0) { "<rect x='$X' y='$Y' width='$W' height='$H' rx='$Radius' fill='$Fill'/>" }
function Svg-Number($Value) { ([double]$Value).ToString('0.##',[Globalization.CultureInfo]::InvariantCulture) }
function Save-Svg($Name,$Content) {
    $svg="<svg xmlns='http://www.w3.org/2000/svg' width='1800' height='900' viewBox='0 0 1800 900' role='img'><title>$Name</title><g font-family='Calibri, Arial, sans-serif'>$Content</g></svg>"
    [xml]$check=$svg
    [IO.File]::WriteAllText((Join-Path $assets "$Name.svg"),$svg,(New-Object Text.UTF8Encoding $false))
}
$ink='#163246'; $muted='#617786'; $teal='#087E8B'; $orange='#D78435'
$svg=New-Object Text.StringBuilder
[void]$svg.Append((Svg-Rect 0 0 1800 900 '#F4F7FA' 28))
[void]$svg.Append((Svg-Text 65 65 '01 / PILOTAGE DU BACKLOG' 21 $teal '700'))
[void]$svg.Append((Svg-Text 65 123 'Du travail engagé à la remise finale' 44 $ink '700'))
[void]$svg.Append((Svg-Text 65 163 'Burndown · indice de travail restant · situation au 13 novembre 2026' 25 $muted))
$cardX=@(65,635,1205); $cardValue=@('77 %','23 %','19 NOV.'); $cardLabel=@('Avancement moyen estimé','Travail restant estimé','Échéance de remise')
for($c=0;$c -lt 3;$c++) {
    [void]$svg.Append((Svg-Rect $cardX[$c] 192 530 115 '#FFFFFF' 18))
    [void]$svg.Append((Svg-Rect $cardX[$c] 211 5 76 $(if($c -eq 1){$orange}else{$teal}) 2))
    [void]$svg.Append((Svg-Text ($cardX[$c]+25) 249 $cardValue[$c] 43 $ink '700'))
    [void]$svg.Append((Svg-Text ($cardX[$c]+25) 282 $cardLabel[$c] 22 $muted))
}
$left=125; $top=370; $width=1530; $height=310; $bottom=$top+$height
$xs=@($dates | ForEach-Object { $left+$width*($_-$dates[0]).TotalDays/30 })
[void]$svg.Append((Svg-Rect 65 333 1670 420 '#FFFFFF' 20))
[void]$svg.Append((Svg-Rect (Svg-Number $xs[4]) $top (Svg-Number ($left+$width-$xs[4])) $height '#FFF5E9' 0))
for($tick=0;$tick -le 100;$tick+=25){
    $y=$bottom-$height*$tick/100
    [void]$svg.Append("<path d='M $left $y H $($left+$width)' stroke='#DFE8EE' stroke-width='1'/>")
    [void]$svg.Append((Svg-Text 78 ($y+7) "$tick" 21 $muted))
}
$points=@(); for($i=0;$i -lt 8;$i++){ $points+= "$(Svg-Number $xs[$i]),$(Svg-Number ($bottom-$height*$remaining[$i]/100))" }
$area="$left,$bottom $($points[0..4] -join ' ') $(Svg-Number $xs[4]),$bottom"
[void]$svg.Append("<polygon points='$area' fill='#DFF1F2'/><path d='M $left $top L $($left+$width) $bottom' stroke='#A4B5C1' stroke-width='3' stroke-dasharray='4 7'/>")
[void]$svg.Append("<polyline points='$($points[0..4] -join ' ')' fill='none' stroke='$teal' stroke-width='6' stroke-linejoin='round'/><polyline points='$($points[4..7] -join ' ')' fill='none' stroke='$orange' stroke-width='5' stroke-dasharray='10 8'/>")
for($i=0;$i -lt 8;$i++){
    $x=Svg-Number $xs[$i]; $y=Svg-Number ($bottom-$height*$remaining[$i]/100)
    [void]$svg.Append("<circle cx='$x' cy='$y' r='6' fill='$(if($i -le 4){$teal}else{$orange})' stroke='white' stroke-width='3'/>")
    $labelY=if($i -eq 6){736}else{710}
    [void]$svg.Append((Svg-Text ($xs[$i]-25) $labelY $labels[$i] 21 $muted))
}
$currentY=$bottom-$height*$remaining[4]/100
[void]$svg.Append("<path d='M $(Svg-Number $xs[4]) $top V $bottom' stroke='$teal' stroke-dasharray='4 5' stroke-width='2'/>")
[void]$svg.Append((Svg-Rect ($xs[4]-175) ($currentY-72) 160 48 $teal 10))
[void]$svg.Append((Svg-Text ($xs[4]-158) ($currentY-40) '23 % restants' 22 '#FFFFFF' '700'))
[void]$svg.Append((Svg-Text ($xs[4]+20) 397 'OBJECTIFS' 19 '#9B5C20' '700'))
[void]$svg.Append("<path d='M 85 795 H 140' stroke='$teal' stroke-width='6'/><path d='M 645 795 H 700' stroke='$orange' stroke-width='5' stroke-dasharray='10 8'/><path d='M 1205 795 H 1260' stroke='#A4B5C1' stroke-width='3' stroke-dasharray='4 7'/>")
[void]$svg.Append((Svg-Text 155 803 'Restant estimé au 13/11' 23 $ink))
[void]$svg.Append((Svg-Text 715 803 "Objectifs jusqu’au 19/11" 23 $ink))
[void]$svg.Append((Svg-Text 1275 803 'Référence linéaire' 23 $ink))
[void]$svg.Append((Svg-Text 65 863 'Base 100 au 20/10 · moyenne des cinq lots, de poids identique · ni heures ni points de charge' 22 $muted))
Save-Svg 'BURNDOWN' $svg.ToString()

$svg=New-Object Text.StringBuilder
[void]$svg.Append((Svg-Rect 0 0 1800 900 '#F4F7FA' 28))
[void]$svg.Append((Svg-Text 65 65 '02 / AVANCEMENT DES LOTS' 21 $teal '700'))
[void]$svg.Append((Svg-Text 65 123 'Où en est chaque lot ?' 44 $ink '700'))
[void]$svg.Append((Svg-Text 65 165 'Situation estimée au 13 novembre · progression depuis le 5 novembre · objectif de remise : 100 %' 25 $muted))
[void]$svg.Append((Svg-Text 85 222 'RESPONSABLE / DOMAINE' 18 $muted '700'))
[void]$svg.Append((Svg-Text 500 222 'AVANCEMENT AU 13/11' 18 $muted '700'))
[void]$svg.Append((Svg-Text 1115 222 'ÉVOLUTION DU LOT' 18 $muted '700'))
[void]$svg.Append((Svg-Text 1515 222 'DEPUIS LE 05/11' 18 $muted '700'))
$domains=@('Socle et intégration','Interface et parcours','Modèles et inventaire','Supervision et recette','Architecture et remise')
$colors=@('#087E8B','#7D5AB5','#367D57','#B76529','#4069A1')
for($s=0;$s -lt 5;$s++){
    $y=245+$s*110; $value=$series[$s][3]; $delta=$value-$series[$s][1]; $color=$colors[$s]
    [void]$svg.Append((Svg-Rect 65 $y 1670 96 '#FFFFFF' 16))
    [void]$svg.Append((Svg-Rect 65 ($y+17) 5 62 $color 2))
    [void]$svg.Append((Svg-Text 88 ($y+38) $names[$s] 25 $ink '700'))
    [void]$svg.Append((Svg-Text 88 ($y+70) $domains[$s] 21 $muted))
    [void]$svg.Append((Svg-Rect 500 ($y+39) 430 16 '#E6EDF2' 8))
    [void]$svg.Append((Svg-Rect 500 ($y+39) ($value*4.3) 16 $color 8))
    [void]$svg.Append((Svg-Text 965 ($y+59) "$value %" 36 $color '700'))
    $values=@(0)+$series[$s]; $points=@()
    for($i=0;$i -lt 8;$i++){ $x=1115+340*($dates[$i]-$dates[0]).TotalDays/30; $py=$y+77-58*$values[$i]/100; $points+="$(Svg-Number $x),$(Svg-Number $py)" }
    [void]$svg.Append("<path d='M 1115 $($y+77) H 1455' stroke='#E2EAF0'/><polyline points='$($points[0..4] -join ' ')' fill='none' stroke='$color' stroke-width='4'/><polyline points='$($points[4..7] -join ' ')' fill='none' stroke='$color' stroke-width='3' stroke-dasharray='6 5'/><circle cx='$(Svg-Number (1115+340*24/30))' cy='$(Svg-Number ($y+77-58*$value/100))' r='5' fill='$color'/>")
    [void]$svg.Append((Svg-Text 1530 ($y+55) "+$delta pts" 32 $color '700'))
}
[void]$svg.Append((Svg-Text 85 848 'Courbes : 20/10 → 19/11 · traits pointillés : objectifs après le 13/11' 22 $muted))
[void]$svg.Append((Svg-Text 85 880 'Les lots diffèrent en taille : ces indicateurs décrivent leur progression, pas la productivité individuelle.' 21 $muted))
Save-Svg 'PROGRESSION-EQUIPE' $svg.ToString()
