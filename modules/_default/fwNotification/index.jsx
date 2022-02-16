//TEMPLATES: admin
// eslint-disable-next-line no-unused-vars
import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import notification from './redux';

export default {
    redux: {
        notification,
    },
    routes: [
        {
            path: '/user/notification',
            component: Loadable({ loading: Loading, loader: () => import('./userPage') }),
        }
    ]
};