import React from 'react';
import { connect } from 'react-redux';
import { getTccbDanhGiaPDTPage, updateTccbDanhGiaPDT } from './redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, FormTextBox, AdminModal, getValue } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';
import T from 'view/js/common';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() =>
            this.approvedTruong.focus()
        ));
    }

    onShow = (item) => {
        let { ho, ten, shcc, tenDonVi, tenNhom, approvedTruong, approvedDonVi } = item ? item : { ho: '', ten: '', shcc: '', tenDonVi: '', tenNhom: '', approvedTruong: null, approvedDonVi: null };
        this.setState({ item });
        if (approvedTruong != 'Đồng ý' && approvedTruong != 'Không đồng ý') {
            this.approvedTruong.value(approvedTruong);
        }
        this.hoTen.value(`${ho} ${ten} (${shcc})`);
        this.tenDonVi.value(tenDonVi);
        this.tenNhom.value(tenNhom);
        this.approvedDonVi.value(approvedDonVi || 'Chưa phê duyệt');
    };

    onSubmit = (e) => {
        e.preventDefault();
        this.props.update(this.state.item.id, getValue(this.approvedTruong), this.hide);
    };

    render = () => {
        return this.renderModal({
            title: 'Ý kiến khác',
            size: 'medium',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.hoTen = e} label='Cán bộ'
                    readOnly={true} />
                <FormTextBox type='text' className='col-md-12' ref={e => this.tenDonVi = e} label='Đơn vị'
                    readOnly={true} />
                <FormTextBox type='text' className='col-md-12' ref={e => this.tenNhom = e} label='Nhóm đăng ký'
                    readOnly={true} />
                <FormTextBox type='text' className='col-md-12' ref={e => this.approvedDonVi = e} label='Đơn vị phê duyệt'
                    readOnly={true} />
                <FormTextBox type='text' className='col-md-12' ref={e => this.approvedTruong = e} label='Ý kiến của trường'
                    readOnly={false} required />
            </div>
        });
    }
}

class TccbDanhGiaPheDuyetTruongDetails extends AdminPage {
    state = { nam: '' }

    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/danh-gia/phe-duyet-truong/:nam');
            const nam = parseInt(route.parse(window.location.pathname)?.nam);
            this.setState({ nam });
            T.onSearch = (searchText) => this.props.getTccbDanhGiaPDTPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getTccbDanhGiaPDTPage();
        });
    }

    render() {
        const nam = this.state.nam || '';
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tccbDanhGiaPheDuyetTruong && this.props.tccbDanhGiaPheDuyetTruong.page ?
            this.props.tccbDanhGiaPheDuyetTruong.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        let table = 'Không có dữ liệu phê duyệt!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>#</th>
                        <th style={{ width: '10%', textAlign: 'center' }}>Cán bộ</th>
                        <th style={{ width: '25%', textAlign: 'center' }}>Đơn vị</th>
                        <th style={{ width: '15%', textAlign: 'center' }}>Nhóm đăng ký</th>
                        <th style={{ width: '25%', textAlign: 'center' }}>Đơn vị phê duyệt</th>
                        <th style={{ width: '25%', textAlign: 'center' }}>Trường phê duyệt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
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
                        <TableCell type='text' style={{ textAlign: 'left' }} content={item.approvedDonVi || 'Chưa phê duyệt'} />
                        <TableCell type='text' style={{ textAlign: 'left' }} content={item.approvedTruong || 'Chưa phê duyệt'} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }}>
                            <Tooltip title='Đồng ý' arrow>
                                <button className='btn btn-success' onClick={() => item.id ? this.props.updateTccbDanhGiaPDT(item.id, 'Đồng ý') : T.notify('Cá nhân chưa đăng ký!', 'danger')}>
                                    <i className='fa fa-lg fa-check' />
                                </button>
                            </Tooltip>
                            <Tooltip title='Không đồng ý' arrow>
                                <button className='btn btn-danger' onClick={() => item.id ? this.props.updateTccbDanhGiaPDT(item.id, 'Không đồng ý') : T.notify('Cá nhân chưa đăng ký!', 'danger')}>
                                    <i className='fa fa-lg fa-times' />
                                </button>
                            </Tooltip>
                            <Tooltip title='Ý kiến khác' arrow>
                                <button className='btn btn-info' onClick={() => item.id ? this.modal.show(item) : T.notify('Cá nhân chưa đăng ký!', 'danger')}>
                                    <i className='fa fa-lg fa-edit' />
                                </button>
                            </Tooltip>
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
                <Link key={1} to='/user/tccb/danh-gia-phe-duyet-truong'>Phê duyệt trường</Link>,
                `Thông tin phê duyệt năm ${nam}`
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getTccbDanhGiaPDTPage} />
                <EditModal ref={e => this.modal = e}
                    update={this.props.updateTccbDanhGiaPDT}
                />
            </>,
            backRoute: '/user/tccb/danh-gia-phe-duyet-don-vi',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tccbDanhGiaPheDuyetTruong: state.tccb.tccbDanhGiaPheDuyetTruong });
const mapActionsToProps = { getTccbDanhGiaPDTPage, updateTccbDanhGiaPDT };
export default connect(mapStateToProps, mapActionsToProps)(TccbDanhGiaPheDuyetTruongDetails);