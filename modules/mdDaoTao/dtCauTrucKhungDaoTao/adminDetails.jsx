import React from 'react';
import { connect } from 'react-redux';
import { createMultiDtCauTrucKhungDaoTao, createDtCauTrucKhungDaoTao, updateDtCauTrucKhungDaoTao, getDtCauTrucKhungDaoTao } from './redux';
import { Link } from 'react-router-dom';
import ComponentMTDT from './componentMTDT';
import ComponentCTDT from './componentCTDT';
import { AdminPage, FormTextBox } from 'view/component/AdminPage';
import Loading from 'view/component/Loading';
class DtCauTrucKhungDaoTaoDetails extends AdminPage {
    state = { isLoading: true }

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            const route = T.routeMatcher('/user/dao-tao/cau-truc-khung-dao-tao/:ma');
            this.ma = route.parse(window.location.pathname)?.ma;
            this.setState({ isLoading: false });
            const query = new URLSearchParams(this.props.location.search);
            const id = query.get('id');
            if (this.ma !== 'new') {
                this.getData(this.ma);
            } else {
                if (id > 0) {
                    this.getData(id, true);
                    return;
                }
                [this.mucTieuDaoTao, this.chuongTrinhDaoTao].forEach(e => e.setVal({ parents: {}, childs: {} }));
            }
        });
    }

    getData = (id, isClone = false) => {
        this.props.getDtCauTrucKhungDaoTao(id, (ctkdt) => {
            if (isClone) {
                ctkdt.namDaoTao = parseInt(ctkdt.namDaoTao) + 1;
            }
            this.namDaoTao.value(ctkdt.namDaoTao);
            const mucCha = T.parse(ctkdt.mucCha, { mucTieuDaoTao: {}, chuongTrinhDaoTao: {} });
            const mucCon = T.parse(ctkdt.mucCon, { mucTieuDaoTao: {}, chuongTrinhDaoTao: {} });
            this.mucTieuDaoTao.setVal({ parents: mucCha.mucTieuDaoTao, childs: mucCon.mucTieuDaoTao });
            this.chuongTrinhDaoTao.setVal({ parents: mucCha.chuongTrinhDaoTao, childs: mucCon.chuongTrinhDaoTao });
        });
    }

    validation = (selector) => {
        const data = selector.value();
        const isRequired = selector.props.required;
        if (data || data === 0) return data;
        if (isRequired) throw selector;
        return '';
    };

    getValue = () => {
        try {
            const data = {
                namDaoTao: this.validation(this.namDaoTao),
            };
            return data;
        } catch (selector) {
            selector.focus();
            T.notify('<b>' + (selector.props.placeholder || selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            return false;
        }
    }

    save = () => {
        const data = this.getValue();
        if (data) {
            const mucTieuDaoTao = this.mucTieuDaoTao.getValue() || { parents: [], childrens: {} };
            const chuongTrinhDaoTao = this.chuongTrinhDaoTao.getValue() || { parents: [], childrens: {} };

            const mucCha = { mucTieuDaoTao: {}, chuongTrinhDaoTao: {} };
            const mucCon = { mucTieuDaoTao: {}, chuongTrinhDaoTao: {} };

            //1 mucTieuDaoTao, 2 chuongTrinhDaoTao
            mucTieuDaoTao.parents.forEach((mtDt) => {
                const { id, value } = mtDt;
                mucCha.mucTieuDaoTao[id] = value;
                mucCon.mucTieuDaoTao[id] = mucTieuDaoTao.childrens[id];
            });

            chuongTrinhDaoTao.parents.forEach((ctDt) => {
                const { id, value } = ctDt;
                mucCha.chuongTrinhDaoTao[id] = value;
                mucCon.chuongTrinhDaoTao[id] = chuongTrinhDaoTao.childrens[id];
            });

            let updateDatas = { ...{ mucCha: T.stringify(mucCha) }, ...{ mucCon: T.stringify(mucCon) } };
            // const deleteDatas = { items: deleteItems };
            if (this.ma == 'new') {
                updateDatas = { ...updateDatas, ...{ namDaoTao: data.namDaoTao } };
                this.props.createDtCauTrucKhungDaoTao(updateDatas, (item) => {
                    location.replace('/new', `/${item.id}`);
                    location.reload();
                });
            } else {
                this.props.updateDtCauTrucKhungDaoTao(this.ma, { ...updateDatas, ...data }, () => {
                    // location.reload();
                });
            }
        }
    }
    render() {
        const permission = this.getUserPermission('dtCauTrucKhungDaoTao', ['read', 'write', 'delete', 'manage']);
        const readOnly = !(permission.write || permission.manage);

        return this.renderPage({
            icon: 'fa fa-university',
            title: this.ma !== 'new' ? 'Chỉnh sửa cấu trúc khung đào tạo' : 'Tạo mới cấu trúc khung đào tạo',
            subTitle: <span style={{ color: 'red' }}>Lưu ý: Các mục đánh dấu * là bắt buộc</span>,
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/cau-truc-khung-dao-tao'>Cấu trúc khung đào tạo</Link>,
                this.ma !== 'new' ? 'Chỉnh sửa' : 'Tạo mới',
            ],
            content: <>
                {this.state.isLoading && <Loading />}
                <div className='tile'>
                    <h3 className='tile-title'>Thông tin chung</h3>
                    <div className='tile-body'>
                        <FormTextBox type='year' ref={e => this.namDaoTao = e} label='Khóa' className='col-md-3' required readOnly={readOnly} />
                    </div>
                </div>
                <div className='tile'>
                    <h3 className='tile-title'>Mục tiêu đào tạo</h3>
                    <div className='tile-body'>
                        <ComponentMTDT ref={e => this.mucTieuDaoTao = e} />
                    </div>
                </div>
                <div className='tile'>
                    <h3 className='tile-title'>Chương trình đào tạo</h3>
                    <div className='tile-body'>
                        <ComponentCTDT ref={e => this.chuongTrinhDaoTao = e} />
                    </div>
                </div>
            </>,
            backRoute: '/user/dao-tao/cau-truc-khung-dao-tao',
            onSave: permission.write || permission.manage ? this.save : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtCauTrucKhungDaoTao: state.daoTao.dtCauTrucKhungDaoTao });
const mapActionsToProps = { createMultiDtCauTrucKhungDaoTao, getDtCauTrucKhungDaoTao, createDtCauTrucKhungDaoTao, updateDtCauTrucKhungDaoTao };
export default connect(mapStateToProps, mapActionsToProps)(DtCauTrucKhungDaoTaoDetails);