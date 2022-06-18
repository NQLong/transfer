import io from 'socket.io-client';
import dateformat from 'dateformat';
import { Platform, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import CookieManager from '@react-native-cookies/cookies';
import Config from '@/Config';

const instance = axios.create({
    baseURL: Config.API_URL,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
    },
    timeout: 3000
});

instance.interceptors.response.use(
    (response) => response ? response.data : null,
    ({ message, response: { data, status } }) => {
        return Promise.reject({ message, data, status });
    }
);

interface Colors {
    background?: 'transparent' | string,
    primary?: string,
    text?: string,
    accent?: string,

    [propName: string]: any;
}

const isDebug = Config.API_URL.indexOf('localhost') != -1 || Config.API_URL.indexOf('127.0.0.1') != -1;

const T: ({ [propName: string]: any }) = {
    defaultFeedSize: 3,
    defaultPageSize: 10,
    debug: isDebug,
    socket: isDebug ? io.connect(Config.API_URL, { transports: ['websocket'] }) : io.connect(Config.API_URL, { transports: ['websocket'], secure: true }),
    dateToText: (date: Date, format: string): string => dateformat(date, format ? format : 'dd/mm/yyyy'),
    cookie: async (name: string, value?) => {
        if (value === undefined) {
            const cookies = await CookieManager.get(Config.API_URL);
            return cookies[name] && cookies[name].value || null;
        } else {
            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() + 60);
            await CookieManager.set(Config.API_URL, {
                name, value, expires: T.dateToText(currentDate, "yyyy-mm-dd'T'HH:MM:ss.l'+07:00'")
            });
        }
    },
    clearCookie: async (name?: string) => {
        if (name) {
            if (Platform.OS === 'ios') {
                await CookieManager.clearByName(Config.API_URL, name);
            } else {
                await CookieManager.set(Config.API_URL, { name, value: '' });
            }
        } else {
            await CookieManager.clearAll();
        }
    },
    validateEmail: (email: string) : boolean => (/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i).test(String(email).toLowerCase()),
    get: instance.get,
    post: instance.post,
    put: instance.put,
    delete: instance.delete,
    alert: (title: string, message: string, buttons: any[] = [{ text: 'Ok' }]) : void => {
        Alert.alert(title, message, buttons);
    },
    confirm: (title: string, message: string, dangerMode: boolean, action) : void => {
        Alert.alert(title, message, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'OK',
                style: dangerMode ? 'destructive' : 'default',
                onPress: async () => {
                    await action();
                }
            }
        ]);
    },
    style: (colors?: Colors) => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors && colors.background ? colors.background : 'transparent'
        },
        boxContainer: {
            display: 'flex',
            // flex: 1,
            width: '93%',
            justifyContent: 'space-between',
            alignSelf: 'center'
        },
        header: {
            fontFamily: 'Work Sans',
            fontWeight: 'bold',
            fontSize: 24,
            color: colors && colors.text || '#000000'
        },
        title: {
            fontFamily: 'Work Sans',
            fontWeight: 'bold',
            fontSize: 16,
            color: colors && colors.text || '#000000'
        }
    })
};

T.language = (texts?, lg?: string): string | object => {
    if (lg == undefined || (lg != 'vi' && lg != 'en')) lg = 'vi';
    return texts ? (texts[lg] ? texts[lg] : {}) : lg;
};

T.language.parse = (text, getAll?: boolean): string | object => {
    let obj: ({ vi: any, en: any }) = { vi: null, en: null };
    try { obj = JSON.parse(text) } catch { }
    if (obj.vi == null) obj.vi = text;
    if (obj.en == null) obj.en = text;
    return getAll ? obj : obj[T.language()];
};

// @ts-ignore
String.prototype.viText = function () {
    return T.language.parse(this, true).vi;
};

// @ts-ignore
String.prototype.replaceAll = function (search, replacement) {
    return this.replace(new RegExp(search, 'g'), replacement);
};

export default T;