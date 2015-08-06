var TAILLE_ALPHABET = 26;
var TAILLE_APERCU = 40;
var ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

var regex_mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
var texteADecrypter = ""; // memoriser pour savoir s'il faut lancer une nouvelle analyse

var app_language = 'fr';
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

/*var textes_statiques = {
    'fr': {
        // Général
        'title': ,
        'module_1_name': ,
        'module_2_name': ,
        'back_home': ,
        'what_is_it': ,
        // Module 1
        'input_legend': ,
        'crypt': ,
        'decrypt': ,
        'key_label': ,
        'output_legend': ,
        // Module 2
        'french': ,
        'english': ,
        'help': ,
        'crypt_panel_legend': ,
        'crypt_forget': ,
        'restart': ,
        'display_result': ,
        'redirect_help': ,
        'french': ,
    },
    'en': {

    }
};*/