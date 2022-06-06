import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getTcHocPhiPage, updateHocPhi } from './redux';

const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => i + new Date().getFullYear() - 10);
};

const termDatas = [{ id: 1, text: 'HK1' }, { id: 2, text: 'HK2' }, { id: 3, text: 'HK3' }];

class EditModal extends AdminModal {
    state = { mssv: '', namHoc: '', hocKy: '', hocPhi: '' };

    componentDidMount() {
    }

    onShow = (item) => {
        const { mssv, hocPhi, namHoc, hocKy, hoTenSinhVien } = item ? item : {
            mssv: '', hocPhi: '', namHoc: '', hocKy: '', hoTenSinhVien: ''
        };

        this.setState({ mssv: mssv, namHoc: namHoc, hocKy: hocKy, hocPhi: hocPhi }, () => {
            this.mssv.value(mssv || '');
            this.hocPhi.value(hocPhi || 0);
            this.namHoc.value(namHoc || 0);
            this.hocKy.value(hocKy || 0);
            this.hoTenSinhVien.value(hoTenSinhVien || 0);
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const { mssv, namHoc, hocKy, hocPhi } = this.state;
        if (!this.hocPhi.value()) {
            T.notify('Học phí trống', 'danger');
            this.hocPhi.focus();
        } else {
            const changes = {
                hocPhi: this.hocPhi.value(),
            };
            if (changes.hocPhi == hocPhi) return;
            this.props.update({ mssv, namHoc, hocKy }, changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Cập nhật dữ liệu học phí',
            size: 'large',
            body: <div className='row'>
                <FormTextBox className='col-md-12' ref={e => this.namHoc = e} type='text' label='Năm học' readOnly={true} />
                <FormTextBox className='col-md-12' ref={e => this.hocKy = e} type='text' label='Học kỳ' readOnly={true} />
                <FormTextBox className='col-md-6' ref={e => this.mssv = e} type='text' label='MSSV' readOnly={true} />
                <FormTextBox className='col-md-6' ref={e => this.hoTenSinhVien = e} type='text' label='Họ và tên' readOnly={true} />
                <FormTextBox className='col-md-12' ref={e => this.hocPhi = e} type='number' label='Học phí (vnđ)' readOnly={readOnly} />
            </div>
        });
    }
}
class TcHocPhiAdminPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/finance/hoc-phi', () => {
            this.props.getTcHocPhiPage(undefined, undefined, '', (data) => {
                const { settings: { namHoc, hocKy } } = data;
                this.year.value(namHoc);
                this.term.value(hocKy);
            });
        });
    }
    render() {
        let permission = this.getUserPermission('tcHocPhi');
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tcHocPhi && this.props.tcHocPhi.page ? this.props.tcHocPhi.page : {
            pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null
        };

        let table = renderTable({
            getDataSource: () => list,
            stickyHead: true,
            header: 'thead-light',
            emptyTable: 'Chưa có dữ liệu học phí học kỳ hiện tại',
            renderHead: () => (<tr>
                <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                <th style={{ width: 'auto', textAlign: 'center' }}>Học kỳ</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap' }}>MSSV</th>
                <th style={{ width: '60%', whiteSpace: 'nowrap' }}>Họ và tên</th>
                <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Học phí (vnđ)</th>
                <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Công nợ (vnđ)</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={`${item.namHoc} - HK${item.hocKy}`} />
                    <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={item.mssv} url={`/user/finance/hoc-phi/${item.mssv}`} />
                    <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={item.hoTenSinhVien} url={`/user/finance/hoc-phi/${item.mssv}`} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={(item.hocPhi?.toString() || '').numberWithCommas()} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={(item.congNo?.toString() || '').numberWithCommas()} />
                    <TableCell type='buttons' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} />
                </tr>
            ),
        });
        return this.renderPage({
            title: 'Học phí',
            icon: 'fa fa-money',
            header: <><FormSelect ref={e => this.year = e} style={{ width: '100px', marginBottom: '0', marginRight: 10 }} placeholder='Năm học' data={yearDatas()} onChange={
                value => this.props.getTcHocPhiPage(undefined, undefined, {
                    searchTerm: '',
                    settings: { namHoc: value && value.id, hocKy: this.term.value() }
                })
            } /><FormSelect ref={e => this.term = e} style={{ width: '100px', marginBottom: '0' }} placeholder='Học kỳ' data={termDatas} onChange={
                value => this.props.getTcHocPhiPage(undefined, undefined, {
                    searchTerm: '',
                    settings: { namHoc: this.year.value(), hocKy: value && value.id }
                })
            } /></>,
            breadcrumb: ['Học phí'],
            content: <div className='tile'>
                {table}
                <Pagination {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getTcHocPhiPage} />
                <EditModal ref={e => this.modal = e} permission={permission} update={this.props.updateHocPhi} />
            </div>,
            onImport: permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/finance/import-hoc-phi') : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcHocPhi: state.finance.tcHocPhi });
const mapActionsToProps = {
    getTcHocPhiPage, updateHocPhi
};
export default connect(mapStateToProps, mapActionsToProps)(TcHocPhiAdminPage);