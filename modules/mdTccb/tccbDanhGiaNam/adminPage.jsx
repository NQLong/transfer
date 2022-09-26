import React from 'react';
import { connect } from 'react-redux';
import { getTccbDanhGiaNamPage, deleteTccbDanhGiaNam, createTccbDanhGiaNam, updateTccbDanhGiaNam, createTccbDanhGiaNamClone } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell, AdminModal, FormTextBox, FormDatePicker } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() =>
            this.nam.focus()
        ));
    }

    onShow = (item) => {
        let { nam, donViBatDauDangKy, donViKetThucDangKy, nldBatDauDangKy, nldKetThucDangKy, donViBatDauPheDuyet, donViKetThucPheDuyet, truongBatDauPheDuyet, truongKetThucPheDuyet } = item ? item : { nam: 0, donViBatDauDangKy: 0, donViKetThucDangKy: 0, nldBatDauDangKy: 0, nldKetThucDangKy: 0, donViBatDauPheDuyet: 0, donViKetThucPheDuyet: 0, truongBatDauPheDuyet: 0, truongKetThucPheDuyet: 0 };
        this.setState({ item });
        this.nam.value(nam ? Number(nam) : '');
        this.donViBatDauDangKy.value(donViBatDauDangKy ? Number(donViBatDauDangKy) : '');
        this.donViKetThucDangKy.value(donViKetThucDangKy ? Number(donViKetThucDangKy) : '');
        this.nldBatDauDangKy.value(nldBatDauDangKy ? Number(nldBatDauDangKy) : '');
        this.nldKetThucDangKy.value(nldKetThucDangKy ? Number(nldKetThucDangKy) : '');
        this.donViBatDauPheDuyet.value(donViBatDauPheDuyet ? Number(donViBatDauPheDuyet) : '');
        this.donViKetThucPheDuyet.value(donViKetThucPheDuyet ? Number(donViKetThucPheDuyet) : '');
        this.truongBatDauPheDuyet.value(truongBatDauPheDuyet ? Number(truongBatDauPheDuyet) : '');
        this.truongKetThucPheDuyet.value(truongKetThucPheDuyet ? Number(truongKetThucPheDuyet) : '');
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            nam: this.nam.value() ? Number(this.nam.value()) : '',
            donViBatDauDangKy: this.donViBatDauDangKy.value() ? Number(this.donViBatDauDangKy.value()) : '',
            donViKetThucDangKy: this.donViKetThucDangKy.value() ? Number(this.donViKetThucDangKy.value()) : '',
            nldBatDauDangKy: this.nldBatDauDangKy.value() ? Number(this.nldBatDauDangKy.value()) : '',
            nldKetThucDangKy: this.nldKetThucDangKy.value() ? Number(this.nldKetThucDangKy.value()) : '',
            donViBatDauPheDuyet: this.donViBatDauPheDuyet.value() ? Number(this.donViBatDauPheDuyet.value()) : '',
            donViKetThucPheDuyet: this.donViKetThucPheDuyet.value() ? Number(this.donViKetThucPheDuyet.value()) : '',
            truongBatDauPheDuyet: this.truongBatDauPheDuyet.value() ? Number(this.truongBatDauPheDuyet.value()) : '',
            truongKetThucPheDuyet: this.truongKetThucPheDuyet.value() ? Number(this.truongKetThucPheDuyet.value()) : '',
        };
        if (changes.nam == '') {
            T.notify('Thiếu năm', 'danger');
            this.nam.focus();
        } else if (changes.donViBatDauDangKy == '') {
            T.notify('Thiếu ngày bắt đầu đăng ký của đơn vị', 'danger');
            this.donViBatDauDangKy.focus();
        } else if (changes.donViKetThucDangKy == '') {
            T.notify('Thiếu ngày kết thúc đăng ký của đơn vị', 'danger');
            this.donViKetThucDangKy.focus();
        } else if (changes.donViBatDauDangKy >= changes.donViKetThucDangKy) {
            T.notify('Thời hạn đăng ký của đơn vị không phù hợp', 'danger');
            this.donViBatDauDangKy.focus();
        } else if (changes.nldBatDauDangKy == '') {
            T.notify('Thiếu ngày bắt đầu đăng ký của người lao động', 'danger');
            this.nldBatDauDangKy.focus();
        } else if (changes.nldKetThucDangKy == '') {
            T.notify('Thiếu ngày kết thúc đăng ký của người lao động', 'danger');
            this.nldKetThucDangKy.focus();
        } else if (changes.nldBatDauDangKy >= changes.nldKetThucDangKy) {
            T.notify('Thời hạn đăng ký của người lao động không phù hợp', 'danger');
            this.nldBatDauDangKy.focus();
        } else if (changes.donViBatDauPheDuyet == '') {
            T.notify('Thiếu ngày bắt đầu phê duyệt của đơn vị', 'danger');
            this.donViBatDauPheDuyet.focus();
        } else if (changes.donViKetThucPheDuyet == '') {
            T.notify('Thiếu ngày kết thúc phê duyệt của đơn vị', 'danger');
            this.donViKetThucPheDuyet.focus();
        } else if (changes.donViBatDauPheDuyet >= changes.donViKetThucPheDuyet) {
            T.notify('Thời hạn phê duyệt của đơn vị không phù hợp', 'danger');
            this.donViBatDauPheDuyet.focus();
        } else if (changes.truongBatDauPheDuyet == '') {
            T.notify('Thiếu ngày bắt đầu phê duyệt của trường', 'danger');
            this.truongBatDauPheDuyet.focus();
        } else if (changes.truongKetThucPheDuyet == '') {
            T.notify('Thiếu ngày kết thúc phê duyệt của trường', 'danger');
            this.truongKetThucPheDuyet.focus();
        } else if (changes.truongBatDauPheDuyet >= changes.truongKetThucPheDuyet) {
            T.notify('Thời hạn phê duyệt của trường không phù hợp', 'danger');
            this.truongBatDauPheDuyet.focus();
        } else {
            if (!this.state.item || this.state.item.clone) {
                if (!this.state.item) {
                    this.props.createTccbDanhGiaNam(changes, () => {
                        this.hide();
                        this.props?.history.push(`/user/tccb/danh-gia/${changes.nam}`);
                    });
                } else {
                    this.props.createTccbDanhGiaNamClone(this.state.item.id, changes, () => {
                        this.hide();
                        this.props?.history.push(`/user/tccb/danh-gia/${changes.nam}`);
                    });
                }
            }
            else {
                this.props.updateTccbDanhGiaNam(this.state.item.id, changes, () => this.hide());
            }
        }
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.item ? (this.state.item.clone ? 'Sao chép đánh giá năm' : 'Cập nhật đánh giá năm') : 'Tạo mới đánh giá năm',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='year' ref={e => this.nam = e} label='Năm' className='col-12' required readOnly={readOnly || (this.state.item && !this.state.item.clone)} />
                <FormDatePicker type='time-mask' ref={e => this.donViBatDauDangKy = e} className='col-12 col-md-6' label='Đơn vị bắt đầu đăng ký' required readOnly={readOnly} />
                <FormDatePicker type='time-mask' ref={e => this.donViKetThucDangKy = e} className='col-12 col-md-6' label='Đơn vị kết thúc đăng ký' required readOnly={readOnly} />
                <FormDatePicker type='time-mask' ref={e => this.nldBatDauDangKy = e} className='col-12 col-md-6' label='Người lao động bắt đầu đăng ký' required readOnly={readOnly} />
                <FormDatePicker type='time-mask' ref={e => this.nldKetThucDangKy = e} className='col-12 col-md-6' label='Người lao động kết thúc đăng ký' required readOnly={readOnly} />
                <FormDatePicker type='time-mask' ref={e => this.donViBatDauPheDuyet = e} className='col-12 col-md-6' label='Đơn vị bắt đầu phê duyệt' required readOnly={readOnly} />
                <FormDatePicker type='time-mask' ref={e => this.donViKetThucPheDuyet = e} className='col-12 col-md-6' label='Đơn vị kết thúc phê duyệt' required readOnly={readOnly} />
                <FormDatePicker type='time-mask' ref={e => this.truongBatDauPheDuyet = e} className='col-12 col-md-6' label='Trường bắt đầu phê duyệt' required readOnly={readOnly} />
                <FormDatePicker type='time-mask' ref={e => this.truongKetThucPheDuyet = e} className='col-12 col-md-6' label='Trường kết thúc phê duyệt' required readOnly={readOnly} />
            </div>
        });
    }
}

class TccbDanhGiaNamPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.clearSearchBox();
            T.showSearchBox();
            this.props.getTccbDanhGiaNamPage(undefined, undefined, { searchTerm: '' });
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa đánh giá năm', 'Bạn có chắc bạn muốn xóa đánh giá năm này?', true, isConfirm =>
            isConfirm && this.props.deleteTccbDanhGiaNam(item.id));
    }

    render() {
        const permission = this.getUserPermission('tccbDanhGiaNam');
        const { list } = this.props.tccbDanhGiaNam && this.props.tccbDanhGiaNam.page ?
            this.props.tccbDanhGiaNam.page : {
                list: []
            };
        let table = renderTable({
            emptyTable: 'Không có dữ liệu đánh giá năm',
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Năm</th>
                    <th style={{ width: '25%', textAlign: 'center', whiteSpace: 'nowrap' }}>Thời hạn đăng ký của đơn vị</th>
                    <th style={{ width: '25%', textAlign: 'center', whiteSpace: 'nowrap' }}>Thời hạn đăng ký của người lao động</th>
                    <th style={{ width: '25%', textAlign: 'center', whiteSpace: 'nowrap' }}>Thời hạn phê duyệt của đơn vị</th>
                    <th style={{ width: '25%', textAlign: 'center', whiteSpace: 'nowrap' }}>Thời hạn phê duyệt của trường</th>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                    <TableCell type='link' url={`/user/tccb/danh-gia/${item.nam}`} style={{ textAlign: 'center' }} content={item.nam} />
                    <TableCell type='link' url={`/user/tccb/danh-gia/${item.nam}/don-vi`} style={{ textAlign: 'center', whiteSpace: 'pre-wrap' }} content={`${T.dateToText(item.donViBatDauDangKy, 'dd/mm/yyyy HH:MM')} -\n ${T.dateToText(item.donViKetThucDangKy, 'dd/mm/yyyy HH:MM')}`} />
                    <TableCell type='link' url={`/user/tccb/danh-gia-ca-nhan/${item.nam}`} style={{ textAlign: 'center', whiteSpace: 'pre-wrap' }} content={`${T.dateToText(item.nldBatDauDangKy, 'dd/mm/yyyy HH:MM')} -\n ${T.dateToText(item.nldKetThucDangKy, 'dd/mm/yyyy HH:MM')}`} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'pre-wrap' }} content={`${T.dateToText(item.donViBatDauPheDuyet, 'dd/mm/yyyy HH:MM')} -\n ${T.dateToText(item.donViKetThucPheDuyet, 'dd/mm/yyyy HH:MM')}`} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'pre-wrap' }} content={`${T.dateToText(item.truongBatDauPheDuyet, 'dd/mm/yyyy HH:MM')} -\n ${T.dateToText(item.truongKetThucPheDuyet, 'dd/mm/yyyy HH:MM')}`} />
                    <TableCell style={{ textAlign: 'center' }} type='buttons' content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} onDelete={this.delete}
                    >
                        <Tooltip title='Sao chép' arrow>
                            <a className='btn btn-info' href='#' onClick={e => e.preventDefault() || permission.write ? this.modal.show({ ...item, nam: '', clone: true }) : T.notify('Vui lòng liên hệ người quản lý!', 'danger')}>
                                <i className='fa fa-lg fa-clone' />
                            </a>
                        </Tooltip>
                        <Tooltip title='Xem thông tin' arrow>
                            <a className='btn btn-success' href='#' onClick={e => e.preventDefault() || permission.write ? this.props.history.push(`/user/tccb/danh-gia/${item.nam}`) : T.notify('Vui lòng liên hệ người quản lý!', 'danger')}>
                                <i className='fa fa-lg fa-info' />
                            </a>
                        </Tooltip>
                        <Tooltip title='Thông tin đăng ký đơn vị' arrow>
                            <a className='btn btn-primary' href='#' onClick={() => this.props.history.push(`/user/tccb/danh-gia/${item.nam}/don-vi`)}>
                                <i className='fa fa-lg fa-users' />
                            </a>
                        </Tooltip>
                        <Tooltip title='Thông tin đăng ký cá nhân' arrow>
                            <a className='btn btn-warning' href='#' onClick={() => this.props.history.push(`/user/tccb/danh-gia-ca-nhan/${item.nam}`)}>
                                <i className='fa fa-lg fa-user' />
                            </a>
                        </Tooltip>
                    </TableCell>
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-university',
            title: 'Đánh giá năm',
            breadcrumb: [
                <Link key={0} to='/user/tccb/'>Tổ chức cán bộ</Link>,
                'Đánh giá năm'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission}
                    createTccbDanhGiaNam={this.props.createTccbDanhGiaNam}
                    updateTccbDanhGiaNam={this.props.updateTccbDanhGiaNam}
                    createTccbDanhGiaNamClone={this.props.createTccbDanhGiaNamClone}
                    history={this.props.history}
                    readOnly={!permission.write} />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write ? () => this.modal.show(null) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tccbDanhGiaNam: state.tccb.tccbDanhGiaNam });
const mapActionsToProps = { getTccbDanhGiaNamPage, deleteTccbDanhGiaNam, createTccbDanhGiaNam, updateTccbDanhGiaNam, createTccbDanhGiaNamClone };
export default connect(mapStateToProps, mapActionsToProps)(TccbDanhGiaNamPage);