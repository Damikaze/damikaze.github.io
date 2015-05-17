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

/*
 *  Procédure de décalage des fréquences du texte crypté d'un cran à gauche
 *  et modification du caractère de la clé ciblé
 */
function decalageHistogrammeGauche() {
    // Scroll vers le haut : on décale l'histogramme à gauche
    var tmp = data.getValue(0, 2);
    for (var i = 0; i < (TAILLE_ALPHABET - 1); i++) {
        data.setValue(i, 2, data.getValue(i + 1, 2));
    }
    data.setValue((TAILLE_ALPHABET - 1), 2, tmp);

    // On modifie le caractère avec focus de la clé : A -> B
    var caractereActif = $("#focusedChar").html();
    var caractereSuivant = alphabet.charAt( mod(alphabet.indexOf(caractereActif) + 1, TAILLE_ALPHABET) );
    $( "#focusedChar" ).html( caractereSuivant );

    // On rend visible ce décalage des fréquences à l'écran
    chart.draw(data, options);
}

/*
 *  Procédure de décalage des fréquences du texte crypté d'un cran à droite
 *  et modification du caractère de la clé ciblé
 */
function decalageHistogrammeDroite() {
    // Scroll vers le bas : on décale l'histogramme à droite
    var tmp = data.getValue((TAILLE_ALPHABET - 1), 2);
    for (var i = 0; i < (TAILLE_ALPHABET - 1); i++) {
        data.setValue((TAILLE_ALPHABET - 1) - i, 2, data.getValue((TAILLE_ALPHABET - 1) - (i + 1), 2));
    }
    data.setValue(0, 2, tmp);

    // On modifie le caractère avec focus de la clé : B -> A
    var caractereActif = $("#focusedChar").html();
    var caractereSuivant = alphabet.charAt( mod(alphabet.indexOf(caractereActif) - 1, TAILLE_ALPHABET) );
    $( "#focusedChar" ).html( caractereSuivant );

    // On rend visible ce décalage des fréquences à l'écran
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
    }
}

/*
 *  Procédure de décryptage du début du texte (40 premiers caractères max)
 */
function apercuDecryptage() {
    var cle = "";
    $( "#cle_trouvee" ).children().each(function() {
        cle += $(this).html();
    });

    texteFinalDebut = crypter($( "#cryptedText").val().substr(0,40), cle, false);
    $( "#apercu" ).val(texteFinalDebut.texte);
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