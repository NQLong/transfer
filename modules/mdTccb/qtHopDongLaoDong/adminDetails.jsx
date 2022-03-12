import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getQtHopDongLaoDongEdit, getHopDongMoiNhat, createQtHopDongLaoDong, updateQtHopDongLaoDong } from './redux';
import { AdminPage } from 'view/component/AdminPage';
import ComponentPhiaTruong from './componentPhiaTruong';
import ComponentPhiaCanBo from './componentPhiaCanBo';
import { getStaff, updateStaff, createStaff } from '../tccbCanBo/redux';
import ComponentDieuKhoan from './componentDieuKhoan';

class HDLD_Details extends AdminPage {
    url = '';
    state = { canUpdate: false }

    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/qua-trinh/hop-dong-lao-dong/:ma'),
                ma = route.parse(window.location.pathname).ma;
            this.url = ma && ma != 'new' ? ma : null;
            if (this.url) {
                this.props.getQtHopDongLaoDongEdit(ma, data => {
                    if (data.error) {
                        T.notify('Lấy thông tin hợp đồng bị lỗi!', 'danger');
                    } else {
                        this.phiaTruong.setVal(data.item.qtHopDongLaoDong);
                        this.phiaCanBo.setVal(data.item.canBoDuocThue);
                        this.dieuKhoan.setVal(data.item.qtHopDongLaoDong);
                    }
                });
            } else {
                this.phiaTruong.setVal();
                this.phiaCanBo.setVal();
                this.dieuKhoan.setVal();
            }
        });
    }

    handleCanBoChange = (value) => {
        this.props.getStaff(value, data => {
            data.item.isTaoMoi = true;
            this.phiaCanBo.setVal(data.item);
        });
    }

    validateNewest = (ngayKyHopDong, shcc, done) => {
        this.props.getHopDongMoiNhat(shcc, data => {
            data && this.setState({ canUpdate: ngayKyHopDong >= data.ngayKyHopDong }, () => {
                if (done) done(this.state.canUpdate);
            });
        });
    }

    save = () => {
        const dataPhiaTruong = this.phiaTruong.getValue();
        const dataPhiaCanBo = this.phiaCanBo.getValue();
        const dataDieuKhoan = this.dieuKhoan.getValue();
        dataDieuKhoan.nguoiDuocThue = dataPhiaCanBo.shcc;
        Object.assign(dataDieuKhoan, dataPhiaTruong);
        dataPhiaCanBo.ngach = dataDieuKhoan.maNgach;
        dataPhiaCanBo.bacLuong = dataDieuKhoan.bac;
        dataPhiaCanBo.heSoLuong = dataDieuKhoan.heSo;
        let ma = dataDieuKhoan.ma;
        delete dataDieuKhoan.ma;
        this.validateNewest(dataDieuKhoan.ngayKyHopDong, dataDieuKhoan.nguoiDuocThue, (canUpdateCanBo) => {
            if (dataPhiaTruong && dataPhiaCanBo && dataDieuKhoan) {
                if (canUpdateCanBo) {
                    T.confirm3('Cập nhật dữ liệu cán bộ', 'Bạn có muốn <b>Lưu hợp đồng</b> và <b>cập nhật</b> dữ liệu hiện tại bằng dữ liệu mới không?<br>Nếu không rõ, hãy chọn <b>Không cập nhật</b>!', 'warning', 'Không cập nhật', 'Cập nhật', isOverride => {
                        if (isOverride !== null) {
                            if (isOverride)
                                T.confirm('Xác nhận', 'Lưu hợp đồng và <b>cập nhật</b> dữ liệu cán bộ?', 'warning', true, isConfirm => {
                                    if (isConfirm) {
                                        !ma ? this.props.createQtHopDongLaoDong(dataDieuKhoan) : this.props.updateQtHopDongLaoDong(ma, dataDieuKhoan);
                                        this.props.updateStaff(dataPhiaCanBo.shcc, dataPhiaCanBo);
                                    }
                                });
                            else T.confirm('Xác nhận', 'Lưu hợp đồng và <b> không cập nhật </b> dữ liệu cán bộ?', 'warning', true, isConfirm => {
                                if (isConfirm) !ma ? this.props.createQtHopDongLaoDong(dataDieuKhoan) : this.props.updateQtHopDongLaoDong(ma, dataDieuKhoan);
                            });
                        }
                    });
                } else {
                    if (dataPhiaCanBo.isTaoMoi) T.confirm('Xác nhận', 'Lưu hợp đồng và <b> thêm dữ liệu cán bộ mới </b>?', 'warning', true, isConfirm => {
                        if (isConfirm) {
                            this.props.createStaff(dataPhiaCanBo);
                            this.props.createQtHopDongLaoDong(dataDieuKhoan);
                        }
                    });
                    else
                        !ma ? this.props.createQtHopDongLaoDong(dataDieuKhoan) : this.props.updateQtHopDongLaoDong(ma, dataDieuKhoan);
                }
            }
        });
    }

    render() {
        const isData = this.props.qtHopDongLaoDong ? this.props.qtHopDongLaoDong : null;
        const currentPermission = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        let permissionWrite = currentPermission.includes('qtHopDongLaoDong:write');
        return this.renderPage({
            icon: 'fa fa-briefcase',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                <Link key={1} to='user/tccb/hop-dong-lao-dong'>Danh sách hợp đồng</Link>,
                'Hợp đồng cán bộ'
            ],
            title: isData ? 'Chỉnh sửa hợp đồng lao động' : 'Tạo mới hợp đồng lao động',
            content: <>
                <ComponentPhiaTruong ref={e => this.phiaTruong = e} />
                <ComponentPhiaCanBo ref={e => this.phiaCanBo = e}
                    onCanBoChange={(value) => this.handleCanBoChange(value)} />
                <ComponentDieuKhoan ref={e => this.dieuKhoan = e} />
            </>,
            backRoute: '/user/tccb/qua-trinh/hop-dong-lao-dong',
            onSave: permissionWrite ? this.save : null,
        });
    }

}

const mapStateToProps = state => ({ system: state.system, qtHopDongLaoDong: state.tccb.qtHopDongLaoDong });
const mapActionsToProps = {
    getQtHopDongLaoDongEdit, getStaff, getHopDongMoiNhat, updateStaff, createStaff, createQtHopDongLaoDong, updateQtHopDongLaoDong
};
export default connect(mapStateToProps, mapActionsToProps)(HDLD_Details);