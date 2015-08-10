var TAILLE_ALPHABET = 26;
var TAILLE_APERCU = 40;
var ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

var regex_mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
var texteADecrypter = ""; // memoriser pour savoir s'il faut lancer une nouvelle analyse

var premiereVisiteCryptanalyse = true;
var text_language = 'fr';

var freq_data; // Objet Google des données de l'histogramme
var freq_chart; // Objet Google de l'histogramme
var freq_options; // Objet des options de l'histogramme

var indice_data; // Objet Google des données de l'histogramme
var indice_chart; // Objet Google de l'histogramme
var indice_options; // Objet des options de l'histogramme

// la table des frequences : Un tableau de tableaux de 26 entiers,
// un de chaque par caractère de clé pour compter les fréquences d'apparation
// des lettres chiffrées avec le même caractère de clé
var tableFrequences;

// Pour toute nouvelle langue à ajouter, fournir les fréquences d'apparition des lettres,
// l'indice de coincidence théorique, et tous les éléments de texte de l'application
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
};

var indice_coincidence = {
    'fr': 0.0778,
    'en': 0.0667
};

var POPUP_TEXT = "Je remarque des caractères illégaux dans le texte. \
Votre texte ne doit pas être encore crypté. Voulez-vous y remédier ? \
\n\nOK : C'est un oubli. Je veux crypter le texte. \
\nAnnuler : C'est une coquille. Nettoyez le texte, et analysez.";

var textes_statiques = {
    'fr': {
        // Général
        'title': "Chiffre de Vigenère : l'application",
        'module-1-name': "Crypter / Décrypter",
        'module-2-name': "Cryptanalyse",
        'back-home': " Retour à la page d'accueil",
        'what-is-it': "Le ' chiffre de Vigenère ' ? C'est quoi ?",
        'french': "Français",
        'english': "Anglais",
        // Module 1
        'input-legend': "Informations d'entrée",
        'crypt': "Crypter",
        'decrypt': "Décrypter",
        'action-label': "Action :",
        'text-label': "Texte :",
        'key-label': "Clé :",
        'output-legend': "Texte de sortie",
        // Module 2
        'help': " Aide",
        'default-text-language': "Langue du texte ? (Défaut : fr)",
        'crypted-text-legend': "Texte crypté",
        'crypt-forget': "Je n'ai pas crypté mon texte !",
        'restart-analysis': " Recommencer l'analyse",
        'show-results': " Afficher le texte décrypté",
        'analysis-legend': "Analyse",
        'current-key': "Clé à deviner",
        'key-size': "Taille",
        'change-character': "Changer de caractère",
        'indices': "Indices de coïncidence",
        'preview-label': "Voici ce que donne le décryptage si la clé ci-dessus est correcte ...",
        'stats-label': "Outils statistiques",
        'more-stats': "Encore plus de statistiques !",
        'img-credits-1': "Images récupérées sur ",
        'img-credits-2': " sous licence ",
        // Modal de présentation
        'pres-p1': "Voilà ! C'est simple le chiffre de Vigenere. Des questions ? Bon, on va expliquer plus en détails.",
        'pres-t1': "Définition et principe",
        'pres-p2': "Le chiffre (ou chiffrement) de Vigenère est un procédé de cryptographie <strong>polyalphabétique</strong>, c'est-à-dire qu'on utilise un mot appelé <strong>\"clé\"</strong> de <strong>plusieurs</strong> lettres pour réaliser le chiffrement (ici, c'est le mot \"CODE\"). On procède à un décalage de l'alphabet déterminé par chaque caractère de la clé. Par convention :",
        'pres-list': "<li>'A' correspond à un décalage nul, </li><li>'B' un décalage de 1, </li><li>'C' un décalage de 2, et ainsi de suite ... </li>",
        'pres-p3': "Exemple du tableau : pour la 1ère lettre 'M', je code avec un 'C' (décalage de 2 lettres), et la lettre devient un 'O' (M -> N -> O). Et si, en décalant, on déborde et qu'on va plus loin que le 'Z', et bien, on repart pour un tour : Y -> Z -> A -> B...",
        'pres-p4': "Ce principe de décalage implique qu'une lettre est associée à une et une seule autre lettre par cette transformation. Or, l'interêt du chiffre de Vigenère est que deux mêmes lettres venant du texte à crypter ne donnent pas toujours les mêmes lettres dans le texte crypté et vice versa.",
        'pres-t2': "Pourquoi ?",
        'pres-p5': "Tout simplement parce que deux lettres du texte initial ne seront pas codées avec la même lettre de la clé selon leur position dans ce texte ! A l'inverse, deux lettres différentes chiffrées par deux caractères distincts de la clé peuvent, avec un peu de chance, aboutir à la même lettre dans le texte crypté (regardez les colonnes orange).",
        'pres-t3': "Comment décrypter alors ?",
        'pres-p6': "Si vous utilisez une clé d'une seule lettre, le décalage appliqué est identique pour toutes les lettres. Et tout devient simple : trouvez la lettre qui apparaît le plus dans le texte crypté, et on est presque sûr qu'elle correspond à la lettre la plus fréquente théoriquement dans la langue du texte à déchiffrer. Une petite soustraction, et on a la \"taille\" de ce décalage unique ! Pour votre culture (et c'est cadeau), ce chiffrage monoalphabétique s'appelle <strong>chiffre de César.</strong>",
        'pres-p7': "Pour le chiffre de Vigenère (avec une clé de N lettres), l'astuce va etre la même, mais il va falloir au préalable deviner la taille de la clé. Et si on devine juste, on sait alors que, périodiquement (1 fois sur N), une lettre du texte crypté correspond toujours à la même lettre du texte à déchiffrer puisqu'elle a été codée avec le même caractère de la clé, (regardez les colonnes vertes).",
        'pres-t4': "J'ai toujours pas compris !",
        'pres-p8': "Et bien, il vous reste ... <a href=\"http://fr.wikipedia.org/wiki/Chiffre_de_Vigenere\" target=\"_blank\">la page Wikipédia !</a> On ne sait jamais.",
    },
    'en': {
        // Général
        'title': "Vigenere cipher : the application",
        'module-1-name': "Crypt / Decrypt",
        'module-2-name': "Cryptanalysis",
        'back-home': " Back to home page",
        'what-is-it': "What do you mean by ' Vigenere cipher ' ?",
        'french': "French",
        'english': "English",
        // Module 1
        'input-legend': "Input information",
        'crypt': "Crypt",
        'decrypt': "Decrypt",
        'action-label': "Action :",
        'text-label': "Text :",
        'key-label': "Key :",
        'output-legend': "Output text",
        // Module 2
        'help': " Help",
        'default-text-language': "Text language ? (Default : fr)",
        'crypted-text-legend': "Crypted text",
        'crypt-forget': "I did not crypt my text",
        'restart-analysis': " Restart the analysis",
        'show-results': " Show the decrypted text",
        'analysis-legend': "Analysis",
        'current-key': "Key to guess",
        'key-size': "Size",
        'change-character': "Move focus on key character",
        'indices': "Indexes of coincidence",
        'preview-label': "Below is the beginning of the decrypted text if the current key is correct ...",
        'stats-label': "Statistic tools",
        'more-stats': "More statistics !",
        'img-credits-1': "Images imported from ",
        'img-credits-2': " under license ",
    }
};