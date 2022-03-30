//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmSvNganhDaoTao from './redux';

export default {
  redux: {
    parent: 'danhMuc',
    reducers: { dmSvNganhDaoTao }
  },
  routes: [
    {
      path: '/user/danh-muc/dao-tao/nganh-dao-tao',
      component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
    },
  ],
};