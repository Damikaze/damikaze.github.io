/* TO DO : 
    Afficher le début du texte décrypté

    .visible-xs .hidden-xs
    (swipe ? plus tard ...)
    Partie pédagogie : explications, gifs.
*/

var TAILLE_ALPHABET = 26;
var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

var popup_text = "Il y a des caractères illégaux dans le texte. Il se peut que le texte ne soit pas encore crypté. Que voulez-vous faire ? \
\n\nOK : Les caractères illégaux sont échappés \
\nAnnuler : Activer le module de cryptage";

var frequences = {
    'fr': [
        8.122, 0.901, 3.345, 3.669, 17.124, // A --> E
        1.066, 0.866, 0.737, 7.580, 0.545, // F --> J
        0.049, 5.456, 2.968, 7.095, 5.387, // K --> O
        3.021, 1.362, 6.553, 7.948, 7.244, // P --> T
        6.369, 1.628, 0.114, 0.387, 0.308, 0.136 // U --> Z
    ],
    'en': [
        8.167, 1.492, 2.782, 4.253, 12.702, // A --> E
        2.228, 2.015, 6.094, 6.966, 0.153, // F --> J
        0.772, 4.025, 2.406, 6.749, 7.507, // K --> O
        1.929, 0.095, 5.987, 6.327, 9.056, // P --> T
        2.758, 0.978, 2.360, 0.150, 1.974, 0.074 // U --> Z
    ]
}

var indice_coincidence = {
    'fr': 0.0778,
    'en': 0.0667
}

var data; // Objet Google des données de l'histogramme
var chart; // Objet Google de l'histogramme
var options; // Objet des options de l'histogramme

google.load('visualization', '1.0', {'packages':['corechart']});
google.setOnLoadCallback(dessineHistogrammeInitial);

String.prototype.echapperAccents = function(){
    var accents = [
        /[\300-\306]/g, // A
        /[\310-\313]/g, // E
        /[\314-\317]/g, // I
        /[\322-\330]/g, // O
        /[\331-\334]/g, // U
        /[\321]/g, // N
        /[\307]/g, // C
    ];
    var sansAccents = ['A', 'E', 'I', 'O', 'U', 'N', 'C'];
     
    var str = this;
    for(var i = 0; i < accents.length; i++){
        str = str.replace(accents[i], sansAccents[i]);
    }
    return str;
}

/*
 *  Fonction callback appelée au chargement de l'application
 *  Construit l'histogramme avec les fréquences théoriques de la langue
 *  Langue par défaut : français
 */
function dessineHistogrammeInitial() {
    data = new google.visualization.DataTable();
    data.addColumn('string', 'Lettres');
    data.addColumn('number', 'Fréquences théoriques');
    data.addColumn('number', 'Fréquences du texte crypté');

    // Données de base : fréquences théoriques des lettres
    // de l'alphabet dans la langue française
    var rows = [];
    var frequences_theoriques = frequences['fr'];
    for (var i = 0; i < TAILLE_ALPHABET; i++) {
        rows.push(
            [alphabet.charAt(i), frequences_theoriques[i], 0]
        );
    }
    data.addRows(rows);

    // Options globales de l'histogramme
    options = {
        'title'  :  'Histogramme des fréquences',
        'legend' :  { 'position' : 'bottom' },
        'height' :  350,
        'vAxis'  :  {
            'viewWindow' : { 'max' : 20 }
        }
    };

    // Instancie, dessine l'histogramme et l'affiche dans la div "chart_div"
    var div_chart = document.getElementById('chart_div');
    chart = new google.visualization.ColumnChart(div_chart);
    chart.draw(data, options);
}

/*
 *  Fonction interne pour formater le texte pour une potentielle cryptanalyse :
 *  En majuscule, accents et caractères non alphabétiques échappés 
 */
function cleanText(inputText) { return inputText.toUpperCase().echapperAccents().replace(/[^A-Z]/g, ""); }

/*  Fonction interne de calcul de modulo pour toujours retourner un modulo positif  */
function mod(n, m) { return ((n % m) + m) % m; }

/*
 * Fonction principale de cryptage / decryptage 
 * @sensCryptage : booléen, valeur : vrai -> cryptage, faux -> décryptage
 * @inputText : texte à crypter ou décrypter
 * @inputKey : clé de chiffrage
 */
function crypter(inputText, inputKey, sensCryptage) {
    var cleanedText = cleanText(inputText);
    var cleanedKey = cleanText(inputKey);

    var longueurTexte = cleanedText.length;
    var longueurCle = cleanedKey.length;
    var texteSortie = "";

    for (var i = 0; i < longueurTexte; i++) {
        // On récupère le "i-ème" caractère du texte et on recupere sa position dans l'alphabet
        var positionCaractereTexte = alphabet.indexOf(cleanedText.charAt(i));
        // On récupère le "i-ème" caractère de la clé (modulo la taille de la clé) et on recupere sa position dans l'alphabet
        var positionCaractereCle = alphabet.indexOf(cleanedKey.charAt(mod(i, longueurCle)));

        if (sensCryptage == true) {
            // Lettre chiffrée : on somme les 2 positions, et on détermine la lettre à cet index
            texteSortie += alphabet.charAt(mod((positionCaractereTexte + positionCaractereCle), TAILLE_ALPHABET));
            //console.log(texteChiffre);
        }
        else {
            texteSortie += alphabet.charAt(mod((positionCaractereTexte - positionCaractereCle), TAILLE_ALPHABET));
        }
    }

    return {
        'texte' : texteSortie, 
        'cle': cleanedKey
    };
}

/*
 *  Méthode de calcul des fréquences
 */
function calculFrequences() {
    var cle = $("#cle_trouvee").children();
    var focusedChar = $("#focusedChar"); // caractère de la clé sur lequel on est concentré
    var texteCrypte = $("#cryptedText").val();

    var cptLettresAnalysees = 1;
    var tableFrequences = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var icTexte = 0; // indice de coincidence

    // modulo : taille de la clé, correspond au saut entre les lettres à analyser
    var modulo = cle.length;

    if (modulo > 0) {
        // offset : position du caractère de la clé à trouver, position également de la première lettre du texte à analyser
        var offset = cle.index( focusedChar );
        
        cptLettresAnalysees = 0;
        for (var i = offset; i < texteCrypte.length; i += modulo) {
            var position = alphabet.indexOf(texteCrypte.charAt(i));
            tableFrequences[position]++;
            cptLettresAnalysees++;
        }
    }

    // Variable qui permet de rétablir l'histogramme à l'emplacement qu'on l'a laissé 
    // si on a essayé de chercher les bon caractères en le décalant
    var decalage = alphabet.indexOf(focusedChar.html());

    for (var j = 0; j < TAILLE_ALPHABET; j++) {
        var indexReel = mod(j + decalage, TAILLE_ALPHABET);
        // On divise par le nombre de lettres analysees pour obtenir des pourcentages.
        tableFrequences[indexReel] = tableFrequences[indexReel] * 100 / cptLettresAnalysees;
        icTexte += Math.pow(tableFrequences[indexReel] / 100, 2);
        data.setValue(j, 2, tableFrequences[indexReel]);
    }

    $("#ic_texte").html(icTexte.toPrecision(3));

    chart.draw(data, options);
}


function decalageGauche() {
    var focusedChar = $("#focusedChar");
    var predecesseur = focusedChar.prev();
    if (predecesseur.length != 0) { 

        predecesseur.attr('id', 'focusedChar');
        predecesseur.css('font-weight', 'bold');

        focusedChar.attr('id', '');
        focusedChar.css('font-weight', 'normal');
    }
}

function decalageDroite() {
    var focusedChar = $( "#focusedChar" );
    var successeur = focusedChar.next();
    if (successeur.length != 0) { 

        successeur.attr('id', 'focusedChar');
        successeur.css('font-weight', 'bold');

        focusedChar.attr('id', '');
        focusedChar.css('font-weight', 'normal');
    }
}


function apercuDecryptage() {
    var cle = "";
    $( "#cle_trouvee" ).children().each(function() {
        cle += $(this).html();
    });

    texteFinalDebut = crypter($( "#cryptedText").val().substr(0,20), cle, false);
    $( "#apercu" ).html(texteFinalDebut.texte);
}


/*
 *  "Gestionnaire" du décalage de l'histogramme pour trouver les bons caractères de la clé
 */
$('#chart_div').on('mousewheel', function(event) {

    if ($("#cle_trouvee").children().length == 0) {
        return;
    }
        
    if (event.originalEvent.wheelDelta > 0) {
        // Scroll vers le haut : on décale l'histogramme à gauche
        var tmp = data.getValue(0, 2);
        for (var i = 0; i < (TAILLE_ALPHABET - 1); i++) {
            data.setValue(i, 2, data.getValue(i + 1, 2));
        }
        data.setValue((TAILLE_ALPHABET - 1), 2, tmp);

        // On décale le caractère de la clé : A -> B
        var caractereActif = $("#focusedChar").html();
        var caractereSuivant = alphabet.charAt( mod(alphabet.indexOf(caractereActif) + 1, TAILLE_ALPHABET) );
        $("#focusedChar").html( caractereSuivant );
    }
    else {
        // Scroll vers le bas : on décale l'histogramme à droite
        var tmp = data.getValue((TAILLE_ALPHABET - 1), 2);
        for (var i = 0; i < (TAILLE_ALPHABET - 1); i++) {
            data.setValue((TAILLE_ALPHABET - 1) - i, 2, data.getValue((TAILLE_ALPHABET - 1) - (i + 1), 2));
        }
        data.setValue(0, 2, tmp);

        // On décale le caractère de la clé : B -> A
        var caractereActif = $("#focusedChar").html();
        var caractereSuivant = alphabet.charAt( mod(alphabet.indexOf(caractereActif) - 1, TAILLE_ALPHABET) );
        $("#focusedChar").html( caractereSuivant );
    }

    // On échappe le scroll de la page si elle déborde de l'écran.
    event.preventDefault();
    chart.draw(data, options);
});

/*
 * "Gestionnaire" du calcul des fréquences
 */
$("#cryptedText").on('keyup', function() {
    // On recherche s'il y a des caractères illégaux
    var hasError = $(this).val().match(/[^A-Z]/i);

    if ( hasError != null && $( "#div_cryptage" ).is(":hidden") ) {
        var reponse = confirm(popup_text);
        if (reponse == false) {
            $( "#div_cryptage" ).show();
            $( "#cle_trouvee" ).html('');
            calculFrequences();
            return;
        }
    }

    // Début de la cryptanalyse : nouvelle clé d'une seule lettre si le texte n'est pas vide
    if ( $(this).val() != "" ) {
        $('#cle_trouvee').html('<span id="focusedChar" style="font-weight: bold;">A</span>');
        // Re-nettoyage du texte par précaution
        var cleanedCryptedText = cleanText($(this).val());
        $('#cryptedText').val(cleanedCryptedText);
    }
    else {
        $('#cle_trouvee').html('');
    }

    calculFrequences();
});


/*
 * "Gestionnaires" pour la manipulation de la clé :
 * agrandissement / rétrécissement / passage d'un caractère à l'autre
 */
$("#cle_gauche").on('click', function() {
    decalageGauche();
    calculFrequences();
});

$("#cle_droite").on('click', function() {
    decalageDroite();
    calculFrequences();
});

$("#cle_plus").on('click', function() {
    var tailleCle = $('#cle_trouvee').children().length;
    if (tailleCle >= 1 && tailleCle < $("#cryptedText").val().length ) {
        $('#cle_trouvee').append('<span>A</span>');
        calculFrequences();
    }
});

$("#cle_moins").on('click', function() {
    var cle = $('#cle_trouvee').children();
    if (cle.length > 1) {
        if (cle.last().attr('id') == "focusedChar") {
            decalageGauche();
        }
        $('#cle_trouvee').children().last().remove();
        calculFrequences();
    }
});


/*
 * Actions jQuery globales pour l'application
 */

$( "#goto_part1" ).on("click", function() {
    $("#home").hide();
    $("#part1").show();
    // On nettoie les champs du module avant de commencer
    $("#input").val('');
    $("#cle1").val('');
    $("#output").val('');
});

$( "#goto_part2" ).on("click", function() {
    $("#home").hide();
    $("#part2").show();
    // On nettoie les champs du module avant de commencer
    $("#cryptedText").val('').trigger("keyup");
    $("#cle2").val('');
});

$( ".goto_home" ).on("click", function() {
    $(this).parent().parent().parent().hide();
    $("#home").show();
});

$( "#action1" ).on("click", function(){
    if ( $( "#cle1" ).val() != '' ) {
        // sensCryptage --> true : cryptage, false : decryptage
        sensCryptage = $( "#crypter" ).prop('checked');

        var output = crypter($( "#input" ).val(), $( "#cle1" ).val(), sensCryptage);

        $( "#cle1" ).val(output.cle);
        $( "#output" ).val(output.texte);
    }
});

$( "#action2" ).on("click", function() {
    if ( $( "#cle2" ).val() != '' ) {
        var output = crypter($( "#cryptedText" ).val(), $( "#cle2" ).val(), true);

        $( "#cle2" ).val(output.cle);
        $( "#cryptedText" ).val(output.texte).trigger("keyup");
    }
});

$( "#crypter" ).on("click", function() {
    $( "#action1" ).html("Crypter");
});

$( "#decrypter" ).on("click", function() {
    $( "#action1" ).html("Décrypter");
});

$( "#refresh" ).on("click", function() {
    $( "#cle_trouvee" ).html('<span id="focusedChar" style="font-weight: bold;">A</span>');
    calculFrequences(); 
});

$( "#resultat_cryptanalyse" ).on("click", function() {
    if ( $( "#cle_trouvee" ).children().length > 0 ) {
        // TO DO : Bloquer la fenetre modale
        var cle = "";
        $( "#cle_trouvee" ).children().each(function(){
            cle += $(this).html();
        });
        texteFinal = crypter($( "#cryptedText").val(), cle, false);
        $( "#decryptedText" ).html(texteFinal.texte);
    }
});

$( window ).resize(function() {
    chart.draw(data, options);
});

$( document ).ready(function() {
    $( "#ic_theorique" ).html( indice_coincidence['fr'] );

    $( "#titre" ).css("visibility", "visible");
    $(this).charcycle({
        'target': '#titre',
        'speed': 20
    }); 
});

$( "#oubli" ).on("click", function() {
    $( "#div_cryptage" ).toggle();
});

$( "#menu_langue" ).on("change", function() {
    $( "#ic_theorique" ).html( indice_coincidence[$(this).val()] );

    var frequences_theoriques = frequences[$(this).val()];
    for (var i = 0; i < TAILLE_ALPHABET; i++) {
        data.setValue(i, 1, frequences_theoriques[i]);
    }
    chart.draw(data, options);
});