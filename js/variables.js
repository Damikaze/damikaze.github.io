var TAILLE_ALPHABET = 26;
var TAILLE_APERCU = 40;
var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

var popup_text = "Il y a des caractères illégaux dans le texte. \
Il se peut que le texte ne soit pas encore crypté. Que voulez-vous faire ? \
\n\nOK : On nettoie le texte des caractères illégaux \
\nAnnuler : On crypte le texte en direct";

var regex_mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
var texteADecrypter; // memoriser pour savoir s'il faut lancer une nouvelle analyse

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

// la table des frequences : Un tableau de tableaux de 26 entiers,
// un de chaque par caractère de clé pour compter les fréquences d'apparation
// des lettres chiffrées avec le même caractère de clé
var tableFrequences;