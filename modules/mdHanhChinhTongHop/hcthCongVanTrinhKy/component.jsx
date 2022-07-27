import React from 'react';
import { AdminModal, FormTextBox, FormSelect, FormDatePicker, renderTable, TableCell } from 'view/component/AdminPage';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';

export class YeuCauKyModal extends AdminModal {

    onShow = (item) => {
        const { id, ten, nguoiTao, thoiGian, danhSachShccCanBoKy } = item;
        this.ten?.value(ten || '');
        this.nguoiTao?.value(nguoiTao || '');
        this.thoiGian?.value(thoiGian ? new Date(thoiGian) : '');
        const canBoKy = danhSachShccCanBoKy?.split(',') || '';
        this.canBoKy?.value(canBoKy);
        this.setState({ id, ten, canBoKy });
    }


    onSubmit = () => {
        const data = {
            tenFile: this.ten.value(),
            congVan: this.props.congVanId,
            fileCongVan: this.state.id,
            canBoKy: this.canBoKy.value() || []
        };

        if (!data.canBoKy || !data.canBoKy.length) {
            T.notify('Chưa có cán bộ ký văn bản được chọn!', 'danger');
            this.canBoKy.focus();
        } else {
            if (this.state.canBoKy) {
                this.props.update(this.state.id, data, () => {
                    this.props.getYeuCauKy(this.props.congVanId, () => this.props.onSubmitCallback());
                    this.hide();
                });
            } else {
                this.props.create(data, () => {
                    // this.props.onSubmitCallback && this.props.onSubmitCallback();
                    this.props.getYeuCauKy(this.props.congVanId, () => this.props.onSubmitCallback());
                    this.hide();
                });
            }

        }
    }

    render = () => {
        return this.renderModal({
            title: this.state.canBoKy !== '' ? 'Chỉn sửa yêu cầu trình ký' : 'Tạo yêu cầu trình ký',
            size: 'elarge',
            body: <div className='row'>
                <FormTextBox className='col-md-12' label='Tên văn bản' ref={e => this.ten = e} readOnly={true} />
                <FormSelect className='col-md-6' label='Người tải' data={SelectAdapter_FwCanBo} ref={e => this.nguoiTao = e} readOnly={true} />
                <FormDatePicker type='date' className='col-md-6' label='Ngày tải lên' ref={e => this.thoiGian = e} readOnly={true} />
                <FormSelect className='col-md-12' label='Cán bộ ký' data={SelectAdapter_FwCanBo} multiple={true} ref={e => this.canBoKy = e} />
            </div>
        });
    }
}


export class YeuCauKy extends React.Component {
    deleteFile = (e, item) => {
        e.preventDefault();
        const { id: fileId, congVanId } = item;
        T.confirm('Yêu cầu ký', 'Bạn có chắc muốn xóa yêu cầu ký này, yêu cầu ý sau khi xóa sẽ không thể khôi phục lại được', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteCongVanTrinhKy(fileId, congVanId, () => {
                this.props.getYeuCauKy(congVanId, () => this.props.onSubmitCallback());
            })
        );
    }

    editFile = (e, item) => {
        e.preventDefault();
        this.yeuCauKyModal.show(item);
    }

    render() {
        const table = renderTable({
            getDataSource: () => this.props.hcthCongVanDi?.item?.yeuCauKy,
            emptyTable: 'Chưa có văn bản trình ký',
            renderHead: () => {
                return <tr>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ width: '80%', whiteSpace: 'nowrap' }}>Tên văn bản</th>
                    <th style={{ width: '15%', textAlign: 'center', whiteSpace: 'nowrap' }}>Cán bộ kí</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thời gian tạo</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Trạng thái</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>;
            },
            renderRow: (item, index) => {
                const danhSachCanBoKy = item.danhSachTenCanBoKy.split(',');
                return <tr key={item.id}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell type='text' style={{ wordBreak: 'break-all' }} content={item.ten} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                        <>
                            <span>{danhSachCanBoKy && danhSachCanBoKy.length > 0 ? danhSachCanBoKy.map((canBo, index) => (
                                <span key={index}>
                                    <b style={{ color: 'blue' }}>{canBo.normalizedName()}</b>
                                    <br />
                                </span>
                            )) : null}
                            </span>
                        </>
                    } />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={T.dateToText(item.thoiGian, 'dd/mm/yyyy HH:MM')} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                        item.listCanBoKy.every(canBoKy => canBoKy.trangThai && canBoKy.trangThai === 'DA_KY') ?
                            <span style={{ color: '#28a745', fontWeight: 'bold' }}>Đã ký</span> : <span style={{ color: '#007bff', fontWeight: 'bold' }}>Chờ ký</span>
                    } />

                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={this.props.permission} onEdit={e => this.props.onEditVanBanTrinhKy(e, item)} onDelete={e => this.deleteFile(e, { ...item, congVanId: this.props.id })}>
                    </TableCell>
                </tr>;
            },
        });
        return <div className='tile'>
            <h3 className='tile-header'>Văn bản trình ký</h3>
            <div className='tile-body'>
                {table}
            </div>
        </div>;
    }
}

