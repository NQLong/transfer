//TEMPLATES: admin|home|unit
// eslint-disable-next-line no-unused-vars
import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import fwSmsDmPurpose from './redux';

export default {
    redux: {
        parent: 'doiNgoai',
        reducers: { fwSmsDmPurpose },
    },
    routes: [
        {
            path: '/user/truyen-thong/sms/muc-dich',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ]
};