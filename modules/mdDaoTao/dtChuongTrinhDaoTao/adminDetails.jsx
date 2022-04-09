import React from 'react';
import { connect } from 'react-redux';
import { createMultiDtChuongTrinhDaoTao, getDtChuongTrinhDaoTaoByBoMon } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormSelect, FormTextBox } from 'view/component/AdminPage';
import ComponentKienThuc from './componentKienThuc';
import { SelectAdapter_DmBoMon } from 'modules/mdDanhMuc/dmBoMon/redux';


class DtChuongTrinhDaoTaoDetails extends AdminPage {

    componentDidMount() {
        T.ready('/user/pdt', () => {
            const route = T.routeMatcher('/user/pdt/chuong-trinh-dao-tao/:maDonVi/:namDaoTao');
            let maDonVi = route.parse(window.location.pathname)?.maDonVi,
                namDaoTao = route.parse(window.location.pathname)?.namDaoTao;
            this.url = maDonVi && maDonVi != 'new' ? maDonVi : null;
            if (maDonVi && namDaoTao) {
                this.props.getDtChuongTrinhDaoTaoByBoMon(maDonVi, namDaoTao, (data) => {
                    this.kienThucDaiCuong.setVal(data);
                });
            }
            if (!maDonVi) {
                maDonVi = this.props.system?.user?.maDonVi;
                this.kienThucDaiCuong.setVal();
            }
            this.boMon.value(maDonVi);
            this.namDaoTao.value(namDaoTao);


        });
    }

    save = () => {
        const kienThucDaiCuong = this.kienThucDaiCuong.getValue();
        if (kienThucDaiCuong) {
            const namDaoTao = this.namDaoTao.value();
            const maBoMon = this.boMon.value();
            if (!namDaoTao) {
                T.notify('Năm đào tạo bị trống!', 'danger');
                this.namDaoTao.focus();
            } else {
                const data = { items: kienThucDaiCuong, ...{ namDaoTao, maBoMon } };
                console.log(data);
                this.props.createMultiDtChuongTrinhDaoTao(data, (rs) => { console.log(rs); });
            }
        }
    }

    render() {
        const isData = this.props.dtChuongTrinhDaoTao ? this.props.dtChuongTrinhDaoTao : null;
        const permission = this.getUserPermission('dtChuongTrinhDaoTao', ['read', 'readAll', 'write', 'delete']);
        const readOnly = !permission.write;

        return this.renderPage({
            icon: 'fa fa-university',
            title: isData ? 'Chỉnh sửa chương trình đào tạo' : 'Tạo mới chương trình đào tạo',
            breadcrumb: [
                <Link key={0} to='/user/pdt'>Đào tạo</Link>,
                'Chương trình đào tạo'
            ],
            content: <>
                <div className="tile">
                    <FormSelect ref={e => this.boMon = e} data={SelectAdapter_DmBoMon} label='Khoa' className='col-12' readOnly={true} />
                    <FormTextBox type="text" ref={e => this.namDaoTao = e} label='Năm đào tạo' className='col-4' required readOnly={readOnly} />
                    {/* <FormTextBox type="text" ref={e => this.boMon = e} label='Khoa' className='col-md-4' required readOnly={readOnly} /> */}
                </div>

                <ComponentKienThuc title={'Kiến thức giáo dục đại cương'} ref={e => this.kienThucDaiCuong = e} />

            </>,
            backRoute: '/user/pdt',
            onSave: permission.write ? this.save : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtChuongTrinhDaoTao: state.daoTao.dtChuongTrinhDaoTao });
const mapActionsToProps = { createMultiDtChuongTrinhDaoTao, getDtChuongTrinhDaoTaoByBoMon };
export default connect(mapStateToProps, mapActionsToProps)(DtChuongTrinhDaoTaoDetails);