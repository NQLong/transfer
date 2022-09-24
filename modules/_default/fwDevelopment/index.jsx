//TEMPLATES: admin
// eslint-disable-next-line no-unused-vars
import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import T from 'view/js/common';

export default {
    routes: !T.debug ? [] : [
        {
            path: '/user/admin-page-wiki',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
        {
            path: '/user/admin-page-wiki/admin-page-support',
            component: Loadable({ loading: Loading, loader: () => import('./adminPageSupport/supportPage') }),
        },
    ],
};