import React from 'react';
import { connect } from 'react-redux';
import { createMultiDtChuongTrinhDaoTao, getDtChuongTrinhDaoTao, getDtKhungDaoTao } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormSelect, FormTextBox } from 'view/component/AdminPage';
import ComponentKienThuc from './componentKienThuc';
import { SelectAdapter_DmBoMon } from 'modules/mdDanhMuc/dmBoMon/redux';


class DtChuongTrinhDaoTaoDetails extends AdminPage {

    componentDidMount() {
        T.ready('/user/pdt', () => {
            const route = T.routeMatcher('/user/pdt/chuong-trinh-dao-tao/:ma');
            this.ma = route.parse(window.location.pathname)?.ma;
            if (this.ma !== 'new') {
                this.props.getDtKhungDaoTao(this.ma, (data) => {
                    this.khoa.value(data.maKhoa);
                    this.namDaoTao.value(data.namDaoTao);
                    this.props.getDtChuongTrinhDaoTao(this.ma, (ctdt) => {
                        //TODO: Group SQL
                        [this.kienThucDaiCuong, this.kienThucCoSoNganh, this.kienThucChuyeNganh, this.kienThucBoTro, this.kienThucLVTN].forEach(e => e.setVal(ctdt, data.maKhoa));
                    });
                });
            } else {
                const maKhoa = this.props.system?.user?.maDonVi;
                this.khoa.value(maKhoa);
                [this.kienThucDaiCuong, this.kienThucCoSoNganh, this.kienThucChuyeNganh, this.kienThucBoTro, this.kienThucLVTN].forEach(e => e.setVal(null, maKhoa));
            }

        });
    }

    save = () => {
        const kienThucDaiCuong = this.kienThucDaiCuong.getValue() || [];
        const kienThucCoSoNganh = this.kienThucCoSoNganh.getValue() || [];
        const kienThucChuyeNganh = this.kienThucChuyeNganh.getValue() || [];
        const kienThucBoTro = this.kienThucBoTro.getValue() || [];
        const kienThucLVTN = this.kienThucLVTN.getValue() || [];
        const namDaoTao = this.namDaoTao.value();
        const maKhoa = this.khoa.value();
        if (!namDaoTao) {
            T.notify('Năm đào tạo bị trống!', 'danger');
            this.namDaoTao.focus();
        } else {
            const items = [...kienThucDaiCuong, ...kienThucCoSoNganh, ...kienThucChuyeNganh, ...kienThucBoTro, ...kienThucLVTN];
            const data = { items: items, ...{ id: this.ma, namDaoTao, maKhoa } };
            this.props.createMultiDtChuongTrinhDaoTao(data, () => {
                location.reload();
            });
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
                    <FormSelect ref={e => this.khoa = e} data={SelectAdapter_DmBoMon} label='Khoa' className='col-12' readOnly={true} />
                    <FormTextBox type="text" ref={e => this.namDaoTao = e} label='Năm đào tạo' className='col-4' required readOnly={readOnly} />
                    {/* <FormTextBox type="text" ref={e => this.khoa = e} label='Khoa' className='col-md-4' required readOnly={readOnly} /> */}
                </div>

                <ComponentKienThuc title={'Kiến thức giáo dục đại cương'} khoiKienThucId={1} ref={e => this.kienThucDaiCuong = e} />
                <ComponentKienThuc title={'Kiến thức cơ sở ngành'} khoiKienThucId={9} ref={e => this.kienThucCoSoNganh = e} />
                <ComponentKienThuc title={'Kiến thức chuyên ngành'} khoiKienThucId={10} ref={e => this.kienThucChuyeNganh = e} />
                <ComponentKienThuc title={'Kiến thức bổ trợ'} khoiKienThucId={33} ref={e => this.kienThucBoTro = e} />
                <ComponentKienThuc title={'Thực tập, khóa luận/luận văn tốt nghiệp'} khoiKienThucId={11} ref={e => this.kienThucLVTN = e} />

            </>,
            backRoute: '/user/pdt/chuong-trinh-dao-tao',
            onSave: permission.write ? this.save : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtChuongTrinhDaoTao: state.daoTao.dtChuongTrinhDaoTao });
const mapActionsToProps = { createMultiDtChuongTrinhDaoTao, getDtChuongTrinhDaoTao, getDtKhungDaoTao };
export default connect(mapStateToProps, mapActionsToProps)(DtChuongTrinhDaoTaoDetails);