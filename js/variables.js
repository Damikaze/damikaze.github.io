var TAILLE_ALPHABET = 26;
var TAILLE_APERCU = 40;
var ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var TWINKLE_OPTIONS = {
    'effect' : "drops",
    'effectOptions' : {
        'color' : 'rgba(255, 255, 255, 0.8)',
        'radius' : 100,
        'duration' : 2000,
        'count' : 10
    }
}

var POPUP_TEXT = "";

var regex_mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
var texteADecrypter = ""; // memoriser pour savoir s'il faut lancer une nouvelle analyse

var app_language = "fr";
var text_language = "fr";

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

var textes_statiques = {
    'fr': {
        // Général
        'title': "Chiffre de Vigenère : l'application",
        'module-1-name': "Crypter / Décrypter",
        'module-2-name': "Cryptanalyse",
        'back-home': " Retour à la page d'accueil",
        'small-screen': "Vous êtes sur mobile ou tablette ? Retournez l'écran pour profiter au mieux de l'application. Sur ordinateur, élargissez la fenêtre !",
        'what-is-it': "Le ' chiffre de Vigenère ' ? C'est quoi ?",
        'french': "Français",
        'english': "Anglais",
        'credits-1': "Images récupérées sur ",
        'credits-2': " sous licence ",
        'author': "Réalisé par ",
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
        'popup': "Je remarque des caractères illégaux dans le texte. Votre texte ne doit pas être encore crypté. Voulez-vous y remédier ? \
            \n\nOK : C'est un oubli. Je veux crypter le texte. \nAnnuler : C'est une coquille. Nettoyez le texte, et analysez.",
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
        // Modal de présentation
        'modal-pres-title': "Présentation du chiffre de Vigenère",
        'pres-p1': "Voilà ! C'est simple le chiffre de Vigenere. Des questions ? Bon, on va expliquer plus en détails.",
        'pres-t1': "Définition et principe",
        'pres-p2': "Le chiffre (ou chiffrement) de Vigenère est un procédé de cryptographie <strong>polyalphabétique</strong>, c'est-à-dire qu'on utilise un mot appelé <strong>\"clé\"</strong> de <strong>plusieurs</strong> lettres pour réaliser le chiffrement (ici, c'est le mot \"CODE\"). On procède à un décalage de l'alphabet déterminé par chaque caractère de la clé. Par convention :",
        'pres-list': "<li>'A' correspond à un décalage nul, </li>\
            <li>'B' un décalage de 1,</li>\
            <li>'C' un décalage de 2, et ainsi de suite ... </li>",
        'pres-p3': "Exemple du tableau : pour la 1ère lettre 'M', je code avec un 'C' (décalage de 2 lettres), et la lettre devient un 'O' (M -> N -> O). Et si, en décalant, on déborde et qu'on va plus loin que le 'Z', et bien, on repart pour un tour : Y -> Z -> A -> B...",
        'pres-p4': "Ce principe de décalage implique qu'une lettre est associée à une et une seule autre lettre par cette transformation. Or, l'interêt du chiffre de Vigenère est que deux mêmes lettres venant du texte à crypter ne donnent pas toujours les mêmes lettres dans le texte crypté et vice versa.",
        'pres-t2': "Pourquoi ?",
        'pres-p5': "Tout simplement parce que deux mêmes lettres du texte initial ne seront pas forcément codées avec la même lettre de la clé selon leur position dans ce texte ! A l'inverse, deux lettres différentes chiffrées par deux caractères distincts de la clé peuvent, avec un peu de chance, aboutir à la même lettre dans le texte crypté (regardez les colonnes orange).",
        'pres-t3': "Comment décrypter alors ?",
        'pres-p6': "Si vous utilisez une clé d'une seule lettre, le décalage appliqué est identique pour toutes les lettres, et donc chaque lettre de l'alphabet dans le texte crypté correspond à une seule et unique lettre de l'alphabet dans le texte initial. Tout devient simple alors : trouvez la lettre qui apparaît le plus dans le texte crypté, et on est presque sûr qu'elle correspond à la lettre la plus fréquente théoriquement dans la langue du texte à déchiffrer. Une petite soustraction, et on a la \"taille\" de ce décalage unique ! Pour votre culture (et c'est cadeau), ce chiffrage monoalphabétique s'appelle <strong>chiffre de César.</strong>",
        'pres-p7': "Pour le chiffre de Vigenère (avec une clé de N lettres), l'astuce va etre la même, mais il va falloir au préalable deviner la taille de la clé. Et si on devine juste, on sait alors que, périodiquement (1 fois sur N), une lettre du texte crypté correspond toujours à la même lettre du texte à déchiffrer puisqu'elle a été codée avec le même caractère de la clé, (regardez les colonnes vertes).",
        'pres-t4': "J'ai toujours pas compris !",
        'pres-p8': "Et bien, il vous reste ... <a href=\"http://fr.wikipedia.org/wiki/Chiffre_de_Vigenere\" target=\"_blank\">la page Wikipédia !</a> On ne sait jamais.",
        // Modal du résultat final
        'modal-result-title': "Résultat de la cryptanalyse",
        'res-p1': "Avec la clé",
        'res-p2': "voici ce que donne le texte décrypté :",
        'add-space': "Ajoutez des espaces pour aérer et vérifier que le texte est correct.",
        'thank-you': "Merci d'avoir utilisé notre application !",
        // Modal d'aide à l'utilisation
        'modal-help-title': "Comment utiliser l'application de cryptanalyse ?",
        'help-t1': "Le texte à analyser",
        'help-t2': "Le tableau de la clé",
        'help-t3': "L'histogramme",
        'help-t4': "Comment manipuler l'histogramme ?",
        'help-t5': "Les résultats / L'aperçu",
        'help-p1': "Copiez-collez dans la zone de texte principale le texte crypté, l'analyse sera lancée automatiquement. Si le texte n'est pas crypté, depliez le panneau juste au-dessus.",
        'help-p2': "Les fonctionnalités résumées en 4 points pour percer la clé de chiffrement:\
            <ul class=\"list-unstyled\">\
                <li>1) Ajouter ou retirer une lettre en fin de clé</li>\
                <li>2) La clé, avec en gras, la lettre ciblée de la clé, pour laquelle on affiche les fréquences d'apparition des lettres du texte codées avec cette lettre de la clé</li>\
                <li>3) Déplacer le focus sur l'une des lettres de la clé, à gauche ou à droite</li>\
                <li>4) Les indices de coincidence, l'un théorique de la langue du texte crypté, l'autre propre au texte crypté. Ils représentent la probabilité que 2 lettres choisies au hasard dans le texte soient identiques</li>\
            </ul>",
        'help-p3': "Il représente, en bleu, les fréquences d'apparition des lettres dans la langue du texte (modifiable via le menu déroulant en haut de page), et en rouge, les fréquences \"partielles\" du texte crypté, \"partielles\" car uniquement les lettres du texte crypté qui sont en principe chiffrés par le caractère ciblé de la clé, choisi dans le tableau.",
        'help-p4': "Vous pouvez manipuler l'histogramme pour superposer les deux histogrammes et deviner la valeur du caractère de la clé ciblé. En bougeant l'histogramme rouge, la caractère ciblé se modifie aussi. Voici les possibilités d'actions à exécuter sur l'histogramme :",
        'help-p5': "Dès que vous pensez avoir trouvé la bonne clé, vous pouvez retrouver le résultat complet en appuyant sur le bouton vert en-dessous de la zone de texte. Mais vous déjà voir un apercu du déchiffrage en direct en-dessous de l'histogramme, avec en gras les caractères du début du texte chiffrés par le caractère de la clé que vous avez ciblé.",
        // Modal de cryptage de secours
        'modal-crypt-title': "Analyser un texte crypté, c'est mieux !",
        'crypt-paragraph': "Rentrez le texte original dans la zone de texte ci-dessous, et la clé de chiffrage dans le champ correspondant. Nous nous occupons du reste : formattage, cryptage, et analyse !",
        // Modal de statistiques
        'modal-stats-title': "Pour vous aiguiller sur la bonne taille de clé",
        'stats-t1': "Indices de coincidence selon la taille de la clé",
        'stats-t2': "Le devin",
        'stats-p1': "Si les courbes rouge et bleue sont proches à une abscisse N, alors il est très probable que la clé soit de taille N. A vous désormais de trouver les bons caractères !",
        'stats-p2': "Une dernière statistique, un peu moins fiable et que nous appelerons \"formule du devin\", est calculée à partir de l'équation ci-dessous.",
        'stats-p3': "Alors, devin, dites-nous tout !",
        'stats-p4': "Je vois, je vois ... une taille de la clé de chiffrement d'environ",
        'stats-p5': "caractères. J'ai bon ?"
    },
    'en': {
        // Général
        'title': "Vigenere cipher : the application",
        'module-1-name': "Crypt / Decrypt",
        'module-2-name': "Cryptanalysis",
        'back-home': " Back to home page",
        'small-screen': "You are on a phone or a pad ? Turn your screen vertically to enjoy the application at its best. On computer, widen the window !",
        'what-is-it': "What do you mean by ' Vigenere cipher ' ?",
        'french': "French",
        'english': "English",
        'credits-1': "Images imported from ",
        'credits-2': " under license ",
        'author': "Developped by ",
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
        'popup': "I detect non-alphabetic characters in your text. It may not have been encrypted. Do you want to correct that ? \
            \n\nOK : I did forget. I want to cipher the text. \nAnnuler : That's a misprint. Clean the text, and analyse it.",
        'restart-analysis': " Restart the analysis",
        'show-results': " Show the decrypted text",
        'analysis-legend': "Analysis",
        'current-key': "Keyword to guess",
        'key-size': "Size",
        'change-character': "Move focus on key character",
        'indices': "Indexes of coincidence",
        'preview-label': "Below is the beginning of the decrypted text if the current key is correct ...",
        'stats-label': "Statistic tools",
        'more-stats': "More statistics !",
        // Modal de présentation
        'modal-pres-title': "Introduction to the Vigenere cipher",
        'pres-p1': "Here is the Vigenere cipher. Simple, isn't it ? Well, let's explain it more in details.",
        'pres-t1': "Definition and principle",
        'pres-p2': "The Vigenere cipher is a <strong>polyalphabetic</strong> encrypting method, that is to say it is based on a <strong>\"keyword\"</strong> of <strong>many</strong> letters (in the table above, the keyword is \"CODE\") to acheive the encryption. The process consists of a shift of each letter of the plaintext, along a number of places determined by characters of the keyword. By convention :",
        'pres-list': "<li>'A' means a void shift, </li>\
            <li>'B' means a shift of 1, </li>\
            <li>'C' means a shift of 2, and so on ... </li>",
        'pres-p3': "For instance in the table : for the 1st letter of the plaintext 'M', I'm encrypting with a 'C' (therefore a shift of 2), and it would become an 'O' (M -> N -> O). And if the shifting goes over the 'Z', then, we start for another lap : Y -> Z -> A -> B...",
        'pres-p4': "The process of shifting implies that a first letter ciphered by a second one always leads to a unique third letter, and the same goes for the deciphering. Though, the interest of the Vigenere cipher is that two same letters from the plaintext do not always end up at identical letters in the ciphertext and conversely.",
        'pres-t2': "Why ?",
        'pres-p5': "Simply because two same letters from the plaintext won't inevitably ciphered with the same character of the keyword according to their place in the text ! On the contrary, two different letters ciphered by two different letters of the keyword can, with a bit of luck, lead to the same letter in the ciphertext (see the orange columns in the table).",
        'pres-t3': "How to decipher then ?",
        'pres-p6': "If you choose to encrypt you text with an one-letter keyword, then the applied shift is identical for all the characters of the plaintext, therefore every letter of the alphabet in the ciphertext ties in with one and only one letter of the alphabet in the plaintext. \
            The rest becomes very simple : find the most present letter in the ciphertext, and we can almost be sure it's the encryption of the most theoretically frequent letter in the language of the text to decrypt. A little substraction, and we get the \"size\" of this unique shift ! For your acknowledge (it's free !), this monoalphabetic encrypting method is called <strong>Caesar cipher.</strong>",
        'pres-p7': "To break the Vigenere cipher (with a N-letter keyword), the trick is the same, but you should guess first the keyword's length. Once we guessed right, we know that, periodically (1 out of N times), a character from the ciphertext is always the encryption of the same letter from the plaintext, à déchiffrer since it was ciphered by the same character of the keyword (look at the green columns).",
        'pres-t4': "I still don't understand !",
        'pres-p8': "Well, have a look at ... <a href=\"https://en.wikipedia.org/wiki/Vigenere_cipher\" target=\"_blank\">the Wikipedia article !</a> Who knows ? ...",
        // Modal du résultat final
        'modal-result-title': "Cryptanalysis results",
        'res-p1': "With the keyword",
        'res-p2': "below is how seems the deciphered text :",
        'add-space': "Add spaces in the field to lighten the text and check if it's correct.",
        'thank-you': "Thanks for using our application !",
        // Modal d'aide à l'utilisation
        'modal-help-title': "How to use the application for cryptanalysis ?",
        'help-t1': "The text to analyse",
        'help-t2': "The keyword table",
        'help-t3': "The histogram",
        'help-t4': "How to handle the histogram ?",
        'help-t5': "The results / The preview",
        'help-p1': "Paste the ciphertext in the appropriate text area, this analysis will automatically start. If you forgot to encrypt the text, click on the button just below.",
        'help-p2': "All the features summarized in 4 points to break the cipher key :\
            <ul class=\"list-unstyled\">\
                <li>1) Add or remove a letter at the end of the keyword</li>\
                <li>2) The keyword area, with a letter in bold which has focus on it, pour laquelle on affiche les fréquences d'apparition des lettres du texte codées avec cette lettre de la clé</li>\
                <li>3) Move the focus either on the preceding or the following letter of the keyword</li>\
                <li>4) Indexes of coincidence, the first one is this of the ciphertext, the second one is this of the text's language. They both stand for the probability that 2 letters selected at random in a text are identical</li>\
            </ul>",
        'help-p3': "The series of blue columns stands for the appearance frequency of alphabet letters in the language of the text (which you can change through the menu at the top of page). \
            The red one shows the \"partial\" frequencies of the ciphertext, by \"partial\" we mean frequencies computed on the supposed ciphertext's letters encrypted by the keyword's character which has the focus.",
        'help-p4': "You can handle the chart in order to superimpose the two series and guess the value of the focused keyword's character. By moving the red columns, the focused character is changing too. Here are the different ways to handle the chart, according to your device.",
        'help-p5': "As soon as you think you guessed the correct keyword, you can fully decrypt the text by clicking on the green button. Meanwhile, you get a live preview of the decryption, with in bold the supposed ciphertext's letters encrypted by the keyword's character which has the focus. \
            Finally, you're able to restart analysis and get more statistic information to find the right keyword.",
        // Modal de cryptage de secours
        'modal-crypt-title': "Analysing a crypted text, that's better !",
        'crypt-paragraph': "Type the original text in the field just below, and the cipher key in the appropriate field. We deal with the rest : text formatting, ciphering, et analysis !",
        // Modal de statistiques
        'modal-stats-title': "To direct you towards the good keyword's length",
        'stats-t1': "Indexes of coincidence depending on keyword's length",
        'stats-t2': "The psychic",
        'stats-p1': "If the red and blue charts are close somewhere above the X axis (for a length equal to N), then the keyword is very bound to be N. From now on you should find the right characters !",
        'stats-p2': "One last statistic, a bit less reliable so that we'll call it \"psychic's formula\", is computed thanks to the mathematic expression just below.",
        'stats-p3': "Tell us all, psychic !",
        'stats-p4': "I see, I see ... a keyword whose length is around",
        'stats-p5': "characters. Did I guess right ?"
    }
};