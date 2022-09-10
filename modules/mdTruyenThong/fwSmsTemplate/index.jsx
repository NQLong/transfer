//TEMPLATES: admin|home|unit
// eslint-disable-next-line no-unused-vars
import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import fwSmsTemplate from './redux';

export default {
    redux: {
        parent: 'doiNgoai',
        reducers: { fwSmsTemplate },
    },
    routes: [
        {
            path: '/user/truyen-thong/sms/template',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ]
};