//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtNganhToHop from './redux';

export default {
  redux: {
    parent: 'danhMuc',
    reducers: { dtNganhToHop }
  },
  routes: [
    {
      path: '/user/pdt/nganh-theo-to-hop-thi',
      component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
    },
  ],
};