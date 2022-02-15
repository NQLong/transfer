//TEMPLATES: admin
import React from 'react';
import SubMenusPage from 'view/component/SubMenusPage';

export default {
    redux: {},
    routes: [
        // {
        //     path: '/user',
        //     component: () => <SubMenusPage menuLink='/user' menuKey={1000} headerIcon='fa-user' />
        // },
        {
            path: '/user/tccb',
            component: () => <SubMenusPage menuLink='/user/tccb' menuKey={3000} headerIcon='fa-list-alt' />
        },
        {
            path: '/user/truyen-thong',
            component: () => <SubMenusPage menuLink='/user/truyen-thong' menuKey={5000} headerIcon='fa-list-alt' />
        },
        {
            path: '/user/settings',
            component: () => <SubMenusPage menuLink='/user/settings' menuKey={2000} headerIcon='fa-list-alt' />
        },
        {
            path: '/user/category',
            component: () => <SubMenusPage menuLink='/user/category' menuKey={4000} headerIcon='fa-list-alt' />
        },
        {
            path: '/user/websites',
            component: () => <SubMenusPage menuLink='/user/websites' menuKey={1900} headerIcon='fa-list-alt' />
        },
    ]
};