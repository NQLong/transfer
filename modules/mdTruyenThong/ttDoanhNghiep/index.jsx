// eslint-disable-next-line no-unused-vars
import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import nguoiLienHe from './reduxNguoiLienHe';
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
        reducers: { nguoiLienHe, doanhNghiep },
    },
    routes: [
        { path: '/user/ero/nguoi-lien-he', component: Loadable({ loading: Loading, loader: () => import('./adminNguoiLienHe') }) },
        { path: '/user/ero/doanh-nghiep', component: Loadable({ loading: Loading, loader: () => import('./adminDoanhNghiep') }) },
        { path: '/user/ero/doanh-nghiep/edit/:doanhNghiepId', component: Loadable({ loading: Loading, loader: () => import('./adminDoanhNghiepEditPage') }) },
        { path: '/user/ero/dai-dien-doanh-nghiep', component: Loadable({ loading: Loading, loader: () => import('./adminDaiDienDoanhNghiepPage') }) },
        { path: '/doanh-nghiep/:hiddenShortName', component: Loadable({ loading: Loading, loader: () => import('./PageCompany') }) },
    ]
};