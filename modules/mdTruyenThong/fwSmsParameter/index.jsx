//TEMPLATES: admin|home|unit
// eslint-disable-next-line no-unused-vars
import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import fwSmsParameter from './redux';

export default {
    redux: {
        parent: 'doiNgoai',
        reducers: { fwSmsParameter },
    },
    routes: [
        {
            path: '/user/truyen-thong/sms/parameter-sms',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ]
};