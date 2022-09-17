import React from 'react';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';
import { connect } from 'react-redux';

export class ImportSinhVien extends AdminPage {
    state = { errors: null }
    onSuccess = (data) => {
        if (data.error) {
            T.notify('Dữ liệu sinh viên lỗi. ' + (data.error.message || data.error || ''), 'danger');
        } else {
            if (data.sum) {
                T.notify(`Tạo thành công ${data.sum} sinh viên`);
            }
            if (data.errors) {
                this.setState({ errors: data.errors });
            }
        }
    }

    render() {
        return this.renderPage({
            title: 'Import danh sách sinh viên',
            content: <div>
                <div className='tile'>
                    <h3 className='tile-header' style={{ display: this.state.loading ? 'none' : 'block' }}>Tải lên danh sách sinh viên</h3>
                    <div className='tile-body row'>
                        <div className='col-md-12' >
                            <FileBox postUrl='/user/upload' uploadType='FwSinhVienImport' userData={'FwSinhVienImport'}
                                accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                                style={{ width: '80%', margin: '0 auto' }}
                                ajax={true} success={this.onSuccess} />
                        </div>
                        {/* <div className='col-md-12 d-flex justify-content-end'>
                            <button className='btn btn-success'></button>
                        </div> */}
                    </div>
                </div>
                {this.state.errors && <div className='tile'>
                    <h3 className='tile-header'>Danh sách sinh viên tạo lỗi</h3>
                    <div className='tile-body row'>
                        {renderTable({
                            getDataSource: () => this.state.errors,
                            renderHead: () => <tr>
                                <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                                <th style={{ width: '20%', textAlign: 'left' }}>MSSV</th>
                                <th style={{ width: '50%', textAlign: 'left' }}>Họ</th>
                                <th style={{ width: '30%', textAlign: 'left' }}>Tên</th>
                            </tr>,
                            renderRow: (item, index) => {
                                return <tr key={index}>
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={index} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten} />
                                </tr>;
                            }
                        })}
                    </div>
                </div>}
            </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(ImportSinhVien);