//TEMPLATES: admin

// import Loadable from 'react-loadable';
// import Loading from 'view/component/Loading';
import dtDsMonMo from './redux';

export default {
     redux: {
          parent: 'daoTao',
          reducers: { dtDsMonMo }
     },
     routes: [
          // {
          //   path: '/user/dao-tao/danh-sach-mon-mo/:id',
          //   component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
          // },
          // {
          //   path: '/user/dao-tao/danh-sach-mon-mo',
          //   component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
          // },
     ],
};