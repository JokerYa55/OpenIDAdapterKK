/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global kc */

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
    console.log("getCookie => " + name);
    var matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
            ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

/**
 * 
 * @param {type} name
 * @returns {undefined}
 */

function deleteCookie(name) {
    console.log("deleteCookie => " + name);
    setCookie(name, "", {
        expires: -1
    });
}

/**
 * 
 * @param {type} name
 * @param {type} value
 * @param {type} options
 * @returns {undefined}
 */

function setCookie(name, value, options) {
    console.log("setCookie => " + name + ", " + value + ", " + options);
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
}



/**
 * 
 * @param {type} username
 * @param {type} password
 * @returns {undefined}
 */

function userLogin(username, password) {
    console.log("userLogin");
    var authPromise = userAuth(username, password, kc.host, kc.realm, kc.clientId, kc.clientSecret);
    console.log(authPromise);
    console.log(kc);
    authPromise.then(function (val) {
        console.log("val = ");
        console.log(val);

        kc.rtkPasport = val;
        console.log("kc.rtkPasport=");
        console.log(kc.rtkPasport);
        // Устанавливаем куки
        setCookie("access_token", kc.rtkPasport.access_token, {});
        setCookie("username", username, {});
        var userInfoPromise = getUserInfo(username, kc.host, kc.realm, kc.access_token);
        userInfoPromise.then(function (val) {
            console.log(val);
            //setSqlParam(kc.sqlStorage, "access_token", val.access_token);
            //получили информацию о пользователе по OpenID Connect и отображаем на странице

            // Получаем доп информацию о пользователе. Делаем запрос к rest
            console.log(kc.rtkPasport.access_token);

            var userFullPromise = getUserFullInfo("", "", val.sub, kc.access_token);
            userFullPromise.then(function (data) {
                console.log(data);
            });
        });

    });
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
    console.log("userAuth");
    var p1 = new Promise(function (resolve, reject) {
        $.post(host + "/auth/realms/" + realm + "/protocol/openid-connect/token",
                {client_id: clientId,
                    password: password,
                    username: username,
                    client_secret: clientSecret,
                    grant_type: "password"}).done(function (data) {
            console.log(data);
            //kc.token = data;
            resolve(data);
        });
    });
    return p1;
    /*p1.then(function (val) {
     console.log("val = ");
     console.log(val);
     });*/
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
    $.ajax({url: host + "/auth/realms/" + realm + "/.well-known/openid-configuration",
        type: "GET",
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', "Bearer " + accessToken.access_token);
        },
        success: function (data) {
            console.log(data);
        }
    });
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
    console.log("getUserInfo");
    console.log("accessToken = ");
    console.log(kc);
    var p2 = new Promise(function (resolve, reject) {
        $.ajax({
            //"http://192.168.1.150:8080/auth/video-app/realms/" + realm + "/users"
            url: host + "/auth/realms/" + realm + "/protocol/openid-connect/userinfo",
            data: {username: username},
            type: "GET",
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', "Bearer " + kc.access_token);
            },
            success: function (data) {
                console.log(data);
                resolve(data);
            }
        });
    });
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
    console.log("getUserFullInfo");
    var p3 = new Promise(function (resolve, reject) {
        $.ajax({
            //"http://192.168.1.150:8080/auth/video-app/realms/" + realm + "/users"
            url: "http://192.168.1.150:8080/testRest/admusers/hello/" + userID,
            type: "GET",
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', "Bearer " + accessToken);
            },
            success: function (data) {
                console.log(data);
                resolve(data);
            }
        });
    });
    return p3;
}

function refreshToken() {

}

function getTokenInfo() {
    $("#idTokenInfo").html(getLocalStorageParam("access_token"));
}