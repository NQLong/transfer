import { Tooltip } from '@mui/material';
import { SelectAdapter_TcLoaiPhi } from 'modules/mdKeHoachTaiChinh/tcLoaiPhi/redux';
import React from 'react';
import { AdminModal, FormSelect, FormTextBox, getValue, renderTable, TableCell } from 'view/component/AdminPage';

export default class Detail extends AdminModal {
    onShow = (item) => {
        let { mssv, namHoc, hocKy } = item;
        this.props.getHocPhi(mssv, result => {
            this.setState({ hocPhiDetail: result.hocPhiDetail || [], mssv, hocKy, namHoc });
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        const { isChanged, hocPhiDetail } = this.state;
        if (!isChanged) {
            T.notify('Không có sự thay đổi nào', 'danger');
        } else {
            this.props.create(hocPhiDetail, () => {
                T.notify('Cập nhật học phí hiện tại thành công', 'success');
                this.hide();
            });
        }
    }

    onAdd = (e) => {
        e.preventDefault();
        let { mssv, namHoc, hocKy, hocPhiDetail } = this.state;
        try {
            const data = {
                mssv, namHoc, hocKy,
                loaiPhi: getValue(this.loaiPhi),
                soTien: getValue(this.soTien),
                tenLoaiPhi: this.loaiPhi.data().text,
                ngayTao: Date.now()
            };
            if (hocPhiDetail.some(item => item.loaiPhi == data.loaiPhi)) {
                T.confirm('Đã tồn tại loại phí này', 'Bạn có muốn ghi đè số tiền hiện tại không?', 'warning', true, isConfirm => {
                    if (isConfirm) {
                        T.notify('Ghi đè thành công!', 'success');
                        hocPhiDetail.forEach(item => {
                            if (item.loaiPhi == data.loaiPhi) item.soTien = parseInt(data.soTien);
                            item.ngayTao = data.ngayTao;
                        });
                        this.setState({ hocPhiDetail, isChanged: true });
                        this.loaiPhi.clear();
                        this.soTien.value('');
                    }
                });
            }
            else {
                this.setState({ hocPhiDetail: [...this.state.hocPhiDetail, data], isChanged: true });
                this.loaiPhi.clear();
                this.soTien.value('');
            }
        } catch (input) {
            T.notify(`${input?.props?.label || 'Dữ liệu'} bị trống`, 'danger');
            input.focus();
        }
    }

    render = () => {
        const style = (width = 'auto', textAlign = 'left') => ({ width, textAlign, whiteSpace: 'nowrap', backgroundColor: '#1b489f', color: '#fff' }),
            hocPhiDetail = this.state.hocPhiDetail;
        let table = renderTable({
            emptyTable: 'Không có dữ liệu học phí',
            header: 'thead-light',
            getDataSource: () => hocPhiDetail,
            renderHead: () => (
                <tr>
                    <th style={style()}>STT</th>
                    <th style={style('100%')}>Loại phí</th>
                    <th style={style('auto', 'right')}>Số tiền</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenLoaiPhi} />
                    <TableCell type='number' style={{ whiteSpace: 'nowrap' }} content={item.soTien || ''} />
                </tr>
            )
        });
        return this.renderModal({
            title: 'Chi tiết học phí học kỳ hiện tại',
            body: <div className='row'>
                <div className='form-group col-md-12' style={{ marginBottom: '30px' }}>{table}</div>
                <FormSelect className='col-md-6' data={SelectAdapter_TcLoaiPhi} ref={e => this.loaiPhi = e} label='Loại phí' required onChange={() => this.soTien.focus()} />
                <FormTextBox className='col-md-4' type='number' ref={e => this.soTien = e} label='Số tiền' required />
                <div className='form-group col-md-2 d-flex align-items-end justify-content-end' >
                    <Tooltip title='Thêm' arrow>
                        <button className='btn btn-success' onClick={e => this.onAdd(e)}>
                            <i className='fa fa-lg fa-plus' />
                        </button>
                    </Tooltip>
                </div>
            </div>
        });
    }
}