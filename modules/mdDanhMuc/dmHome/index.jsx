//TEMPLATES: admin
import React from 'react';
import SubMenusPage from 'view/component/SubMenusPage';

export default {
    redux: {},
    routes: [
        {
            path: '/user/category',
            component: () => <SubMenusPage menuLink='/user/category' menuKey={4000} headerIcon='fa-list-alt' />
        },
        {
            path: '/user/websites',
            component: () => <SubMenusPage menuLink='/user/websites' menuKey={1006} headerIcon='fa-list-alt' />
        },
    ]
};