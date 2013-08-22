(function() {

var API_URL = "";
var DOMAIN = "";
var PROJECT = "";
var ALM = {};
window.ALM = ALM;

ALM.config = function(apiUrl, domain, project) {
    API_URL = apiUrl;
    DOMAIN = domain;
    PROJECT = project;
}

ALM.ajax = function ajax(path, onSuccess, onError) {
    $.ajax(API_URL + path, {
        success: function (response) {
            try {
                onSuccess($.xml2json(response));
            }
            catch(err) {
                onError(err)
            }
        },
        error: onError,
        xhrFields: {
            withCredentials: true
        }
    });
};

ALM.showLoginForm = function showLoginForm(loginForm, onLogin, onError) {
    loginForm.attr('src', API_URL + 'rest/is-authenticated?login-form-required=y');
    loginForm.load(function(ev) {
        tryLogin(onLogin, onError);
    });
    function tryLogin(onLogin, onError) {
        ALM.ajax("rest/is-authenticated?login-form-required=y", function(response) {
            onLogin(response.Username);
        },
        function(err) {
            onError(err);
        });
    }
}

ALM.logout = function logout(cb) {
    ALM.ajax("authentication-point/logout", cb, function err(){});
}

ALM.getDefects = function getDefects(cb, errCb, query) {
    var fields = ["id","name","description","dev-comments","severity"];
    var fieldsParam = "fields="+ fields.join(",") + "&";
    var queryParam = "query={" + query + "}&";
    var path = "rest/domains/" + DOMAIN +
               "/projects/" + PROJECT +
               "/defects?" + queryParam + fieldsParam;
    ALM.ajax(path, function onSuccess(defectsJSON) {
        var myDefects = defectsJSON.Entity;
        var defectsCount = defectsJSON.TotalResults;
        if (!(myDefects instanceof Array)) {
            myDefects = [myDefects];
        }
        var defects = myDefects.map(function (myDefect) {
            var defect = myDefect.Fields.Field.reduce(function(prev, current) {
                prev[current.Name] = current.Value;
                return prev;
            }, {});
            return defect;
        });
        cb(defects, defectsCount);
    }, errCb);
}

})();
