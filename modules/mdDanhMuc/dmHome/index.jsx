//TEMPLATES: admin
import React from 'react';
import SubMenusCategory from 'view/component/SubMenusCategory';
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
            component: () => <SubMenusPage menuLink='/user/tccb' menuKey={3000} headerIcon='fa-pie-chart' />
        },
        {
            path: '/user/truyen-thong',
            component: () => <SubMenusPage menuLink='/user/truyen-thong' menuKey={6000} headerIcon='fa-list-alt' />
        },
        {
            path: '/user/settings',
            component: () => <SubMenusPage menuLink='/user/settings' menuKey={2000} headerIcon='fa-list-alt' />
        },
        {
            path: '/user/category',
            component: () => <SubMenusCategory menuLink='/user/category' menuKey={4000} headerIcon='fa-list-alt' />
        },
        {
            path: '/user/websites',
            component: () => <SubMenusPage menuLink='/user/websites' menuKey={1900} headerIcon='fa-list-alt' />
        },
        {
            path: '/user/library',
            component: () => <SubMenusPage menuLink='/user/library' menuKey={8000} headerIcon='fa-th-large' />
        },
        {
            path: '/user/dao-tao',
            component: () => <SubMenusPage menuLink='/user/dao-tao' menuKey={7000} headerIcon='fa-diamond' />
        },
        {
            path: '/user/khcn',
            component: () => <SubMenusPage menuLink='/user/khcn' menuKey={9500} headerIcon='fa-rocket' />
        },
        {
            path: '/user/students',
            component: () => <SubMenusPage menuLink='/user/students' menuKey={6100} headerIcon='fa-users' />
        },
        {
            path: '/user/hcth',
            component: () => <SubMenusPage menuLink='/user/hcth' menuKey={500} headerIcon='fa-book' />
        }
    ]
};