import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';

class EditModal extends AdminModal {
    state = { id: '' };

    componentDidMount() {
    }

    onShow = (item) => {
        const { mssv, hocPhi, congNo } = item ? item.item : {
            mssv: '', hocPhi: '', congNo: ''
        };
        const index = item.index;

        this.setState({ index });

        setTimeout(() => {
            this.mssv.value(mssv || '');
            this.hocPhi.value(hocPhi || 0);
            this.congNo.value(congNo || 0);
        }, 100);
    };

    onSubmit = (e) => {
        e.preventDefault();
        let ma = '-1';
        if (this.loaiDoiTuong.value() == '02') ma = this.maCanBo.value();
        if (this.loaiDoiTuong.value() == '03') ma = this.maDonVi.value();
        if (this.loaiDoiTuong.value() == '04') ma = this.maBoMon.value();

        const changes = {
            tenThanhTich: this.thanhTich.data().text,
            tenChuThich: this.chuThich.data().text,
            loaiDoiTuong: this.loaiDoiTuong.value(),
            ma: ma,
            namDatDuoc: this.namDatDuoc.value(),
            thanhTich: this.thanhTich.value(),
            chuThich: this.chuThich.value(),
            diemThiDua: this.diemThiDua.value(),
            soQuyetDinh: this.soQuyetDinh.value(),
        };
        if (!this.loaiDoiTuong.value()) {
            T.notify('Loại đối tượng trống', 'danger');
            this.loaiDoiTuong.focus();
        } else if (!ma) {
            T.notify('Danh sách mã số trống', 'danger');
            if (this.loaiDoiTuong.value() == '02') this.maCanBo.focus();
            if (this.loaiDoiTuong.value() == '03') this.maDonVi.focus();
            if (this.loaiDoiTuong.value() == '04') this.maBoMon.focus();
        } else if (!this.thanhTich.value()) {
            T.notify('Thành tích trống', 'danger');
            this.thanhTich.focus();
        } else this.props.update(this.state.index, changes, this.hide);
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Cập nhật quá trình khen thưởng',
            size: 'large',
            body: <div className='row'>
                <FormTextBox className='col-md-4' ref={e => this.mssv = e} type='text' label='MSSV' readOnly={readOnly} />
                <FormTextBox className='col-md-4' ref={e => this.hocPhi = e} type='number' label='Học phí (vnđ)' readOnly={readOnly} />
                <FormTextBox className='col-md-4' ref={e => this.congNo = e} type='number' label='Công nợ (vnđ)' readOnly={readOnly} />
            </div>
        });
    }
}
class TcHocPhiImportPage extends AdminPage {

    state = { hocPhiAll: [], message: '', displayState: 'import', isDisplay: true, term: {} };

    componentDidMount() {
        T.ready('/user/finance');
    }

    onSuccess = (response) => {
        if (response.error) T.notify(response.error, 'danger');
        else if (response.items) {
            this.setState({
                hocPhiAll: response.items,
                term: response.term,
                message: `${response.items.length} hàng được tải lên thành công`,
                isDisplay: false,
                displayState: 'data'
            }, () => T.notify(this.state.message, 'success'));
        }
    };

    showEdit = (e, index, item) => {
        e.preventDefault();
        this.modal.show({ index, item });
    };

    update = (index, changes, done) => {
        const { hocPhiAll } = this.state;
        const currentValue = hocPhiAll[index];
        const updateValue = Object.assign({}, currentValue, changes);
        hocPhiAll.splice(index, 1, updateValue);
        this.setState({ hocPhiAll }
            , () => T.notify('Cập nhật dữ liệu thành công', 'success'));
        done && done();
    };

    delete = (e, index) => {
        e.preventDefault();
        T.confirm('Xóa dữ liệu', 'Bạn có muốn xóa dữ liệu học phí này không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                const hocPhiAll = this.state.hocPhiAll;
                hocPhiAll.splice(index, 1);
                this.setState({ hocPhiAll },
                    () => T.notify('Xóa dữ liệu thành công', 'success'));
            }
        });
    };

    save = (e) => {
        const doSave = () => {
            // const data = this.state.hocPhiAll;
            // this.props.createMultiQtKhenThuongAll(data, (error, data) => {
            //     if (error) T.notify('Cập nhật dữ liệu bị lỗi!', 'danger');
            //     else {
            //         this.setState({ displayState: 'import', qtKhenThuongAll: [] });
            //         T.notify(`Cập nhật ${data && data.items ? data.items.length + ' ' : ''} khen thưởng thành công!`, 'success');
            //         this.props.history.push('/user/tccb/qua-trinh/khen-thuong-all');
            //     }
            // });
        };
        e.preventDefault();
        T.confirm('Cập nhật dữ liệu', 'Bạn có muốn thêm những dữ liệu này không?', 'warning', true, isConfirm => {
            isConfirm && doSave();
        });
    };

    render() {
        const { hocPhiAll, displayState, term } = this.state,
            permission = this.getUserPermission('tcHocPhi', ['read', 'write', 'delete']);
        let table = 'Không có dữ liệu!';
        if (hocPhiAll && hocPhiAll.length > 0) {
            table = renderTable({
                getDataSource: () => hocPhiAll, stickyHead: true,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Học kỳ</th>
                        <th style={{ width: '20%', whiteSpace: 'nowrap' }}>MSSV</th>
                        <th style={{ width: '60%', whiteSpace: 'nowrap' }}>Họ và tên</th>
                        <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Học phí (vnđ)</th>
                        <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Công nợ (vnđ)</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={`${term.namHoc} - HK${term.hocKy}`} />
                        <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={item.mssv} url={`/user/finance/hoc-phi/${item.mssv}`} />
                        <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={item?.hoTenSinhVien} url={`/user/finance/hoc-phi/${item.mssv}`} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={(item?.hocPhi?.toString() || '').numberWithCommas()} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={(item?.congNo?.toString() || '').numberWithCommas()} />
                        <TableCell type='buttons' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show({ index, item })} onDelete={(e) => this.delete(e, index)}
                        /> {/*TODO: AdminEditPage */}
                    </tr>)
            });
        }
        return this.renderPage({
            icon: 'fa fa-money',
            title: 'Import dữ liệu học phí',
            header: <><FormSelect ref={e => this.year = e} style={{ width: '100px', marginBottom: '0', marginRight: 10 }} placeholder='Năm học' data={[{ id: 2022, text: '2022' }]} onChange={
                value => console.log(value)
            } /><FormSelect ref={e => this.term = e} style={{ width: '100px', marginBottom: '0' }} placeholder='Học kỳ' data={[{ id: 1, text: 'HK1' }, { id: 2, text: 'HK2' }, { id: 3, text: 'HK3' },]} onChange={
                value => console.log(value)
            } /></>,
            breadcrumb: [<Link key={0} to='/user/finance/hoc-phi'>Học phí</Link>, 'Import'],
            content: <>
                <div className='tile rows' style={{ textAlign: 'right', display: displayState == 'import' ? 'block' : 'none' }}>
                    <FileBox postUrl='/user/upload' uploadType='TcHocPhiData' userData={'TcHocPhiData'}
                        accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                        style={{ width: '80%', margin: '0 auto' }}
                        ajax={true} success={this.onSuccess} />
                    <button className='btn btn-warning' type='button' onClick={e => e.preventDefault() || T.download('/api/finance/hoc-phi/download-template')}>
                        <i className='fa fa-fw fa-lg fa-arrow-circle-down' />Tải file mẫu tại đây
                    </button>
                </div>
                <div className='tile' style={{ display: displayState == 'import' ? 'none' : 'block' }}>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission} readOnly={!permission.write} update={this.update} />
            </>,
            onSave: displayState == 'data' ? (e) => this.save(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {

};
export default connect(mapStateToProps, mapActionsToProps)(TcHocPhiImportPage);