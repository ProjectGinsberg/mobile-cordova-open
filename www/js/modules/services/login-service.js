angular.module('gb.services')
.service('LoginService', ['$rootScope','$http','Login','AnalyticsService',function($rootScope, $http, Login, AnalyticsService)
{
    var ls = {};

    ls.simpleLogin = function(email,password) {
        var url = 'https://platform.ginsberg.io/account/GetAppAccessToken';
        var payload = {
            email:email,
            clientId:$rootScope.clientId,
            scope:'BasicDemographicRead%20SubjectiveRead%20SubjectiveWrite%20ObjectiveRead%20ObjectiveWrite',
            clientSecret:$rootScope.clientSecret,
            password:password
        };

        return $http.post(url,payload).
        success(function(data, status, headers, config) {
            // probably want to then push them onto the signin flow
            if (angular.isDefined(data.token)) {
                localStorage.token = data.token;
                ls.token = data.token;
            }
        }).
        error(function(data, status, headers, config) {
            // TODO: decide what to do on failure of the endpoint
            return {
                status:"Login Failure",
                reason:"Server Error"
            };
        });
    };

    ls.login = function() {

        console.log("LS:Login: Login");

        Setup($rootScope.clientId,$rootScope.clientSecret,
                   null);

        if (!HaveToken())
        {
            console.log("LS:Login: No token so need login");

            // Trigger wipe last change since fresh login
            if(localStorage.lastChange) delete localStorage.lastChange;

            DoLogin();
        }
    };
    ls.logout = function() {
        localStorage.clear();
    };

    //
    // Consts
    //

    //private static String baseUrl = "project-ginsberg.com";
    var BASE_URL = "ginsberg.io";

    //Testing
    var SIGNUP_URL = "https://platform.ginsberg.io/account/signup";
    var CONNECTIONS_URL = "https://platform.ginsberg.io/account/myconnections";
    var AUTHORIZATIONS_URL_START = function() { return "https://platform."+BASE_URL+"/authorisation/auth?response_type=code&client_id="; };
    var ACCESS_TOKEN_URL = function() { return "https://platform."+BASE_URL+"/authorisation/token"; };
    var HTTPAPI = function() { return "https://aps."+BASE_URL; };
    var HTTPWWW = function() { return "https://www."+BASE_URL; };
    var HTTPPLAT = function() { return "https://platform."+BASE_URL; };

    var AUTHORIZATION_URL_END = "&scope=BasicDemographicRead%20SubjectiveRead%20SubjectiveWrite%20ObjectiveRead%20ObjectiveWrite&redirect_uri=ginsberg://activation_code";
    ls.TOKEN_STORE_KEY = "Token";


    //
    // Variables
    //

    //Setup
        //Reference to runtime created logins webview
    var webView = null;

    var clientID = "";
    var clientSecret = "";
    var auth = "";
    //For data
    ls.token = null;


    //
    // Setup
    //



    //Setup SDK
    var Setup = function(_clientID, _clientSecret, _callbacks)
    {
        //Assign defaults
        clientID = _clientID;
        clientSecret = _clientSecret;

        if(HaveToken())
        {
            console.log("Setup: Have token");
            ls.GainedAccess();
        }
        else
        {
            console.log("Setup: Need login");
            NeedLogin();
        }
    };


    //
    // Signup
    //

    var SignUpWeb = function()
    {
        ShowWeb(SIGNUP_URL);
    };


    //
    // Connections
    //
    var ConnectionsWeb = function(backgroundID)
    {
        ShowWeb(CONNECTIONS_URL, backgroundID);
    };


    //
    // Login
    //

    /**
      * @brief      Start login process
      */
    var DoLogin = function()
    {
        GetAuthorizationCode();
    };


    /**
      * @brief      Called when login is required
      *
      * @details    Starts NeedLogin callback
      */
    var NeedLogin = function()
    {
        RemoveWebView();
        $rootScope.$broadcast('gb.home.login.needlogin');
    };


    /**
      * @brief      Start autorization process
      *
      * @details    Starts NeedLogin callback
      */
    var GetAuthorizationCode = function()
    {
        var url = AUTHORIZATIONS_URL_START() + clientID + AUTHORIZATION_URL_END;
        ShowWeb(url);
    };


    var ShowWeb = function(url, backgroundID)
    {
        // open Cordova inapp-browser with login url
        var loginWindow = window.open(url, '_blank', 'location=no');
        webView = loginWindow;

        console.log("ShowWeb: Starting inappbrowser with " + url);

        //If running in browser
        if(!loginWindow) return;

        // check if redirect url has code, access_token or error
        loginWindow.addEventListener('loadstop', function(e)
        {
            var stopurl = e.url;

            console.log("ShowWeb stopped at " + stopurl);

            if(stopurl.indexOf("GrantAccess") > -1)
            {
                console.log("ShowWeb GrantAccess found");

                loginWindow.executeScript({ code: "localStorage.setItem( 'tag', document.getElementsByTagName('title')[0].innerHTML);" });
                var loop = setInterval(function()
                {
                    loginWindow.executeScript(
                    {
                        code: "localStorage.getItem('tag');"
                    },
                    function( values )
                    {
                        var tag = values[ 0 ];
                        if ( tag )
                        {
                            console.log("ShowWeb Found token");

                            clearInterval( loop );
                            auth = tag;
                            getAccessToken();
                        }
                    });
                });
            }
      });
    };


    /**
      * @brief      Get access token once require details have been found
      */
    var getAccessToken = function()
    {
        console.log("getAccessToken: Starting process");

        $.ajax({
            url: ACCESS_TOKEN_URL(),
            data: {code:auth, client_id:clientID, client_secret:clientSecret, grant_type:"authorization_code"},
            type: 'POST',
         success: function(data)
                  {
                    var access_token;
                    if((data instanceof Object))
                    {
                        access_token = data.access_token;
                    }
                    else
                    {
                        access_token = data.getParam("access_token");
                    }

                    console.log("getAccessToken: Got access token");
                    ls.token = access_token;

                    console.log("getAccessToken: Storing token");
                    localStorage.token = access_token;

                    ls.GainedAccess();

                    console.log("getAccessToken: Finished access token");
                 },
          error: function(error)
                 {
                    ls.errorCallback(error, error);
                 }
              });
    };


    /**
      * @brief      Get initial user data, and call GainedAccess callback, once user has gained initial access
      */
    ls.GainedAccess = function()
    {
        console.log("GainedAccess: called");

        $rootScope.$broadcast('gb.home.login.gainedaccess');
        AnalyticsService.event("Login");
    };


    //
    // Token methods
    //

    /**
      * @brief      Check for valid token
      *
      *
      * @return     Truth of if have valid token
      */

    //Have token check
    var HaveToken = function()
    {
        return localStorage.token !== undefined && localStorage.token !== null && localStorage.token.length > 1;
    };


    /**
      * @brief      Clear current stored token
      *
      * @details    Remove current token so user will have to relogin to system
      */
    var ClearToken = function()
    {
        localStorage.clear();
    };


    //
    // Interface
    //

    var RemoveWebView = function()
    {
        if(webView)
        {
            console.log("RemoveWebView: Removing");
            webView.close();
            webView = null;
        }
        else
        {
            console.log("RemoveWebView: Could not find");
        }
    };


    return ls;
}]);
