import io from 'socket.io-client';
import dateformat from 'dateformat';
import { Platform, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import CookieManager from '@react-native-cookies/cookies';
import Config from '@/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, } from '@react-native-google-signin/google-signin';


const instance = axios.create({
    baseURL: Config.API_URL,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
    },
    timeout: 3000
});

instance.interceptors.response.use(
    (response) => {
        return response ? response.data : null
    },
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
    validateEmail: (email: string): boolean => (/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i).test(String(email).toLowerCase()),
    get: instance.get,
    post: instance.post,
    put: instance.put,
    delete: instance.delete,
    alert: (title: string, message: string, buttons: any[] = [{ text: 'Ok' }]): void => {
        Alert.alert(title, message, buttons);
    },
    confirm: (title: string, message: string, dangerMode: boolean, action): void => {
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

T.googleSignin = async () => {
    try {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();
        return userInfo;
    } catch (error) {
        console.error(error);
        T.alert('Đăng nhập','Đăng nhập thất bại');
    }
}

T.verifyToken = async (token, email = Config.DEBUG_EMAIL) => {
    T.clearCookie();
    const axiosInstance = axios.create({
        baseURL: Config.API_URL,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        timeout: 3000
    });

    axiosInstance.interceptors.response.use(
        (response) => {
            return response || null
        },
        ({ message, response: { data, status } }) => {
            return Promise.reject({ message, data, status });
        }
    );
    try {
        const body = { idToken: token, email };
        const response = await axiosInstance.post('/auth/mobile/signin', body);
        const cookies = response.headers['set-cookie'];
        const siginInCookie = cookies.find(item => item.startsWith(Config.COOKIE_NAME));
        if (siginInCookie) {
            await T.storage.set('siginInCookie', siginInCookie);
            return true;
        }
    } catch (error) {
        console.error(error);
        T.alert('Đăng nhập', 'Đăng nhập thất bại');
        return false;
    }

};

T.objectToQueryString = (initialObj) => {
    const reducer = (obj, parentPrefix = null) => (prev, key) => {
        const val = obj[key];
        key = encodeURIComponent(key);
        const prefix = parentPrefix ? `${parentPrefix}[${key}]` : key;

        if (val == null || typeof val === 'function') {
            prev.push(`${prefix}=`);
            return prev;
        }

        if (['number', 'boolean', 'string'].includes(typeof val)) {
            prev.push(`${prefix}=${encodeURIComponent(val)}`);
            return prev;
        }

        prev.push(Object.keys(val).reduce(reducer(val, prefix), []).join('&'));
        return prev;
    };

    return Object.keys(initialObj).reduce(reducer(initialObj), []).join('&');
};


T.storage = {
    get: async (key) => {
        try {
            const res = {}
            res[key] = await AsyncStorage.getItem(key);
            return res;
        } catch (error) {
            return null;
        }
    },

    set: async (key, value) => {
        try {
            await AsyncStorage.setItem(key, value);
            return true;
        } catch (error) {
            return null;
        }
    },

    remove: async (key) => {
        try {
            await AsyncStorage.removeItem(key);
            return true;
        } catch (error) {
            return null;
        }
    },

    clear: async () => {
        try {
            await AsyncStorage.clear();
            return true;
        } catch (error) {
            return null;
        }

    }
};
T.setCookie = async () => {
    const data = await T.storage.get('siginInCookie');
    if (data && data.siginInCookie) {
        console.log({ data })
        await CookieManager.setFromResponse(Config.API_URL, data.siginInCookie);
    }
}

T.isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize, paddingToBottom }) => {
    const paddingToBottomValue = paddingToBottom || 20;
    return layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottomValue;
};


T.hasCookie = async (key = Config.COOKIE_NAME) => {
    const cookie = await CookieManager.get(Config.API_URL);
    return cookie[key];
}
T.config = Config;
T.isDebug = Config.API_URL != 'https://hcmussh.edu.vn/';
// T.isDebug = false;

// @ts-ignore
String.prototype.viText = function () {
    return T.language.parse(this, true).vi;
};

// @ts-ignore
String.prototype.replaceAll = function (search, replacement) {
    return this.replace(new RegExp(search, 'g'), replacement);
};

// @ts-ignore
String.prototype.normalizedName = function () {
    let convertToArray = this.toLowerCase().split(' ');
    let result = convertToArray.map(function (val) {
        return val.replace(val.charAt(0), val.charAt(0).toUpperCase());
    });
    return result.join(' ');
}

export default T;