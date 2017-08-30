//--- loads static text based on user language preference ---//
var StaticText = {};

StaticText.get = function (which) {
    "use strict";
    if (Login.language === "de") {
        if (which === "h-form-code") {
            return "Code eingeben";
        }
        if (which === "btn-signin") {
            return "Starten";
        }
        if (which === "ta-ans-ph") {
            return "Geben Sie Ihre Meinungen hier ein ...";
        }
        if (which === "h-start-welcome") {
            return "Willkommen";
        }
        if (which === "h-save-close") {
            return "Speichern und beenden";
        }
        if (which === "p-save") {
            return "Bitte klicken Sie Absenden, um die Evaluation zu speichern und beenden. Nach Beendigung hat dieser Code keine Gültigkeit mehr.";
        }
        if (which === "btn-save") {
            return "Absenden";
        }
        if (which === "h-success") {
            return "Vielen Dank";
        }
        if (which === "p-success") {
            return "Ihre Bewertung ist erfolgreich gespeichert.";
        }
        if (which === "p-error") {
            return "Fehler aufgetreten. Bitte versuchen Sie es später erneut.";
        }
    }
    if (Login.language === "en") {
        if (which === "h-form-code") {
            return "Enter code";
        }
        if (which === "btn-signin") {
            return "Start";
        }
        if (which === "ta-ans-ph") {
            return "Enter your opinions here ...";
        }
        if (which === "h-start-welcome") {
            return "Welcome";
        }
        if (which === "h-save-close") {
            return "Save and exit";
        }
        if (which === "p-save") {
            return "Please click Submit button to save and exit this evaluation. After exiting, the entered code has no more validity.";
        }
        if (which === "btn-save") {
            return "Submit";
        }
        if (which === "h-success") {
            return "Thank you";
        }
        if (which === "p-success") {
            return "Your evaluation has been saved successfully.";
        }
        if (which === "p-error") {
            return "Error occured. Please try again later.";
        }
    }
};
