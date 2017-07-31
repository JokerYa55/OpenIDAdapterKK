/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function OpenIDConnect() {
    console.group("OpenIDConnect");
    this.id_token = "";
    this.access_token = "";
    this.refresh_token = "";
    this.session_state = "";
    this.refresh_expires_in = "";
    this.expires_in = "";
    this.user_name = "";
    this.user_id = "";

    /***************************************************************
     ************** работа с Cookie *********************************
     ***************************************************************/

    /**
     * 
     * @param {type} name
     * @returns {undefined}
     */

    function getCookie(name) {
        console.groupCollapsed("getCookie");
        console.log("getCookie => " + name);
        var matches = document.cookie.match(new RegExp(
                "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
                ));
        console.groupEnd();
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    /**
     * 
     * @param {type} name
     * @returns {undefined}
     */

    function deleteCookie(name) {
        console.groupCollapsed("deleteCookie");
        try {
            console.log("deleteCookie => %s", name);
            setCookie(name, "", {
                expires: -1
            });
        } catch (exception) {
            console.log(exception);
        }
    }

    /**
     * 
     * @param {type} name
     * @param {type} value
     * @param {type} options
     * @returns {undefined}
     */

    function setCookie(name, value, options) {
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
    }

    /**
     * Инициализируется объект. Читаются даные с openid_connect.json
     * @returns {undefined}
     */

    this.Init = function () {
        try {
            console.group("OpenIDConnect");
            console.log("Init");
            //throw new Error('Уупс!');
            // Читаем данные из файла keycloak.json на сервере
            var initPromise = new Promise(function (resolve, reject) {
                console.groupCollapsed("initApp => initPromise");
                $.ajax({
                    url: "openID.json",
                    type: "GET",
                    success: function (data) {
                        console.groupCollapsed("initApp => initPromise => success");
                        console.log(data);
                        console.groupEnd();
                        resolve(data);
                    },
                    error: function () {
                        console.groupCollapsed("initApp => initPromise => error");
                        console.groupEnd();
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
                        this.clientSecret = result["credentials"]["secret"];
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
            console.groupEnd();
        } catch (err) {
            console.log(err);
            this.onInitError(err);
        }
    };

    /**
     * 
     * @returns {undefined}
     */
    
    this.readCookie = function () {
        console.log("readCookie");
        this.access_token           = getCookie("access_token");
        this.id_token               = getCookie("id_token");
        this.refresh_token          = getCookie("refresh_token");
        this.session_state          = getCookie("session_state");
        this.refresh_expires_in     = getCookie("refresh_expires_in");
        this.expires_in             = getCookie("expires_in");
    };

    /**
     * Функция выполняет авторизацию по протоколк openID Connect и в случае успеха устанавливает значения в поля объекта. 
     * Возвращает ссылку на объект
     * 
     * @param {type} username
     * @param {type} password
     * @returns {undefined}
     */

    this.Connect = function (username, password) {
        try {
            this.onConnect(this);
        } catch (err) {
            console.log(err);
            this.onConnectError(err);
        }
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

    console.groupEnd();
}
