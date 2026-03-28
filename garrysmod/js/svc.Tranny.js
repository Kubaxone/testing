var languageCache = {};
var languageCurrent = "";
var languageData = {}; // stores loaded language JSON

angular.module("tranny", [])

.directive("ngTranny", function($parse) {
    return function(scope, element, attrs) {
        var strName = "";
        var strSuffix = "";

        var updateElement = function(str) {
            if ("placeholder" in element[0]) {
                if (element.attr("placeholder") != str)
                    element.attr("placeholder", str);
            } else if (element.text() != str) {
                element.text(str);
            }
        };

        var update = function() {
            var text = strName + (strSuffix ? " " + strSuffix : "");

            // Try to get text from loaded language
            var outStr_old = languageCache[strName] || language.Update(strName, function(outStr) {
                languageCache[strName] = outStr;
                var updatedText = outStr + (strSuffix ? " " + strSuffix : "");
                updateElement(updatedText);
            });

            if (!outStr_old) {
                // fallback for missing keys: make readable
                outStr_old = strName.replace(/_/g, ' ');
                outStr_old = outStr_old.replace(/\b\w/g, c => c.toUpperCase());
            }

            var updatedText = outStr_old + (strSuffix ? " " + strSuffix : "");
            updateElement(updatedText);
        };

        scope.$watch(attrs.ngTranny, function(value) {
            var parts = value.split(" ");
            strName = parts.shift();
            strSuffix = parts.join(" ");
            update();
        });

        scope.$on("languagechanged", function() {
            if (languageCurrent != gScope.Language) {
                languageCurrent = gScope.Language;
                languageCache = {};
            }
            update();
        });
    };
})

// Keep your existing ngSeconds
.directive('ngSeconds', function($parse) {
    return function(scope, element, attrs) {
        scope.$watch(attrs.ngSeconds, function(value) {
            if (value < 60)
                return element.text(Math.floor(value) + " sec");
            if (value < 60 * 60)
                return element.text(Math.floor(value / 60) + " min");
            if (value < 60 * 60 * 24)
                return element.text(Math.floor(value / 60 / 60) + " hr");
            element.text("a long time");
        });
    };
});

// ==============================
// LANGUAGE LOADER
// ==============================
var language = {
    Update: function(key, callback) {
        var text = languageData[key];
        if (text) {
            callback(text);
            return text;
        }
        return null;
    },
    Load: function(langCode) {
        fetch(`js/lang/${langCode}.json`)
            .then(res => res.json())
            .then(data => {
                languageData = data;
                languageCache = {};
                angular.element(document.body).scope().$broadcast("languagechanged");
            })
            .catch(err => console.error("Failed to load language:", err));
    }
};

// Example: load English by default
language.Load("en");
