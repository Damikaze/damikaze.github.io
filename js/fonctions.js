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
    freq_data = new google.visualization.DataTable();
    freq_data.addColumn('string', 'Lettres');
    freq_data.addColumn('number', 'Langue');
    freq_data.addColumn('number', 'Texte');

    // Données de base : fréquences théoriques des lettres
    // de l'ALPHABET dans la langue française
    var freq_rows = [];
    var frequences_theoriques = frequences[text_language];
    for (var i = 0; i < TAILLE_ALPHABET; i++) {
        freq_rows.push( [ALPHABET.charAt(i), frequences_theoriques[i], 0] );
    }
    freq_data.addRows(freq_rows);

    // Options globales de l'histogramme
    freq_options = {
        'title'  :  'Histogramme des fréquences',
        'legend' :  { 'position' : 'bottom' },
        'chartArea': {'width': '95%'},
        'height' :  350,
        'vAxis'  :  {
            'viewWindow' : { 'max' : 20 },
            'textPosition' : 'none'
        }
    };

    // Instancie, dessine l'histogramme et l'affiche dans la div "freq_chart_div"
    var div_freq_chart = document.getElementById('freq_chart_div');
    freq_chart = new google.visualization.ColumnChart(div_freq_chart);
    freq_chart.draw(freq_data, freq_options);


    // ######
    // ###### Diagramme des indices de coincidence ######
    // ######


    indice_data = new google.visualization.DataTable();
    indice_data.addColumn('number', 'Tailles de clé');
    indice_data.addColumn('number', 'Langue');
    indice_data.addColumn('number', 'Texte');

    var indice_rows = [];
    for (var i = 1; i <= 20; i++) {
        indice_rows.push( [i, indice_coincidence[text_language], 0] );
    }
    indice_data.addRows(indice_rows);

    indice_options = {
        'legend' :  { 'position' : 'bottom' },
        'chartArea': { 'width': '95%' },
        'vAxis' :  {
            'gridlines': { 'count' : 0 } ,
            'viewWindow' : { 'max' : 0.140 }
        }
    };

    var div_indice_chart = document.getElementById('indice_chart_div');
    indice_chart = new google.visualization.LineChart(div_indice_chart);
    indice_chart.draw(indice_data, indice_options);
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
        // On récupère le "i-ème" caractère du texte et on recupere sa position dans l'ALPHABET
        var positionCaractereTexte = ALPHABET.indexOf(cleanedText.charAt(i));
        // On récupère le "i-ème" caractère de la clé (modulo la taille de la clé) et on recupere sa position dans l'ALPHABET
        var positionCaractereCle = ALPHABET.indexOf(cleanedKey.charAt(mod(i, longueurCle)));

        if (sensCryptage == true) {
            // Lettre chiffrée : on somme les 2 positions, et on détermine la lettre à cet index
            texteSortie += ALPHABET.charAt(mod((positionCaractereTexte + positionCaractereCle), TAILLE_ALPHABET));
            //console.log(texteChiffre);
        }
        else {
            texteSortie += ALPHABET.charAt(mod((positionCaractereTexte - positionCaractereCle), TAILLE_ALPHABET));
        }
    }

    return {
        'texte' : texteSortie, 
        'cle': cleanedKey
    };
}

/*
 *  Méthode de calcul des fréquences : à chaque modification de la taille de la clé.
 *  Retourne un tableau de N tableaux, N étant la taille de la clé courante de l'analyse
 */
function calculFrequences() {
    var cle = $("#cle_trouvee").children();
    var tailleCle = cle.length;

    var texteCrypte = $("#cryptedText").val();
    var tailleTexte = texteCrypte.length;

    tableFrequences = prepareFrequences(tailleCle, texteCrypte);
    var icTexte = deduireIndiceTexte(tableFrequences, tailleTexte, tailleCle);
    var icLangue = indice_coincidence[ text_language ];

    $("#ic_texte").html(icTexte.toPrecision(3));

    if (tailleCle == 1) {
        var tailleCleDevinee = (tailleTexte * (icLangue - 1/26)) / (icLangue - icTexte + tailleTexte * (icTexte - 1/26));
        $("#tailleDevinee").html(Math.floor(tailleCleDevinee) + " et " + Math.ceil(tailleCleDevinee));
        $("#row-apercu").slideDown();
    }
    else if (tailleCle == 0) {
        $("#row-apercu").slideUp();
    }

    // Animation visuelle si l'indice de coincidence est proche de l'indice théorique
    // si l'écart est de moins de 10% de l'indice théorique
    if (Math.abs(icTexte - icLangue) <= 0.1 * icLangue) {
        $("#ic_texte").parent().animate({'background-color': 'blue'}, 300, function(){
            $(this).animate({'background-color': 'transparent'}, 600, function(){
                $(this).animate({'background-color': 'blue'}, 300, function(){
                    $(this).animate({'background-color': 'transparent'}, 600, function(){
                    });
                });
            });
        });
    }
}

function prepareFrequences(longueurCle, texte) {
    tabFreq = new Array(longueurCle);

    for (var t = 0; t < longueurCle; t++) {
        tabFreq[t] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }

    if (longueurCle > 0) {
        for (var i = 0; i < texte.length; i++) {
            var positionCaractere = ALPHABET.indexOf(texte.charAt(i));
            tabFreq[ mod(i, longueurCle) ][ positionCaractere ]++;
        }
    }
    return tabFreq;
}

function deduireIndiceTexte(tabFreq, tailleTexte, tailleCle) {
    var icTexte = 0;

    for (var t = 0; t < tailleCle; t++) {
        // Moyenne des fréquences par tableau associé à un caractère de clé
        var icTextePartiel = 0;
        var nbLettresAnalysees = Math.floor(tailleTexte / tailleCle) + (t <= mod(tailleTexte, tailleCle) ? 1 : 0);

        for (var j = 0; j < TAILLE_ALPHABET; j++) {
            icTextePartiel += (tabFreq[t][j] * (tabFreq[t][j] - 1)) /
                (nbLettresAnalysees * (nbLettresAnalysees - 1));
            tabFreq[t][j] = (tabFreq[t][j] / nbLettresAnalysees) * 100; // en %
        }

        icTexte += icTextePartiel / tailleCle;
    }

    return icTexte;
}

/*
 * Prepare les données pour le graphe optionnel des valeurs des indices de coincidence
 * pour toutes les tailles de clé entre 1 et 20
 */
function calculeIndicesCoincidenceParTaille() {
    var texte = $("#cryptedText").val();
    var icLangue = indice_coincidence[ text_language ];

    if ( texte != '' ) {
        for (var tailleCle = 1; tailleCle <= 20; tailleCle++) {
            var tabFreqSimu = prepareFrequences(tailleCle, texte);
            var icTexteSimu = deduireIndiceTexte(tabFreqSimu, texte.length, tailleCle);

            indice_data.setValue(tailleCle - 1, 1, icLangue);
            indice_data.setValue(tailleCle - 1, 2, icTexteSimu);
        }
    }
    else {
        indice_data.setValue(tailleCle - 1, 1, icLangue);
        indice_data.setValue(tailleCle - 1, 2, 0);
    }

    indice_chart.draw(indice_data, indice_options);
}

/*
 *  Récupération des fréquences d'apparition des lettres codées par le caractère de la clé
 *  ciblé, et affichage des fréquences en prenant compte de la valeur de ce caractère (= décalage)
 */
function recupererEtAfficherFrequences() {
    if ( $("#focusedChar")[0] !== undefined ) {
        var caractereCible = $("#focusedChar");
        var positionCaractereCibleDansAlphabet = ALPHABET.indexOf( caractereCible.html() );

        var positionCaractereCibleDansCle = $("#cle_trouvee").children().index( caractereCible );
        var frequences = tableFrequences[positionCaractereCibleDansCle];
    }
    else {
        var positionCaractereCibleDansAlphabet = 0;
        var frequences = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }

    for (var i = 0; i < TAILLE_ALPHABET; i++) {
        freq_data.setValue(i, 2, frequences[ mod(i + positionCaractereCibleDansAlphabet, TAILLE_ALPHABET) ]);
    }

    freq_chart.draw(freq_data, freq_options);
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
    var caractereSuivant = ALPHABET.charAt( mod(ALPHABET.indexOf(caractereActif) + 1, TAILLE_ALPHABET) );
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
    var caractereSuivant = ALPHABET.charAt( mod(ALPHABET.indexOf(caractereActif) - 1, TAILLE_ALPHABET) );
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