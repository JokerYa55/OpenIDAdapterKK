/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global kc, exception */

var kc = this;
kc.host = "http://192.168.1.150:8080";
kc.realm = "videomanager";
kc.clientId = "video-app";
kc.clientSecret = "50c93bab-fe8f-422a-948e-a63c52458ee3";
kc.sqlStorage = null; // Локальное sqlStorage хранилище
kc.tableName = "rtkPasportParams"; // Имя таблицы 
kc.columnName = "f_name";
kc.columnVal = "f_val";

kc.sqlStorage = initSqlStorage();
initSqlShema(kc.sqlStorage);

// Функции для работы с Web SQL Storage
function initSqlStorage() {
    if (kc.sqlStorage === null) {
        try {
            var db = openDatabase("RtkPasport", "0.1", "A list of to do items.", 200000);
            if (!db) {
                console.log("Failed to connect to database.");
            } else {
                kc.sqlStorage = db;
                return kc.sqlStorage;
            }
        } catch (exception) {
            return null;
        }

    } else
    {
        return kc.sqlStorage;
    }
}

/**
 * 
 * @param {type} name
 * @param {type} value
 * @returns {undefined}
 */

function setLocalStorageParam(name, value) {
    localStorage.setItem(name, value);
}

/**
 * 
 * @param {type} name
 * @returns {undefined}
 */

function getLocalStorageParam(name) {
    return localStorage.getItem(name);
}

function initSqlShema(db) {
    db.transaction(function (tx) {
        tx.executeSql("SELECT COUNT(*) FROM rtkPasport", [], function (result) {
            console.log('TABLE ' + kc.tableName + " yes!");
        }, function (tx, error) {
            tx.executeSql("CREATE TABLE " + kc.tableName + " (id REAL UNIQUE, " + kc.columnName + " TEXT, " + kc.columnVal + " TEXT, timestamp REAL)", [], null, null, null);
        });
    });
}

function setSqlParam(db, pName, pVal) {
    console.log("setSqlParam => " + db + ", " + pName + ", " + pVal);
    db.transaction(function (tx) {
        tx.executeSql("INSERT INTO " + kc.tableName + " (" + kc.columnName + ", " + kc.columnVal + ", timestamp) values(?, ?, ?)", [pName, pVal, new Date().getTime()], null, null);
    });
}

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

        document.cookie = updatedCookie;
    } catch (exception) {
        console.log(exception);
    }
    console.groupEnd();
}



/**
 * 
 * @param {type} username
 * @param {type} password
 * @returns {undefined}
 */

function userLogin(username, password) {
    console.groupCollapsed("userLogin");
    console.profile();
    try {
        console.log("username = %s  password = %s", username, password);
        var authPromise = userAuth(username, password, kc.host, kc.realm, kc.clientId, kc.clientSecret);
        console.log(authPromise);
        console.log(kc);
        authPromise.then(function (val) {
            console.groupCollapsed("userLogin => then");
            console.log("val = ");
            console.log(val);

            kc.access_token = val.access_token;
            kc.id_token = val.id_token;
            kc.refresh_token = val.refresh_token;
            kc.session_state = val.session_state;
            kc.expires_in = val.expires_in;
            kc.refresh_expires_in = val.refresh_expires_in;

            console.log("kc = ");
            console.log(kc);
            // Устанавливаем куки
            setCookie("access_token", kc.access_token, {});
            setCookie("id_token", kc.id_token, {});
            setCookie("refresh_token", kc.refresh_token, {});
            setCookie("session_state", kc.session_state, {});
            setCookie("refresh_expires_in", kc.refresh_expires_in, {});
            setCookie("expires_in", kc.expires_in, {});

            setCookie("username", username, {});
            var userInfoPromise = getUserInfo(username, kc.host, kc.realm, kc.access_token);
            userInfoPromise.then(function (val) {
                console.groupCollapsed("getUserInfo => then");
                console.log(val);
                //setSqlParam(kc.sqlStorage, "access_token", val.access_token);
                //получили информацию о пользователе по OpenID Connect и отображаем на странице

                // Получаем доп информацию о пользователе. Делаем запрос к rest
                console.log("access_token = %s", kc.access_token);

                var userFullPromise = getUserFullInfo("", "", val.sub, kc.access_token);
                userFullPromise.then(function (data) {
                    console.groupCollapsed("getUserFullInfo => then");
                    console.log(data);
                    console.groupEnd();
                });
                console.groupEnd();
            }).catch(function (exception) {
                console.groupCollapsed("getUserInfo => catch");
                console.log(exception);
                console.groupEnd();
            });
            console.groupEnd();
        }).catch(function (error) {
            console.groupCollapsed("userLogin => catch");
            console.error(error);
            console.groupEnd();
        });
        ;
    } catch (exception) {
        console.log(exception);
    }
    console.profileEnd();
    console.groupEnd();
}

/**
 * 
 * @param {type} username - Имя пользователя
 * @param {type} password - Пароль
 * @param {type} host     - адрес сервера SSO
 * @param {type} realm    - имя realm  
 * @param {type} clientId - clientID из настроек клиента в SSO 
 * @param {type} clientSecret - clientSecret из настроек клиента в SSO
 * @returns {userAuth.p1.scriptuserAuth#p1|userAuth.p1} возвращает обещание
 */

function userAuth(username, password, host, realm, clientId, clientSecret) {
    console.group("userAuth");
    try {
        var p1 = new Promise(function (resolve, reject) {
            $.post(host + "/auth/realms/" + realm + "/protocol/openid-connect/token",
                    {client_id: clientId,
                        password: password,
                        username: username,
                        client_secret: clientSecret,
                        grant_type: "password"}).done(function (data) {
                console.groupCollapsed("userAuth => done");
                console.log(data);
                console.groupEnd();
                resolve(data);
            }).fail(function () {
                reject();
            });
        });
    } catch (exception) {
        console.log(exception);
    }

    console.groupEnd();
    return p1;
}

/**
 * 
 * @returns {undefined}
 */
function getData() {

}

/**
 * 
 * @param {type} host
 * @param {type} realm
 * @param {type} accessToken
 * @returns {undefined}
 */
function getOpenIDInfo(host, realm, accessToken) {
    // /realms/{realm-name}/.well-known/openid-configuration
    console.groupCollapsed("userAuth");
    try {
        $.ajax({url: host + "/auth/realms/" + realm + "/.well-known/openid-configuration",
            type: "GET",
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', "Bearer " + accessToken.access_token);
            },
            success: function (data) {
                console.groupCollapsed("getOpenIDInfo => success");
                console.log(data);
                console.groupEnd();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.groupCollapsed("getOpenIDInfo => error");
                console.error("textStatus = %s,  errorThrown = %s", textStatus, errorThrown);
                console.groupEnd();
                reject(errorThrown);
            }
        });
    } catch (exception) {
        console.error(exception);
    }

    console.groupEnd();
}

/**
 * 
 * @param {type} username
 * @param {type} host
 * @param {type} realm
 * @param {type} accessToken
 * @returns {getUserInfo.p2.index_apigetUserInfo#p2|getUserInfo.p2.scriptgetUserInfo#p2|getUserInfo.p2}
 */

function getUserInfo(username, host, realm, accessToken) {
    ///realms/{realm-name}/protocol/openid-connect/userinfo
    console.groupCollapsed("getUserInfo");
    try {
        console.log("getUserInfo => %s, $s, %s, %s", username, host, realm, accessToken);
        console.log("accessToken = %s", accessToken);
        var p2 = new Promise(function (resolve, reject) {
            $.ajax({
                //"http://192.168.1.150:8080/auth/video-app/realms/" + realm + "/users"
                url: host + "/auth/realms/" + realm + "/protocol/openid-connect/userinfo",
                data: {username: username},
                type: "GET",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', "Bearer " + accessToken);
                },
                success: function (data) {
                    console.groupCollapsed("getUserInfo=>success");
                    console.log(data);
                    console.groupEnd();
                    resolve(data);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.groupCollapsed("getUserInfo=>error");
                    console.error("textStatus = %s,  errorThrown = %s", textStatus, errorThrown);
                    console.groupEnd();
                    reject(errorThrown);
                }
            });
        });
    } catch (exception) {
        console.error(exception);
    }
    console.groupEnd();
    return p2;
}

/**
 * 
 * @param {type} host
 * @param {type} realm
 * @param {type} userID
 * @param {type} accessToken
 * @returns {getUserFullInfo.p3.scriptgetUserFullInfo#p3|getUserFullInfo.p3}
 */

function getUserFullInfo(host, realm, userID, accessToken) {
    console.groupCollapsed("getUserFullInfo");
    try {
        var p3 = new Promise(function (resolve, reject) {
            $.ajax({
                //"http://192.168.1.150:8080/auth/video-app/realms/" + realm + "/users"
                url: "http://192.168.1.150:8080/testRest/admusers/hello/" + userID,
                type: "GET",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', "Bearer " + accessToken);
                },
                success: function (data) {
                    console.groupCollapsed("getUserFullInfo=>success");
                    console.log(data);
                    console.groupEnd();
                    resolve(data);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.groupCollapsed("getUserFullInfo => error");
                    console.error("textStatus = %s,  errorThrown = %s", textStatus, errorThrown);
                    console.groupEnd();
                    reject(errorThrown);
                }
            });
        });
    } catch (exception) {
        console.error(exception);
    }
    console.groupEnd();
    return p3;
}

function refreshToken() {

}

function getTokenInfo() {
    $("#idTokenInfo").html(getLocalStorageParam("access_token"));
}