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
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.groupCollapsed("initApp => initPromise => error");
                        console.error("textStatus = %s,  errorThrown = %s", textStatus, errorThrown);
                        console.groupEnd();
                        reject(errorThrown);
                    }
                });
            });

            this.onInit(this);
            console.groupEnd();
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
