import React from 'react';
import { connect } from 'react-redux';
import { getTcLoaiPhiPage, createTcLoaiPhi, updateTcLoaiPhi, deleteTcLoaiPhi, apply } from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox, FormSelect } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';

const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => i + new Date().getFullYear() - 13);
};

const termDatas = [{ id: 1, text: 'HK1' }, { id: 2, text: 'HK2' }, { id: 3, text: 'HK3' }];

class ApplyModal extends AdminModal {
    onShow = (data) => {
        this.setState({ loaiPhi: data.id, isLoading: false });
        this.tenLoaiPhi.value(data.ten);
        this.soTien.value('');
        this.thanhChu.value('');
    }

    onAmountChange = () => {
        const value = `${this.soTien?.value() || ''}`;
        if (value) {
            this.thanhChu?.value(T.numberToVnText(value) + ' đồng');
        } else {
            this.thanhChu?.value('');
        }
    }

    onSubmit = () => {
        const data = { loaiPhi: this.state.loaiPhi };
        try {
            ['namHoc', 'hocKy', 'namTuyenSinh', 'bacDaoTao', 'loaiDaoTao', 'soTien'].forEach(key => {
                data[key] = this[key].value();
                if (data[key] == null) {
                    T.notify(`${this[key].props.label} trống`, 'danger');
                    throw new Error();
                }
            });
        } catch { return; }
        this.setState({ isLoading: true }, () => {
            this.props.submit(data, () => this.hide(), () => this.setState({ isLoading: false }));
        });
    }

    render = () => {
        return this.renderModal({
            title: 'Áp dụng loại phí',
            size: 'elarge',
            isLoading: this.state.isLoading,
            body: <div className='row'>
                <FormTextBox ref={e => this.tenLoaiPhi = e} label='Loại phí' readOnly className='col-md-12' required />
                <FormTextBox type='number' ref={e => this.soTien = e} label='Số tiền' className='col-md-12' required onChange={this.onAmountChange} />
                <FormTextBox ref={e => this.thanhChu = e} label='Số tiền (thành chữ)' disabled className='col-md-12' required />
                <FormSelect ref={e => this.namHoc = e} data={yearDatas().reverse()} label='Năm học' className='col-md-6' required />
                <FormSelect ref={e => this.hocKy = e} data={termDatas} label='Học kỳ' className='col-md-6' required />
                {/* TODO: get nam tuyen sinh from fwStudents table */}
                <FormSelect ref={e => this.namTuyenSinh = e} data={yearDatas().reverse()} label='Năm tuyển sinh' className='col-md-4' required />
                <FormSelect ref={e => this.bacDaoTao = e} data={SelectAdapter_DmSvBacDaoTao} label='Bậc đào tạo' className='col-md-4' required />
                <FormSelect ref={e => this.loaiDaoTao = e} data={SelectAdapter_DmSvLoaiHinhDaoTao} label='Hệ đào tạo' className='col-md-4' required />
            </div>
        });
    }
}

class EditModal extends AdminModal {

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { id, ten, kichHoat } = item ? item : { id: '', ten: '', kichHoat: 1 };

        this.setState({ id, item });
        this.ten.value(ten);
        this.kichHoat.value(kichHoat ? 1 : 0);


    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ten: this.ten.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0,
        };
        if (changes.ten == '') {
            T.notify('Tên không được trống!', 'danger');
            this.ten.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) :
                this.props.create(changes, this.hide);
        }
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật loại phí' : 'Tạo mới loại phí',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên loại phí' placeholder='Tên loại phí' readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        }
        );
    }
}

class tcLoaiPhiAdminPage extends AdminPage {
    state = { searching: false };

    componentDidMount() {
        T.ready('/user/finance/loai-phi', () => {
            T.onSearch = (searchText) => this.props.getTcLoaiPhiPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getTcLoaiPhiPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa loại phí', `Bạn có chắc bạn muốn xóa loại phí ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteTcLoaiPhi(item.id, error => {
                if (error) T.notify(error.message ? error.message : `Xoá loại phí ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá loại phí ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }


    render() {
        const permission = this.getUserPermission('tcLoaiPhi', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tcLoaiPhi && this.props.tcLoaiPhi.page ?
            this.props.tcLoaiPhi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = renderTable({
            emptyTable: 'Không có dữ liệu loại phí',
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>Mã</th>
                    <th style={{ width: '100%' }}>Tên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell type='link' content={item.ten ? item.ten : ''} onClick={() => this.modal.show(item)} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                        onChanged={value => this.props.updateTcLoaiPhi(item.id, { kichHoat: value ? 1 : 0, })} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} onDelete={this.delete}>
                        <Tooltip title='Áp dụng loại phí' arrow>
                            <button className='btn btn-success' onClick={e => e.preventDefault() || this.applyModal.show(item)}><i className='fa fa-lg fa-plus' /></button>
                        </Tooltip>
                    </TableCell>
                </tr>
            )

        });


        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Loại phí',
            breadcrumb: [
                'Loại phí'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getTcLoaiPhiPage} />
                <EditModal ref={e => this.modal = e}
                    create={this.props.createTcLoaiPhi} update={this.props.updateTcLoaiPhi} readOnly={!permission.write} />
                <ApplyModal ref={e => this.applyModal = e} submit={this.props.apply} />
            </>,
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcLoaiPhi: state.finance.tcLoaiPhi });
const mapActionsToProps = { getTcLoaiPhiPage, createTcLoaiPhi, updateTcLoaiPhi, deleteTcLoaiPhi, apply };
export default connect(mapStateToProps, mapActionsToProps)(tcLoaiPhiAdminPage);