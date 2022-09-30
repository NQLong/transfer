import React from 'react';
import { connect } from 'react-redux';
import { getTccbDanhGiaPDTPage, updateTccbDanhGiaPDT, updateTccbDanhGiaPDTTruongTccb, tccbDanhGiaPDTPheDuyetAll } from './redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, FormTextBox, AdminModal, getValue, FormRichTextBox, FormSelect } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';
import T from 'view/js/common';
import { SelectAdapter_NhomDanhGiaNhiemVu } from '../tccbDanhGiaNhomDanhGiaNhiemVu/redux';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown());
    }

    onShow = (item) => {
        let { ho, ten, shcc, tenNhom, approvedTruong, approvedDonVi, yKienTruongTccb } = item ? item : { ho: '', ten: '', shcc: '', tenNhom: '', approvedTruong: null, approvedDonVi: null, yKienTruongTccb: '' };
        this.setState({ item });
        this.approvedTruong.value(approvedTruong);
        this.hoTen.value(`${ho} ${ten} (${shcc})`);
        this.tenNhom.value(tenNhom);
        this.approvedDonVi.value(approvedDonVi || 'Chưa phê duyệt');
        this.yKienTruongTccb.value(yKienTruongTccb || 'Chưa có ý kiến');
    };

    onSubmit = (e) => {
        e.preventDefault();
        if (this.props.isPresident) {
            this.props.updatePresident(this.state.item.id, getValue(this.approvedTruong), this.hide);
        } else {
            if (this.state?.item?.approvedTruong == 'Đồng ý') {
                T.notify('Trường đã duyệt, không thể sửa đổi dữ liệu', 'danger');
            } else {
                this.props.updateTruongTccb(this.state.item.id, getValue(this.yKienTruongTccb), this.hide);
            }
        }
    };

    render = () => {
        const isPresident = this.props.isPresident;
        return this.renderModal({
            title: 'Ý kiến khác',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12 col-md-6' ref={e => this.hoTen = e} label='Cán bộ'
                    readOnly={true} />
                <FormTextBox type='text' className='col-12 col-md-6' ref={e => this.tenNhom = e} label='Cá nhân đăng ký'
                    readOnly={true} />
                <FormTextBox type='text' className='col-12 col-md-6' ref={e => this.approvedDonVi = e} label='Đơn vị phê duyệt'
                    readOnly={true} />
                <FormRichTextBox type='text' className='col-md-12' ref={e => this.yKienTruongTccb = e} label='Ý kiến của Trưởng TCCB'
                    readOnly={isPresident || this.state?.item?.approvedTruong == 'Đồng ý'} />
                <FormRichTextBox type='text' className='col-md-12' ref={e => this.approvedTruong = e} label='Ý kiến của trường'
                    readOnly={!isPresident} />
            </div>
        });
    }
}

class TccbDanhGiaPheDuyetTruongDetails extends AdminPage {
    state = { nam: '', nhomDanhGiaNhiemVu: 'Tất cả', yKienTruongTccb: 'Tất cả' }

    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/danh-gia-phe-duyet-truong/:nam');
            const nam = parseInt(route.parse(window.location.pathname)?.nam);
            this.setState({ nam });
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.getPage();
            this.nhomDanhGiaNhiemVu.value(-1);
            this.yKienTruongTccb.value('Tất cả');
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        const filter = {
            filterNhom: this.state.nhomDanhGiaNhiemVu,
            filterYKien: this.state.yKienTruongTccb,
        };
        this.props.getTccbDanhGiaPDTPage(pageN, pageS, pageC, filter, done);
    }

    showStatus = (status, alternativeText) => {
        if (status == 'Đồng ý') {
            return <span style={{ color: 'green' }}>{status}</span>;
        }
        if (status == 'Không đồng ý') {
            return <span style={{ color: 'red' }}>{status}</span>;
        }
        return <span>{status || alternativeText}</span>;
    }

    approvedTruongAction = (e, item, status) => {
        e.preventDefault();
        T.confirm(`${status} phê duyệt`, `Bạn có chắc bạn muốn ${status} mục này`, true, isConfirm =>
            isConfirm && this.props.updateTccbDanhGiaPDT(item.id, status));
    }

    approvedTruongAllAction = (e, approvedTruong) => {
        e.preventDefault();
        T.confirm(`${approvedTruong} phê duyệt toàn bộ`, `Bạn có chắc bạn muốn ${approvedTruong} toàn bộ`, true, isConfirm =>
            isConfirm && this.props.tccbDanhGiaPDTPheDuyetAll(approvedTruong));
    }

    render() {
        const isPresident = this.getCurrentPermissions().includes('president:login');
        const { nam } = this.state;
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tccbDanhGiaPheDuyetTruong && this.props.tccbDanhGiaPheDuyetTruong.page ?
            this.props.tccbDanhGiaPheDuyetTruong.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        let table = 'Không có dữ liệu phê duyệt!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                        <th style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: '15%', textAlign: 'center', whiteSpace: 'nowrap' }}>Đơn vị</th>
                        <th style={{ width: '15%', textAlign: 'center', whiteSpace: 'nowrap' }}>Cá nhân đăng ký</th>
                        <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Đơn vị phê duyệt</th>
                        <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Ý kiến trưởng TCCB</th>
                        <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Trường phê duyệt</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'center' }} content={index + 1} />
                        <TableCell type='text' content={<>
                            <span>{`${item.ho} ${item.ten}`}<br /></span>
                            {item.shcc}
                        </>} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='text' style={{ textAlign: 'left' }} content={item.tenDonVi} />
                        <TableCell type='text' style={{ textAlign: 'left' }} content={item.tenNhom || 'Chưa đăng ký'} />
                        <TableCell type='text' style={{ textAlign: 'left' }} content={this.showStatus(item.approvedDonVi, 'Chưa phê duyệt')} />
                        <TableCell type='text' style={{ textAlign: 'left', whiteSpace: 'pre-wrap' }} content={this.showStatus(item.yKienTruongTccb, 'Chưa có ý kiến')} />
                        <TableCell type='text' style={{ textAlign: 'left', whiteSpace: 'pre-wrap' }} content={this.showStatus(item.approvedTruong, 'Chưa phê duyệt')} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }}>
                            {
                                item.tenNhom && (
                                    !isPresident ? (item.approvedTruong != 'Đồng ý' && <>
                                        <Tooltip title='Thêm ý kiến' arrow>
                                            <button className='btn btn-info' onClick={() => item.id ? this.modal.show(item) : T.notify('Cá nhân chưa đăng ký!', 'danger')}>
                                                <i className='fa fa-lg fa-edit' />
                                            </button>
                                        </Tooltip>
                                    </>) :
                                        <><Tooltip title='Đồng ý' arrow>
                                            <button className='btn btn-success' onClick={e => item.id ? this.approvedTruongAction(e, item, 'Đồng ý') : T.notify('Cá nhân chưa đăng ký!', 'danger')}>
                                                <i className='fa fa-lg fa-check' />
                                            </button>
                                        </Tooltip>
                                            <Tooltip title='Không đồng ý' arrow>
                                                <button className='btn btn-danger' onClick={e => item.id ? this.approvedTruongAction(e, item, 'Không đồng ý') : T.notify('Cá nhân chưa đăng ký!', 'danger')}>
                                                    <i className='fa fa-lg fa-times' />
                                                </button>
                                            </Tooltip>
                                            <Tooltip title='Ý kiến khác' arrow>
                                                <button className='btn btn-info' onClick={() => item.id ? this.modal.show(item) : T.notify('Cá nhân chưa đăng ký!', 'danger')}>
                                                    <i className='fa fa-lg fa-edit' />
                                                </button>
                                            </Tooltip></>
                                )
                            }
                        </TableCell>
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: `Thông tin đăng ký năm ${nam}`,
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                <Link key={1} to='/user/tccb/danh-gia-phe-duyet-truong'>Trường phê duyệt</Link>,
                `Thông tin phê duyệt năm ${nam}`
            ],
            content: <>
                <div className='tile'>
                    <div className='d-flex flex-row'>
                        <FormSelect style={{ width: '300px' }} className='p-2' placeholder='Cá nhân đăng ký' ref={e => this.nhomDanhGiaNhiemVu = e} data={SelectAdapter_NhomDanhGiaNhiemVu(nam)} onChange={value => this.setState({ nhomDanhGiaNhiemVu: value.text }, this.getPage)} />
                        <FormSelect style={{ width: '300px' }} className='p-2' placeholder='Ý kiến trưởng TCCB' ref={e => this.yKienTruongTccb = e} data={['Tất cả', 'Có ý kiến', 'Chưa có ý kiến']} onChange={value => this.setState({ yKienTruongTccb: value.text }, this.getPage)} />
                    </div>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e}
                    updatePresident={this.props.updateTccbDanhGiaPDT}
                    updateTruongTccb={this.props.updateTccbDanhGiaPDTTruongTccb}
                    isPresident={isPresident}
                />
            </>,
            backRoute: '/user/tccb/danh-gia-phe-duyet-truong',
            buttons: [
                isPresident ? { className: 'btn btn-danger', icon: 'fa-times', tooltip: 'Không đồng ý toàn bộ', onClick: e => this.approvedTruongAllAction(e, 'Không đồng ý') } : null,
                isPresident ? { className: 'btn btn-success', icon: 'fa-check', tooltip: 'Đồng ý toàn bộ', onClick: e => this.approvedTruongAllAction(e, 'Đồng ý') } : null
            ]

        });
    }
}

const mapStateToProps = state => ({ system: state.system, tccbDanhGiaPheDuyetTruong: state.tccb.tccbDanhGiaPheDuyetTruong });
const mapActionsToProps = { getTccbDanhGiaPDTPage, updateTccbDanhGiaPDT, updateTccbDanhGiaPDTTruongTccb, tccbDanhGiaPDTPheDuyetAll };
export default connect(mapStateToProps, mapActionsToProps)(TccbDanhGiaPheDuyetTruongDetails);