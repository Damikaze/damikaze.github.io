/* TO DO : 
    (swipe ? plus tard ...)
    Améliorer la fenetre modale de résultat (afficher la clé)
    Surligner les lettres en cours de modification dans le décryptage
    Partie pédagogie : explications, gifs.
*/

/*
 *  Evenement : Tour de molette sur l'histogramme
 *  Resultat :
 *       - Décalage de l'histogramme des fréquences du texte (gauche ou droite)
 *       - Modification du caractère de la clé sur lequel il y a le focus
 *       - Nouvel apercu du decryptage
 */
$('#chart_div').on('wheel mousewheel', function(event) {

    if ($("#cle_trouvee").children().length == 0) {
        return;
    }
    
    // On cherche selon le navigateur, de trouver un attribut de l'evenement intercepté
    // qui nous permet de déterminer le sens du scroll
    var aGauche;
    if (event.originalEvent.wheelDeltaY != undefined) {
        aGauche = (event.originalEvent.wheelDeltaY > 0) ? true : false;
    }
    else if (event.originalEvent.deltaY != undefined) {
        aGauche = (event.originalEvent.deltaY < 0) ? true : false;
    }
    else if (console) {
        console.warn("L'évènement mousewheel est mal supporté sur le navigateur actuellement utilisé");
    }
        
    if ( aGauche ) {
        decalageHistogrammeGauche();
    }
    else {
        decalageHistogrammeDroite();
    }

    // On échappe le scroll de la page si elle déborde de l'écran.
    event.preventDefault();
    chart.draw(data, options);
    apercuDecryptage();
});

/*
 *  Evenement : Clic sur le bouton de gauche au-dessus du graphique
 *  Resultat :
 *       - Décalage de l'histogramme des fréquences du texte à gauche
 *       - Modification du caractère de la clé sur lequel il y a le focus
 *       - Nouvel apercu du decryptage
 */
$('#btn_decalage_gauche').on('click', function() {
    if ($("#cle_trouvee").children().length == 0) { return; }
    
    decalageHistogrammeGauche();
    chart.draw(data, options);
    apercuDecryptage();
});

/*
 *  Evenement : Clic sur le bouton de droite au-dessus du graphique
 *  Resultat :
 *       - Décalage de l'histogramme des fréquences du texte à droite
 *       - Modification du caractère de la clé sur lequel il y a le focus
 *       - Nouvel apercu du decryptage
 */
$('#btn_decalage_droite').on('click', function() {
    if ($("#cle_trouvee").children().length == 0) { return; }
    
    decalageHistogrammeDroite();
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

$(".cle_gauche").on('click', function() {
    decalageGauche();
    calculFrequences();
    apercuDecryptage();
});

$(".cle_droite").on('click', function() {
    decalageDroite();
    calculFrequences();
    apercuDecryptage();
});

$(".cle_plus").on('click', function() {
    var tailleCle = $('#cle_trouvee').children().length;
    if (tailleCle >= 1 && tailleCle < $("#cryptedText").val().length ) {
        $('#cle_trouvee').append('<span>A</span>');
        calculFrequences();
        apercuDecryptage();
    }
});

$(".cle_moins").on('click', function() {
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
    $("#home").hide(500);

    // On nettoie les champs du module avant de commencer
    $("#input").val('');
    $("#cle1").val('');
    $("#output").val('');

    $("#part1").show(500);
});

$( "#goto_part2" ).on("click", function() {
    $("#home").hide(500);

    // On nettoie les champs du module avant de commencer
    $("#cryptedText").val('').trigger("keyup");
    $("#cle2").val('');

    $("#part2").show(500);
    setTimeout(function() { chart.draw(data, options) }, 500);
});

$( ".goto_home" ).on("click", function() {
    $(this).parent().parent().hide(500);
    $("#home").show(500);
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

$(".slider").slider().slider("pips").slider("float");