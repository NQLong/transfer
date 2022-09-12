import React from 'react';
import { createDtThoiKhoaBieuMultiple } from './redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';
import { getDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';

class DtThoiKhoaBieuImportPage extends AdminPage {
    state = { indexRow: null, thoiKhoaBieu: [], message: '', displayState: 'import', isDisplay: true };

    componentDidMount() {
        T.ready('/user/dao-tao');
    }
    
    delete = (e, index) => {
        e.preventDefault();
        T.confirm('Xóa dữ liệu', 'Bạn có muốn xóa dữ liệu học phí này không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                const thoiKhoaBieu = this.state.thoiKhoaBieu;
                thoiKhoaBieu.splice(index, 1);
                this.setState({ thoiKhoaBieu }, () => T.notify('Xóa dữ liệu thành công', 'success'));
            }
            if (this.state.thoiKhoaBieu.length == 0) {
                this.setState({ displayState: 'import' });
            }
        });
    };

    onSuccess = (response) => {
        if (response.error) {
            T.notify(response.error, 'danger');
        } else if (response.items) {
            this.setState({
                thoiKhoaBieu: response.items,
                message: `${response.items.length} hàng được tải lên thành công`,
                isDisplay: false,
                displayState: 'data'
            }, () => {
                const { message } = this.state;
                T.notify(message, 'success');
            });
        }
    };

    save = (e) => {
        const doSave = () => {
            const data = this.state.thoiKhoaBieu;
            this.props.createDtThoiKhoaBieuMultiple(data, (error, data) => {
                if (error) {
                    T.notify('Cập nhật dữ liệu bị lỗi!', 'danger');
                } else {
                    this.setState({ displayState: 'import', thoiKhoaBieu: [] });
                    T.notify(`Cập nhật ${data && data.items ? data.items.length + ' ' : ''} thời khoá biểu thành công!`, 'success');
                    this.props.history.push('/user/dao-tao/thoi-khoa-bieu');
                }
            });
        };
        e.preventDefault();
        T.confirm('Cập nhật dữ liệu', 'Bạn có muốn thêm những dữ liệu này không?', 'warning', true, isConfirm => {
            isConfirm && doSave();
        });
    };


    saveRow = (e) => {
        e.preventDefault();
        this.setState({ indexRow: null });
    }
    render() {
        const { thoiKhoaBieu, displayState } = this.state,
            permission = this.getUserPermission('dtThoiKhoaBieu', ['read', 'write', 'delete']);
        let table = 'Không có dữ liệu!';
        if (thoiKhoaBieu && thoiKhoaBieu.length > 0) {
            table = renderTable({
                getDataSource: () => thoiKhoaBieu, stickyHead: true,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>

                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học kỳ</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }}>Môn học</th>
                        <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Khoa đăng ký</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Lớp</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Số tiết</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>SLDK</th>
                        <th style={{ width: '30%', textAlign: 'center' }}>Ngành</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' style={{ width: 'auto', textAlign: 'center' }} content={index + 1} />
                        <TableCell type='text' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content={item?.namStr} />
                        <TableCell type='text' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content={item?.hocKy} />
                        <TableCell type='text' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content={item?.maMonHocStr} />
                        <TableCell type='text' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content={item.khoaDangKyStr} />
                        <TableCell type='number' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content={item?.soLop} />
                        <TableCell type='number' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content={item?.soTietBuoi} />
                        <TableCell type='number' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content={item?.soLuongDuKien} />
                        <TableCell type='text' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content={item?.tenNganh} />

                        <TableCell type='buttons' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content={item} permission={permission}
                            onEdit={this.state.indexRow == index ? '' : () => this.setState({ indexRow: index }, () => { })} onDelete={(e) => this.delete(e, index)}
                        >
                            {this.state.indexRow == index ? <Tooltip title='Lưu' arrow placeholder='bottom'>
                                <a className='btn btn-success' href='#' onClick={e => this.saveRow(e, index)}><i className='fa fa-lg fa-save' /></a>
                            </Tooltip> : ''}
                        </TableCell>
                    </tr>)
            });
        }
        return this.renderPage(
            {
                icon: 'fa fa-calendar',
                title: 'Thời khoá biểu',
                breadcrumb: [<Link key={0} to='/user/dao-tao'>Đào tạo</Link>, <Link key={1} to='/user/dao-tao/thoi-khoa-bieu'>Thời khoá biểu</Link>, 'Import'],
                content:
                    <>
                        <div className='tile rows' style={{ textAlign: 'right', display: displayState == 'import' ? 'block' : 'none' }}>

                            <FileBox postUrl='/user/upload' uploadType='DtThoiKhoaBieuData' userData={'DtThoiKhoaBieuData'}
                                accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                                style={{ width: '80%', margin: '0 auto' }}
                                ajax={true} success={this.onSuccess} />
                            <button className='btn btn-warning' type='button' onClick={e => e.preventDefault() || T.download('/api/dao-tao/thoi-khoa-bieu/download-template')}>
                                <i className='fa fa-fw fa-lg fa-arrow-circle-down' />Tải file mẫu tại đây
                            </button>
                        </div>
                        <div className='tile' style={{ display: displayState == 'import' ? 'none' : 'block' }}>
                            {table}
                        </div>
                    </>,
                onSave: displayState == 'data' ? (e) => this.save(e) : null,
            }
        );
    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createDtThoiKhoaBieuMultiple, getDmDonVi };
export default connect(mapStateToProps, mapActionsToProps)(DtThoiKhoaBieuImportPage);
