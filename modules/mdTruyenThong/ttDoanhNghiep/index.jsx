//TEMPLATES: admin
// eslint-disable-next-line no-unused-vars
import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import doanhNghiep from './reduxDoanhNghiep';
// import SectionHexagonCompany from './SectionHexagonCompany';

export default {
    // init: () => {
    //     T.component['all companies'] = {
    //         render: (viewId) => <SectionHexagonCompany loai={viewId} />,
    //         text: 'Tất cả doanh nghiệp',
    //         backgroundColor: '#34fa45',
    //         adapter: SelectAdapter_Category('doanhNghiep')
    //     };
    // },
    redux: {
        parent: 'doiNgoai',
        reducers: { doanhNghiep },
    },
    routes: [
        { path: '/user/ocer/doanh-nghiep', component: Loadable({ loading: Loading, loader: () => import('./adminDoanhNghiep') }) },
        { path: '/user/ocer/doanh-nghiep/edit/:doanhNghiepId', component: Loadable({ loading: Loading, loader: () => import('./adminDoanhNghiepEditPage') }) },
        { path: '/doanh-nghiep/:hiddenShortName', component: Loadable({ loading: Loading, loader: () => import('./PageCompany') }) },
    ]
};