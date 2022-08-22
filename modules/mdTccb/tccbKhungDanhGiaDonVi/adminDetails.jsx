import React from 'react';
import { connect } from 'react-redux';
import { createTccbKhungDanhGiaDonVi, updateTccbKhungDanhGiaDonVi, getTccbKhungDanhGiaDonVi } from './redux';
import { Link } from 'react-router-dom';
import ComponentDGDV from './componentDGDV';
import { SelectAdapter_DmDonViAll } from '../../mdDanhMuc/dmDonVi/redux';
import { AdminPage, FormDatePicker, FormTextBox, FormSelect } from 'view/component/AdminPage';
import Loading from 'view/component/Loading';

class TccbKhungDanhGiaDonViDetails extends AdminPage {
    state = { isLoading: true }

    componentDidMount() {
        T.ready('/user/danh-gia/cau-truc-khung-danh-gia-don-vi', () => {
            const route = T.routeMatcher('/user/danh-gia/cau-truc-khung-danh-gia-don-vi/:id');
            this.id = route.parse(window.location.pathname)?.id;
            this.setState({ isLoading: false });
            const query = new URLSearchParams(this.props.location.search);
            const id = query.get('id');
            if (this.id !== 'new') {
                this.getData(this.id);
            } else {
                if (id > 0) {
                    this.getData(id, true);
                    return;
                }
            }
        });
    }

    getData = (id, isClone = false) => {
        this.props.getTccbKhungDanhGiaDonVi(id, (dgdv) => {
            this.setState({ maDonVi: dgdv.maDonVi });
            let { nam, maDonVi, batDauDangKy, ketThucDangKy } = dgdv;
            this.nam.value(isClone ? (Number(nam) + 1) : Number(nam));
            this.maDonVi.value(maDonVi);
            this.batDauDangKy.value(isClone ? new Date().getTime() : batDauDangKy);
            this.ketThucDangKy.value(isClone ? new Date().getTime() : ketThucDangKy);
            const mucCha = T.parse(dgdv.mucCha, {
                danhGiaDonVi: {}
            });
            const mucCon = T.parse(dgdv.mucCon, {
                danhGiaDonVi: {}
            });
            this.danhGiaDonVi.setVal({ parents: mucCha.danhGiaDonVi, childs: mucCon.danhGiaDonVi });
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
                nam: this.validation(this.nam),
                maDonVi: this.validation(this.maDonVi),
                batDauDangKy: this.validation(this.batDauDangKy).setHours(0, 0, 0, 0),
                ketThucDangKy: this.validation(this.ketThucDangKy).setHours(23, 59, 59, 999)
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
            if (data.batDauDangKy >= data.ketThucDangKy) {
                T.notify('Thời hạn đăng ký không hợp lệ', 'danger');
                this.batDauDangKy.focus();
                return;
            }
            const danhGiaDonVi = this.danhGiaDonVi.getValue() || { parents: [], childrens: {} };

            const mucCha = {
                danhGiaDonVi: {}
            };
            const mucCon = {
                danhGiaDonVi: {}
            };

            danhGiaDonVi.parents.forEach((dgdv) => {
                const { id, content } = dgdv;
                mucCha.danhGiaDonVi[id] = content;
                mucCon.danhGiaDonVi[id] = danhGiaDonVi.childrens[id];
            });
            if (Object.values(mucCha.danhGiaDonVi).some(item => !item) ||
                Object.values(mucCon.danhGiaDonVi).some(items => items?.some(item => !item.content))
            ) {
                T.notify('Vui lòng điền đầy đủ nội dung từng mục', 'danger');
                return;
            }

            let updateDatas = { ...{ mucCha: T.stringify(mucCha) }, ...{ mucCon: T.stringify(mucCon) } };
            if (this.id == 'new') {
                updateDatas = { ...updateDatas, ...data };
                this.props.createTccbKhungDanhGiaDonVi(updateDatas, (item) => {
                    window.location = `/user/danh-gia/cau-truc-khung-danh-gia-don-vi/${item.id}`;
                });
            } else {
                this.props.updateTccbKhungDanhGiaDonVi(this.id, { ...updateDatas, ...data });
            }
        }
    }
    render() {
        const permission = this.getUserPermission('tccbKhungDanhGiaDonVi');
        const readOnly = !permission.write;
        const maDonViCuaUser = String(this.props.system?.user?.maDonVi) || '';
        const canBoPermissionWrite = maDonViCuaUser && this.getCurrentPermissions().includes('tccbKhungDanhGiaDonVi:canBo:write') && this.state.maDonVi && maDonViCuaUser == this.state.maDonVi;
        return this.renderPage({
            icon: 'fa fa-university',
            title: this.id !== 'new' ? 'Chỉnh sửa cấu trúc khung đánh giá đơn vị' : 'Tạo mới cấu trúc khung đánh giá đơn vị',
            subTitle: <span style={{ color: 'red' }}>Lưu ý: Các mục đánh dấu * là bắt buộc</span>,
            breadcrumb: [
                <Link key={1} to='/user/danh-gia/cau-truc-khung-danh-gia-don-vi'>Cấu trúc khung đánh giá đơn vị</Link>,
                this.id !== 'new' ? 'Chỉnh sửa' : 'Tạo mới',
            ],
            content: <>
                {this.state.isLoading && <Loading />}
                <div className='tile'>
                    <h3 className='tile-title'>Thông tin chung</h3>
                    <div className='tile-body'>
                        <div className='row'>
                            <FormTextBox type='year' ref={e => this.nam = e} label='Năm đánh giá' className='col-md-3' required readOnly={readOnly} />
                            <FormSelect ref={e => this.maDonVi = e} label='Đơn vị' data={SelectAdapter_DmDonViAll} className='col-md-3' required readOnly={readOnly} />
                            <FormDatePicker type='date-mask' ref={e => this.batDauDangKy = e} className='col-md-3' label='Bắt đầu đăng ký' required readOnly={readOnly} />
                            <FormDatePicker type='date-mask' ref={e => this.ketThucDangKy = e} className='col-md-3' label='Kết thúc đăng ký' required readOnly={readOnly} />
                        </div>
                    </div>
                </div>
                <div className='tile'>
                    <h3 className='tile-title'>Thông tin đánh giá đơn vị</h3>
                    <div className='tile-body'>
                        <ComponentDGDV ref={e => this.danhGiaDonVi = e} canBoPermissionWrite={canBoPermissionWrite} />
                    </div>
                </div>
            </>,
            backRoute: '/user/danh-gia/cau-truc-khung-danh-gia-don-vi',
            onSave: permission.write || canBoPermissionWrite ? this.save : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tccbKhungDanhGiaDonVi: state.danhGia.tccbKhungDanhGiaDonVi });
const mapActionsToProps = { createTccbKhungDanhGiaDonVi, updateTccbKhungDanhGiaDonVi, getTccbKhungDanhGiaDonVi };
export default connect(mapStateToProps, mapActionsToProps)(TccbKhungDanhGiaDonViDetails);