import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import { configureStore } from '@reduxjs/toolkit';
import Reactotron from 'reactotron-react-native';
// import home from './home';
// import news from './news';
// import daiHoi from './daiHoi';
import settings from './settings';
import hcthCongVanDen from '@/Component/Screens/hcth/hcthCongVanDen/redux';
// import hcthCongVanCacPhong from '@/Component/Screens/hcth/hcthCongVanCacPhong/redux';

import hcthVanBanDi from '@/Component/Screens/hcth/hcthVanBanDi/redux';
import hcthCongVanTrinhKy from '@/Component/Screens/hcth/hcthCongVanTrinhKy/redux';
import notification from '@/Component/Screens/notification/redux';
import hcthChuKy from '@/Component/Screens/hcth/hcthChuKy/redux';


const reducers = combineReducers({ settings, hcthCongVanDen, hcthCongVanTrinhKy, notification, hcthVanBanDi, hcthChuKy });

const persistConfig = {
    key: 'root',
    storage: AsyncStorage
};

export const store = configureStore({
    reducer: persistReducer(persistConfig, reducers),
    middleware: (getDefaultMiddleware) => {
        const middlewares = getDefaultMiddleware({ serializableCheck: false, immutableCheck: false });
        if (__DEV__ && !process.env.JEST_WORKER_ID) {
            Reactotron
                .setAsyncStorageHandler(AsyncStorage)
                .configure({ name: 'React Native' })
                .useReactNative()
                .connect();

            const createDebugger = require('redux-flipper').default;
            middlewares.push(createDebugger());
        }

        return middlewares;
    },
});

export const persistor = persistStore(store);