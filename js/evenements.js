/* TO DO : 
    Afficher le début du texte décrypté

    .visible-xs .hidden-xs
    (swipe ? plus tard ...)
    Partie pédagogie : explications, gifs.
*/

/*
 *  Evenement : Tour de molette sur l'histogramme
 *  Resultat :
 *       - Décalage de l'histogramme des fréquences du texte (gauche ou droite)
 *       - Modification du caractère de la clé sur lequel il y a le focus
 *       - Nouvel apercu du decryptage
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
    apercuDecryptage();
});

/*
 *  Evenement : Touche de clavier sur le champ du texte à analyser
 *  Résultat : Vérifier le format du texte, proposer un cryptage si besoin,
 *       et lancer la cryptanalyse (calcul des fréquences) si le texte est bien formaté
 */
$("#cryptedText").on('keyup', function() {
    // On recherche s'il y a des caractères illégaux
    var hasError = $(this).val().match(/[^A-Z]/i);

    if ( hasError != null && $( "#div_cryptage" ).is(":hidden") ) {
        var reponse = confirm(popup_text);
        if (reponse == false) {
            $( "#div_cryptage" ).show();
            $( "#cle_trouvee" ).html('');
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
    apercuDecryptage();
});


/*
 *  Les 4 gestionnaires d'evenement concernant la clé de cryptage à déterminer :
 *       - Augmentation de la taille de la clé
 *       - Diminution de la taille de la clé
 *       - Décalage du focus du caractère à gauche
 *       - Décalage du focus du caractère à droite
 */

$("#cle_gauche").on('click', function() {
    decalageGauche();
    calculFrequences();
    apercuDecryptage();
});

$("#cle_droite").on('click', function() {
    decalageDroite();
    calculFrequences();
    apercuDecryptage();
});

$("#cle_plus").on('click', function() {
    var tailleCle = $('#cle_trouvee').children().length;
    if (tailleCle >= 1 && tailleCle < $("#cryptedText").val().length ) {
        $('#cle_trouvee').append('<span>A</span>');
        calculFrequences();
        apercuDecryptage();
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
        apercuDecryptage();
    }
});



/*
 *  Les 3 gestionnaires d'évènement pour afficher chacune des trois parties de l'appli
 *       - Page d'accueil
 *       - Module de cryptage / décryptage avec clé déterminée
 *       - Module de cryptanalyse avec texte crypté et clé indéterminée 
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



/*
 *  
 */
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


/*
 *  Evenement : Clic sur le bouton de redémarrage de l'analyse
 *  Résultat : Nouvelle clé -> "A" et recalcul des fréquences
 */
$( "#restart" ).on("click", function() {
    if ( $( "#cryptedText" ).val() != '') {
        $( "#cle_trouvee" ).html('<span id="focusedChar" style="font-weight: bold;">A</span>');
        calculFrequences();
    }
});


/*
 *  Evenement : Clic sur le bouton d'affichage du résultat
 *  Résultat : Ouverture d'une fenetre modale contenant le texte décrypté avec la clé déterminée par l'utilisateur
 */
$('#modalResultat').on('show.bs.modal', function(event) {
    if ( $( "#cle_trouvee" ).children().length > 0 ) {
        var cle = "";
        $( "#cle_trouvee" ).children().each(function(){
            cle += $(this).html();
        });
        texteFinal = crypter($( "#cryptedText").val(), cle, false);
        $( "#decryptedText" ).html(texteFinal.texte);
    }
    else {
        event.preventDefault();
        // TO DO : Bloquer la fenetre modale
    }
});


/*
 *  Evenvement : Redimensionnement de la fenetre
 *  Resultat : Retracer les histogrammes avec les memes données mais avec les nouvelles dimensions
 */
$( window ).resize(function() {
    // TO DO : Modifier la hauteur de l'histogramme par media query ?
    chart.draw(data, options);
});


/*
 *  Evenement : Lorsque l'application est totalement chargée par le navigateur
 *  Résultat :
 *       - On initialise l'indice de coincidence théorique (à défaut : français)
 *       - On lance le petit effet sur le titre (charcycle)
 */
$( document ).ready(function() {
    $( "#ic_theorique" ).html( indice_coincidence['fr'] );

    $( "#titre" ).css("visibility", "visible");
    $(this).charcycle({
        'target': '#titre',
        'speed': 20
    }); 
});


/*
 *  Déploiement de la fenetre de cryptage de texte dans le module de cryptanalyse
 *  si l'utilisateur n'a pas crypté son texte au préalable
 */
$( "#oubli" ).on("click", function() {
    $( "#div_cryptage" ).toggle();
});


/*
 *  Evenement : Nouveau choix de langage du texte à décrypter
 *  Résulat :
 *       - On change l'indice de coincidence théorique
 *       - On redessine l'histogramme des fréquences théoriques
 */
$( "#menu_langue" ).on("change", function() {
    $( "#ic_theorique" ).html( indice_coincidence[$(this).val()] );

    var frequences_theoriques = frequences[$(this).val()];
    for (var i = 0; i < TAILLE_ALPHABET; i++) {
        data.setValue(i, 1, frequences_theoriques[i]);
    }
    chart.draw(data, options);
});