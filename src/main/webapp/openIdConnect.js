/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function OpenIDConnect() {
    //console.group("OpenIDConnect");
    this.id_token = "";
    this.access_token = "";
    this.refresh_token = "";
    this.session_state = "";
    this.refresh_expires_in = "";
    this.expires_in = "";
    this.user_name = "";
    this.user_id = "8a481639-e8e6-426f-8f98-88fcb338913c";
    this.host = "";
    this.realm = "";
    this.clientId = "";
    this.client_secret = "";

    /***************************************************************
     ************** работа с Cookie *********************************
     ***************************************************************/

    /**
     * 
     * @param {type} name
     * @returns {undefined}
     */

    this.getCookie = function (name) {
        //console.groupCollapsed("getCookie");
        console.log("getCookie => " + name);
        var matches = document.cookie.match(new RegExp(
                "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
                ));
        //console.groupEnd();
        return matches ? decodeURIComponent(matches[1]) : undefined;
    };

    /**
     * 
     * @param {type} name
     * @returns {undefined}
     */

    this.deleteCookie = function (name) {
        console.groupCollapsed("deleteCookie");
        try {
            console.log("deleteCookie => %s", name);
            setCookie(name, "", {
                expires: -1
            });
        } catch (exception) {
            console.log(exception);
        }
    };

    /**
     * 
     * @param {type} name
     * @param {type} value
     * @param {type} options
     * @returns {undefined}
     */

    this.setCookie = function (name, value, options) {
        console.groupCollapsed("setCookie");
        try {
            console.log("setCookie => %s, %s, %s", name, value, options);
            options = options || {};

            var expires = options.expires;

            if (typeof expires === "number" && expires) {
                var d = new Date();
                d.setTime(d.getTime() + expires * 1000);
                expires = options.expires = d;
            }
            if (expires && expires.toUTCString) {
                options.expires = expires.toUTCString();
            }

            value = encodeURIComponent(value);

            var updatedCookie = name + "=" + value;

            for (var propName in options) {
                updatedCookie += "; " + propName;
                var propValue = options[propName];
                if (propValue !== true) {
                    updatedCookie += "=" + propValue;
                }
            }

            console.log(updatedCookie);
            document.cookie = updatedCookie;
        } catch (exception) {
            console.log(exception);
        }
        console.groupEnd();
    };

    /**
     * 
     * @returns {undefined}
     */

    this.readCookie = function () {
        console.log("readCookie");
        this.access_token = this.getCookie("access_token");
        this.id_token = this.getCookie("id_token");
        this.refresh_token = this.getCookie("refresh_token");
        this.session_state = this.getCookie("session_state");
        this.refresh_expires_in = this.getCookie("refresh_expires_in");
        this.expires_in = this.getCookie("expires_in");
    };

    /**************************************************************************/

    /**
     * Инициализируется объект. Читаются даные с openid_connect.json
     * @returns {undefined}
     */

    this.TestFunc = function () {

    };

    this.Init = function () {
        try {
            //console.group("OpenIDConnect");
            console.log("Init");
            //throw new Error('Уупс!');
            // Читаем данные из файла keycloak.json на сервере
            var initPromise = new Promise(function (resolve, reject) {
                //console.groupCollapsed("initApp => initPromise");
                $.ajax({
                    url: "openID.json",
                    type: "GET",
                    success: function (data) {
                        //console.groupCollapsed("initApp => initPromise => success");
                        console.log(data);
                        //console.groupEnd();
                        resolve(data);
                    },
                    error: function () {
                        //console.groupCollapsed("initApp => initPromise => error");
                        //console.groupEnd();
                        var err = new Error("File openID.json not found");
                        reject(err);
                    }
                });
            });
            // Обрабатываем полученные настройки
            initPromise.then(
                    result => {
                        // Если файл загрузился успешно устанавливаем значения в поля класса из полученого файла
                        console.log("initPromise.ok");
                        this.host = result["auth-server-url"];
                        this.realm = result["realm"];
                        this.clientId = result["resource"];
                        this.client_secret = result["credentials"]["secret"];
                        // Читаем куки и устанавливаем параметры
                        this.readCookie();
                        this.onInit(this);
                    },
                    error => {
                        console.log("initPromise.error");
                        this.onInitError(error);
                    }
            );
            this.onInit(this);
            //console.groupEnd();
        } catch (err) {
            console.log(err);
            this.onInitError(err);
        }
    };


    /**
     * Функция выполняет авторизацию по протоколк openID Connect и в случае успеха устанавливает значения в поля объекта. 
     * Возвращает ссылку на объект
     * 
     * @param {type} username
     * @param {type} password
     * @returns {undefined}
     */

    //http://test.ru:8080/auth/realms/videomanager/protocol/openid-connect/token


    // TODO: доработать ошибка при формировании списка передаваемых переменных. Не передается client_id и client_secret
    this.Connect = function (username, password) {
        try {
            console.log("this.Connect => " + this.host + "/realms/" + this.realm + "/protocol/openid-connect/token");
            var url = this.host + "/realms/" + this.realm + "/protocol/openid-connect/token";
            console.log("URL = %s  client_id = %s", url, this.clientId);
            console.log(this);
            var client_id = this.clientId;
            var client_secret = this.client_secret;
            this.user_name = username;
            var connectPromise = new Promise(function (resolve, reject) {
                $.post(url,
                        {client_id: client_id,
                            password: password,
                            username: username,
                            client_secret: client_secret,
                            grant_type: "password"}).done(function (data) {
                    //console.groupCollapsed("userAuth => done");
                    console.log(data);
                    //console.groupEnd();
                    resolve(data);
                }).fail(function () {
                    reject();
                });
            });

            connectPromise.then(result => {
                this.onConnect(result);
            },
                    error => {
                        this.onConnectError(error);
                    });
        } catch (err) {
            console.error(err);
            this.onConnectError(err);
        }
    };

    /**
     * 
     * @param {type} data
     * @returns {undefined}
     */
    this.RefreshToken = function (data) {
        try {
            console.log("this.refreshToken");
            console.log(this.host + "/realms/" + this.realm + "/protocol/openid-connect/token");
            var url = this.host + "/realms/" + this.realm + "/protocol/openid-connect/token";
            var refreshToken = this.refresh_token;
            var clientSecret = this.client_secret;
            var id = this.clientId;
            var userid = this.user_id;
            var refreshTokenPromise = new Promise(function (resolve, reject) {
                $.post(url,
                        {
                            refresh_token: refreshToken,
                            //user_id : userid,
                            //client_id : id,
                            //client_secret: clientSecret,
                            grant_type: "refresh_token"}).done(function (data) {
                    //console.groupCollapsed("userAuth => done");
                    console.log(data);
                    resolve(data);
                }).fail(function () {
                    reject();
                });
            });

            refreshTokenPromise.then(result => {
                this.onRefreshToken(result);
            },
                    error => {
                        this.onRefreshTokenError(error);
                    });
        } catch (e) {
            console.error(e);
        }
    };

    this.getUserInfo = function () {
        try {
            console.log("getUserInfo => %s, %s, %s", this.username, this.host, this.realm);            
            console.log("this.access_token = " + this.access_token);
            var host = this.host;
            var realm = this.realm;
            var accessToken = this.access_token;
            var username = this.user_name;
            console.log(host + "/realms/" + realm + "/protocol/openid-connect/userinfo");
            var userInfoPromise = new Promise(function (resolve, reject) {
                $.ajax({
                    //"http://192.168.1.150:8080/auth/video-app/realms/" + realm + "/users"
                    url: host + "/realms/" + realm + "/protocol/openid-connect/userinfo",
                    data: {username: username},
                    type: "GET",
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', "Bearer " + accessToken);
                    },
                    success: function (data) {
                        //console.groupCollapsed("getUserInfo=>success");
                        //console.log(data);
                        //console.groupEnd();
                        resolve(data);
                    },
                    error: function () {
                        //console.groupCollapsed("getUserInfo=>error");
                        console.log("error %s", "ERROR");
                        //console.groupEnd();
                        reject();
                    }
                });
            });
            userInfoPromise.then(result => {
                this.onGetUserInfo(result);
            },
                    error => {
                        this.onGetUserInfoError(error);
                    });
        } catch (exception) {
            console.error(exception);
        }
    };

    this.onGetUserInfo = function (data) {
        console.log(data);
        this.user_id = data.sub;
        console.log("this.user_id = " + this.user_id);
    };

    this.onGetUserInfoError = function (error) {
        console.log(error);
    };

    /**
     * Функция вызывается при успешной инициализации. Получает на вход ссылку на this
     * @param {type} data
     * @returns {undefined}
     */

    this.onInit = function (data) {
        console.log("onInit");
        console.log(data);
    };

    /**
     * Функция вызывается в случае ошибки при инициализации. Получает на вход ссылку на ошибку.
     * @param {type} err
     * @returns {undefined}
     */

    this.onInitError = function (err) {
        console.log("onInitError");
        console.log(err);
    };

    /**
     * Функция вызывается при успешном соединении и получает на вход ??? 
     * @param {type} data
     * @returns {undefined}
     */

    this.onConnect = function (data) {
        console.log("onConnect");
        console.log(data);
        console.log(data.access_token);
        
        console.log(this);
    };

    /**
     * Функция вызывается в случае ошибки при выполнении this.Connect(). Получает на вход ссылку ошибку
     * @param {type} error
     * @returns {undefined}
     */

    this.onConnectError = function (error) {
        console.log("onConnectError");
        console.log(error);
    };


    /**
     * 
     * @param {type} data
     * @returns {undefined}
     */

    this.onRefreshToken = function (data) {
        console.log("onRefreshToken");
        console.log(data);
    };

    /**
     * 
     * @param {type} error
     * @returns {undefined}
     */
    this.onRefreshTokenError = function (error) {
        console.log("onRefreshTokenError");
        console.log(error);
    };

    //console.groupEnd();
}
