/*
 *  Démarrage de l'API Google pour l'histogramme des fréquences
 */
google.load('visualization', '1.0', {'packages':['corechart']});
google.setOnLoadCallback(dessineHistogrammeInitial);

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

/*
 *  Prototype de chaine Javascript pour échapper les accents des lettres majuscules
 */
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
 *  Fonction interne de calcul de modulo pour toujours retourner un modulo positif  
 *  @n : dividende
 *  @m : diviseur
 */
function mod(n, m) { return ((n % m) + m) % m; }

/*
 *  Fonction principale de cryptage / decryptage
 *  @inputText : texte à crypter ou décrypter
 *  @inputKey : clé de chiffrage
 *  @sensCryptage : booléen, valeur : vrai -> cryptage, faux -> décryptage
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
 *  Méthode de calcul des fréquences : à chaque modification de la taille de la clé
 */
function calculFrequences() {
    var cle = $("#cle_trouvee").children();
    var tailleCle = cle.length;

    tableFrequences = new Array(tailleCle);
    for (var t = 0; t < tailleCle; t++) {
        tableFrequences[t] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }

    var texteCrypte = $("#cryptedText").val();
    var tailleTexte = texteCrypte.length;

    if (tailleCle > 0) {
        for (var i = 0; i < texteCrypte.length; i++) {
            var positionCaractere = alphabet.indexOf(texteCrypte.charAt(i));
            tableFrequences[ mod(i, tailleCle) ][ positionCaractere ]++;
        }
    }

    var icTexte = 0; // indice de coincidence du texte
    var icLangue = indice_coincidence[ $("#menu_langue").val() == null ? 'fr' : $("#menu_langue").val() ];

    for (var t = 0; t < tailleCle; t++) {
        // Moyenne des fréquences par tableau associé à un caractère de clé
        var icTextePartiel = 0;
        var nbLettresAnalysees = Math.floor(tailleTexte / tailleCle) + (t <= mod(tailleTexte, tailleCle) ? 1 : 0);

        for (var j = 0; j < TAILLE_ALPHABET; j++) {
            tableFrequences[t][j] = (tableFrequences[t][j] / nbLettresAnalysees) * 100; // en %
            icTextePartiel += Math.pow(tableFrequences[t][j] / 100, 2);
        }

        icTexte += icTextePartiel / tailleCle;
    }

    $("#ic_texte").html(icTexte.toPrecision(3));

    if (Math.abs(icTexte - icLangue) <= 0.0075) {
        $("#ic_texte").parent().animate(
            {'background-color': 'blue'}, 300, function(){
                $(this).animate({'background-color': 'transparent'}, 1000);
        });
    }
}

/*
 *  Récupération des fréquences d'apparition des lettres codées par le caractère de la clé
 *  ciblé, et affichage des fréquences en prenant compte de la valeur de ce caractère (= décalage)
 */
function recupererEtAfficherFrequences() {
    if ( $("#focusedChar")[0] !== undefined ) {
        var caractereCible = $("#focusedChar");
        var positionCaractereCibleDansAlphabet = alphabet.indexOf( caractereCible.html() );

        var positionCaractereCibleDansCle = $("#cle_trouvee").children().index( caractereCible );
        var frequences = tableFrequences[positionCaractereCibleDansCle];
    }
    else {
        var positionCaractereCibleDansAlphabet = 0;
        var frequences = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }

    for (var i = 0; i < TAILLE_ALPHABET; i++) {
        data.setValue(i, 2, frequences[ mod(i + positionCaractereCibleDansAlphabet, TAILLE_ALPHABET) ]);
    }

    chart.draw(data, options);
}

/*
 *  Procédure de déplacement du focus sur le caractère de la clé à déterminer
 *  à gauche de celui déjà ciblé
 */
function focusCaracterePrecedent() {
    var focusedChar = $("#focusedChar");
    var predecesseur = focusedChar.prev();

    // Si le pointeur sur le predecesseur existe, on décale
    if (predecesseur.length != 0) { 

        predecesseur.attr('id', 'focusedChar');
        predecesseur.css('font-weight', 'bold');

        focusedChar.attr('id', '');
        focusedChar.css('font-weight', 'normal');

        recupererEtAfficherFrequences();
    }
}

/*
 *  Procédure de déplacement du focus sur le caractère de la clé à déterminer
 *  à droite de celui déjà ciblé
 */
function focusCaractereSuivant() {
    var focusedChar = $( "#focusedChar" );
    var successeur = focusedChar.next();

    // Si le pointeur sur le successeur existe, on décale
    if (successeur.length != 0) { 

        successeur.attr('id', 'focusedChar');
        successeur.css('font-weight', 'bold');

        focusedChar.attr('id', '');
        focusedChar.css('font-weight', 'normal');

        recupererEtAfficherFrequences();
    }
}

/*
 *  Procédure de décalage des fréquences du texte crypté d'un cran à gauche
 *  et modification du caractère de la clé ciblé
 */
function decalageHistogrammeGauche() {
    // On modifie le caractère avec focus de la clé : A -> B
    var caractereActif = $("#focusedChar").html();
    var caractereSuivant = alphabet.charAt( mod(alphabet.indexOf(caractereActif) + 1, TAILLE_ALPHABET) );
    $( "#focusedChar" ).html( caractereSuivant );

    // On rend visible ce décalage des fréquences à l'écran
    recupererEtAfficherFrequences();
}

/*
 *  Procédure de décalage des fréquences du texte crypté d'un cran à droite
 *  et modification du caractère de la clé ciblé
 */
function decalageHistogrammeDroite() {
    // On modifie le caractère avec focus de la clé : B -> A
    var caractereActif = $("#focusedChar").html();
    var caractereSuivant = alphabet.charAt( mod(alphabet.indexOf(caractereActif) - 1, TAILLE_ALPHABET) );
    $( "#focusedChar" ).html( caractereSuivant );

    // On rend visible ce décalage des fréquences à l'écran
    recupererEtAfficherFrequences();
}

/*
 *  Procédure de décryptage du début du texte (40 premiers caractères max)
 */
function apercuDecryptage() {
    // On parse la clé
    var cle = $( "#cle_trouvee" ).children();
    if ( cle.length > 0) {
        var cleParsee = "";
        cle.each(function() {
            cleParsee += $(this).html();
        });

        // On décrypte le début
        var texteFinalDebut = crypter($( "#cryptedText").val().substr(0, TAILLE_APERCU), cleParsee, false).texte;
        $( "#apercu" ).html("");

        var texteFinalEclate = texteFinalDebut.split("");
        var positionCaractereCibleDansCle = cle.index( $("#focusedChar") );

        // On met en gras les caractères cryptés par le caractère de la clé ciblé
        for (i = 0; i < Math.min(texteFinalEclate.length, TAILLE_APERCU); i++) {
            if ( mod(i, cle.length) == positionCaractereCibleDansCle ) {
                $( "#apercu" ).append('<b>' + texteFinalEclate[i] + '</b>');
            }
            else {
                $( "#apercu" ).append('<span>' + texteFinalEclate[i] + '</span>');
            }
        }
    }
    else {
        $( "#apercu" ).html("");
    }
}

/*
 *  Appelle toutes les procédures nécessaires à un "décalage à gauche" demandé par l'utilisateur
 *      -  Décalage des fréquences numériques
 *      -  Mise à jour de l'histogramme affiché dans la page web
 *      -  Décryptage du début du texte
 */
function decalageHistoGaucheAvecApercu() {
    if ( $( "#cle_trouvee" ).children().length == 0) {
        return;
    }
    else {
        decalageHistogrammeGauche();
        apercuDecryptage();
    }
}

/*
 *  Appelle toutes les procédures nécessaires à un "décalage à droite" demandé par l'utilisateur
 *      -  Décalage des fréquences numériques
 *      -  Mise à jour de l'histogramme affiché dans la page web
 *      -  Décryptage du début du texte
 */
function decalageHistoDroiteAvecApercu() {
    if ( $( "#cle_trouvee" ).children().length == 0) {
        return;
    }
    else {
        decalageHistogrammeDroite();
        apercuDecryptage();
    }
}