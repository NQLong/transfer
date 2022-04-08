import React from 'react';
import { connect } from 'react-redux';
import { getDtChuongTrinhDaoTaoPage, createDtChuongTrinhDaoTao, updateDtChuongTrinhDaoTao, deleteDtChuongTrinhDaoTao } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';


class DtChuongTrinhDaoTaoDetails extends AdminPage {

    componentDidMount() {
        T.ready('/user/pdt', () => {
            const route = T.routeMatcher('/user/pdt/chuong-trinh-dao-tao/:ma'),
                ma = route.parse(window.location.pathname).ma;
            this.url = ma && ma != 'new' ? ma : null;
            // T.onSearch = (searchText) => this.props.getDtChuongTrinhDaoTaoPage(undefined, undefined, searchText || '');
            // T.showSearchBox();
            // this.props.getDtChuongTrinhDaoTaoPage();
        });
    }

    render() {
        const isData = this.props.dtChuongTrinhDaoTao ? this.props.dtChuongTrinhDaoTao : null;
        const permission = this.getUserPermission('dtChuongTrinhDaoTao', ['read', 'readAll', 'write', 'delete']);

        return this.renderPage({
            icon: 'fa fa-calendar',
            title: isData ? 'Chỉnh sửa chương trình đào tạo' : 'Tạo mới hợp đồng đào tạo',
            breadcrumb: [
                <Link key={0} to='/user/pdt'>Đào tạo</Link>,
                'Chương trình đào tạo'
            ],
            content: <>
                <p>Test</p>
            </>,
            backRoute: '/user/pdt',
            onSave: permission.write ? this.save : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtChuongTrinhDaoTao: state.daoTao.dtChuongTrinhDaoTao });
const mapActionsToProps = { getDtChuongTrinhDaoTaoPage, createDtChuongTrinhDaoTao, updateDtChuongTrinhDaoTao, deleteDtChuongTrinhDaoTao };
export default connect(mapStateToProps, mapActionsToProps)(DtChuongTrinhDaoTaoDetails);