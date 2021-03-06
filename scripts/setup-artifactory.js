define(["require", "exports", "VSS/SDK/Services/ExtensionData", "q"], function (require, exports, ExtensionData, Q) {

    $(function () {
        $('.saveButton').on('click', function (eventObject) {
            saveSettings("Default", ".Artifactory");
        });

        getSettings("Default", ".Artifactory");

    });

});


function saveSettings(scope, selector) {
    var artifactoryUri = $(selector + " .uri").val();
    var credentials = {
        username: $(selector + " .username").val(),
        password: $(selector + " .password").val()
    };
    VSS.getService("ms.vss-web.data-service").then(function (extensionSettingsService) {
        extensionSettingsService.getDocument("artifactoryConfig", "main", { scopeType: scope }).then(function (artifactoryConfig) {
            artifactoryConfig.credentials = credentials;
            artifactoryConfig.artifactoryUri = artifactoryUri;
            extensionSettingsService.setDocument("artifactoryConfig", artifactoryConfig, { scopeType: scope }).then(function (value) {
                $('.statusBarOK').fadeIn('slow').delay(5000).fadeOut('slow');
            });
        }, function (reason) {
            var artifactoryConfig = {
                id: "main",
                credentials: credentials,
                artifactoryUri: artifactoryUri
            }
            extensionSettingsService.setDocument("artifactoryConfig", artifactoryConfig, { scopeType: scope }).then(function (value) {
                $('.statusBarOK').fadeIn('slow').delay(5000).fadeOut('slow');
            });
        });
    });
}
function getSettings(scope, selector) {
    VSS.getService("ms.vss-web.data-service").then(function (extensionSettingsService) {
        extensionSettingsService.getDocument("artifactoryConfig", "main", { scopeType: scope }).then(function (artifactoryConfig) {
            if (artifactoryConfig) {
                $(selector + " .uri").val(artifactoryConfig.artifactoryUri ? artifactoryConfig.artifactoryUri : "");
                $(selector + " .username").val(artifactoryConfig.credentials ? artifactoryConfig.credentials.username : "");
                $(selector + " .password").val(artifactoryConfig.credentials ? artifactoryConfig.credentials.password : "");
            }
            VSS.notifyLoadSucceeded();
        }, function (reason) {
            //Old data format as value key => migration as document
            extensionSettingsService.getValue("artifactoryUri", { scopeType: scope }).then(function (artifactoryUri) {
                if (artifactoryUri) {
                    $(selector + " .uri").val(artifactoryUri);
                    extensionSettingsService.getValue("credentials", { scopeType: scope }).then(function (credentials) {
                        $(selector + " .username").val(credentials ? credentials.username : "");
                        $(selector + " .password").val(credentials ? credentials.password : "");
                        saveSettings(scope, selector);
                    });
                }
                VSS.notifyLoadSucceeded();
            }, function (reason_old) {
                VSS.notifyLoadSucceeded();
            });
        });
    });
}