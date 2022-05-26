//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmSvBacDaoTao from './redux';

export default {
  redux: {
    parent: 'danhMuc',
    reducers: { dmSvBacDaoTao }
  },
  routes: [
    {
      path: '/user/danh-muc/bac-dao-tao',
      component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
    },
    {
      path: '/user/dao-tao/bac-dao-tao',
      component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
    },
  ],
};