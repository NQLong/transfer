
import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { getDanhSachMonChuongTrinhDaoTao } from '../dtChuongTrinhDaoTao/redux';

class MonHocCtdtModal extends AdminModal {

    onShow = (item) => {
        let { khoaSV, maNganh } = item;
        this.props.getDanhSachMonChuongTrinhDaoTao(khoaSV, maNganh, value => {
            this.setState({ ...value, khoaSV, maNganh });
        });
    }

    renderMonHocChung = (list) => renderTable({
        getDataSource: () => list,
        emptyTable: 'Không có môn học',
        header: 'thead-light',
        stickyHead: true,
        renderHead: () => <tr>
            <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
            <th style={{ width: '80%' }}>Môn học</th>
            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Tự chọn</th>
            <th style={{ width: '10%', textAlign: 'right' }}>Số tiết LT</th>
            <th style={{ width: '10%', textAlign: 'right' }}>Số tiết TH</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số lớp</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiết <br /> /buổi</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số buổi <br />/tuần</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số lượng <br /> dự kiến</th>
            <th style={{ width: 'auto' }}>Chọn</th>
        </tr>,
        renderRow: (item, index) => {
            this.soLop = {};
            this.soTietBuoi = {};
            this.soBuoiTuan = {};
            this.soLuongDuKien = {};
            return (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell content={<>{item.maMonHoc} <br /> {item.tenMonHoc}</>} />
                    <TableCell style={{ textAlign: 'center' }} content={item.loaiMonHoc ? 'x' : ''} />
                    <TableCell style={{ textAlign: 'right' }} content={item.soTietLyThuyet} />
                    <TableCell style={{ textAlign: 'right' }} content={item.soTietThucHanh} />
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                        <FormTextBox type='number' ref={e => this.soLop[index] = e} style={{ marginBottom: '0' }} readOnly={!item.isMo} />
                    } />
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                        <FormTextBox type='number' ref={e => this.soTietBuoi[index] = e} style={{ marginBottom: '0' }} readOnly={!item.isMo} />
                    } />
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                        <FormTextBox type='number' ref={e => this.soBuoiTuan[index] = e} style={{ marginBottom: '0' }} readOnly={!item.isMo} />
                    } />
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                        <FormTextBox type='number' ref={e => this.soLuongDuKien[index] = e} style={{ marginBottom: '0', width: '100px' }} suffix=' người' readOnly={!item.isMo} />
                    } />
                    <TableCell type='checkbox' content={item.isMo} permission={{ write: true }} onChanged={() => {
                        list[index].isMo = !list[index].isMo;
                        this.setState({ listMonHocChung: list }, () => {
                            ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => this[textBox][index].value(list[index].isMo ? item[textBox] : ''));
                        });
                    }} />
                </tr>
            );
        }
    })

    renderMonHocChuyenNganh = (list) => renderTable({
        getDataSource: () => list,
        emptyTable: 'Không có môn học riêng các chuyên ngành',
        header: 'thead-light',
        renderHead: () => <tr>
            <th style={{ width: 'auto' }}>Chuyên ngành</th>
            <th style={{ width: '80%' }}>Môn học</th>
            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Tự chọn</th>
            <th style={{ width: '10%', textAlign: 'right' }}>Số tiết LT</th>
            <th style={{ width: '10%', textAlign: 'right' }}>Số tiết TH</th>
            <th style={{ width: 'auto' }}>Chọn</th>
        </tr>,
        renderRow: (item) => {
            let danhSachMonChuyenNganh = item.danhSachMonChuyenNganh || [],
                rowSpan = danhSachMonChuyenNganh.length;
            const rows = danhSachMonChuyenNganh.map((monHoc, index) => {
                return (
                    <tr key={item.tenChuyenNganh + index}>
                        {index == 0 && <TableCell contentClassName='multiple-lines-2' content={monHoc.tenChuyenNganh} rowSpan={rowSpan} />}
                        <TableCell content={<>{monHoc.maMonHoc} <br /> {monHoc.tenMonHoc}</>} />
                        <TableCell style={{ textAlign: 'center' }} content={monHoc.loaiMonHoc ? 'x' : ''} />
                        <TableCell style={{ textAlign: 'right' }} content={monHoc.soTietLyThuyet} />
                        <TableCell style={{ textAlign: 'right' }} content={monHoc.soTietThucHanh} />
                        <TableCell type='checkbox' content={monHoc.isMo} permission={{ write: true }} onChanged={() => {
                            danhSachMonChuyenNganh[index].isMo = !danhSachMonChuyenNganh[index].isMo;
                            this.setState({ listMonHocChuyenNganh: list });
                        }} />
                    </tr>
                );
            });
            return rows;
        }

    })
    render = () => {
        let { listMonHocChung, listMonHocChuyenNganh } = this.state;
        console.log(listMonHocChuyenNganh);
        return this.renderModal({
            title: 'Chọn môn học từ Chương trình đào tạo',
            size: 'elarge',
            body: <div className='row'>
                <div className='form-group col-md-12'>
                    <label>Môn chung:</label>
                    {this.renderMonHocChung(listMonHocChung)}
                </div>
                <div className='form-group col-md-12'>
                    <label>Môn chuyên ngành:</label>
                    {this.renderMonHocChuyenNganh(listMonHocChuyenNganh)}
                </div>
            </div>
        });
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    getDanhSachMonChuongTrinhDaoTao
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(MonHocCtdtModal);