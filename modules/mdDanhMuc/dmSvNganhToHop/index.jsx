//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmSvNganhToHop from './redux';

export default {
  redux: {
    parent: 'danhMuc',
    reducers: { dmSvNganhToHop }
  },
  routes: [
    {
      path: '/user/danh-muc/dao-tao/nganh-theo-to-hop-thi',
      component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
    },
  ],
};