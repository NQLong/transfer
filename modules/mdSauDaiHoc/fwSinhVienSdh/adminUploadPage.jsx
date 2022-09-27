import React from 'react';
import { connect } from 'react-redux';
import { createSvSdhMutiple } from './redux';
import { OverlayLoading } from 'view/component/Pagination';
import { AdminPage, TableCell, renderTable, FormFileBox } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';

class AdminSvSdhUploadPage extends AdminPage {
    state = { data: [], loading: false };

    componentDidMount() {
        T.ready('/user/oisp', () => {
            this.fileBox.setData('fwSinhVienSdhImportData');
        });
    }

    onSuccess = (data) => {
        this.setState({ data: data.element });
    }

    save = () => {
        let data = this.state.data;
        if (data.length == 0) {
            T.notify('Chưa upload file data!', 'danger');
        } else {
            this.setState({ loading: true });
            this.props.createSvSdhMutiple(data, () => {
                this.setState({ loading: false });
                this.props.history.push('/user/sau-dai-hoc/sinh-vien');
            });

        }
    }

    getSampleFile = (e) => {
        e.preventDefault();
        this.props.getSampleFile();
    }

    render() {
        const permission = this.getUserPermission('svSdh', ['read', 'write', 'delete']),
            readOnly = !permission.write;
        let list = this.state.data;
        const table = renderTable({
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Mã số sinh viên</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Họ tên</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Giới tính</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Ngày sinh</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Quốc tịch</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Dân tộc</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Tôn giáo</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Nơi sinh</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Địa chỉ hiện tại</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Khoa</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Ngành</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Năm tuyển sinh</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Niên khóa</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Bậc đào tạo</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Hệ đào tạo</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Chương trình đào tạo</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Tình trạng</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Số điện thoại cá nhân</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Số điện thoại liên hệ</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Email cá nhân</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Tên cơ quan</th>
                    <th style={{ width: '100%', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Tên đề tài</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Giáo viên hướng dẫn</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={index + 1} />
                    <TableCell type='text' content={item.ma} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.ho + ' ' + item.ten} />
                    <TableCell type='text' content={item.gioiTinh} />
                    <TableCell type='text' content={item.ngaySinh ? T.dateToText(item.ngaySinh, 'dd/mm/yyyy') : ''} />
                    <TableCell type='text' content={item.quocTich} />
                    <TableCell type='text' content={item.danToc} />
                    <TableCell type='text' content={item.tonGiao} />
                    <TableCell type='text' content={item.noiSinh} />
                    {/* <TableCell type='text' content={item.nguyenQuan} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(item.thuongTruSoNha ? (item.thuongTruSoNha + ', ') : '') + (item.thuongTruXa ? (item.thuongTruXa + ', ') : '') + (item.thuongTruHuyen ? item.thuongTruHuyen + ', ' : '') + (item.thuongTruTinh ? item.thuongTruTinh : '')} /> */}
                    <TableCell type='text' content={item.hienTaiSoNha} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.khoa} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.nganh} />
                    <TableCell type='text' style={{ textAlign: 'center' }} content={item.namTuyenSinh} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.nienKhoa} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.bacDaoTao} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.heDaoTao} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.chuongTrinhDaoTao} />
                    <TableCell type='text' content={item.tinhTrang} />
                    <TableCell type='text' content={item.sdtCaNhan} />
                    <TableCell type='text' content={item.sdtLienHe} />
                    <TableCell type='text' content={item.email} />
                    <TableCell type='text' content={item.tenCoQuan} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenDeTai} />
                    <TableCell type='text' content={item.gvhd} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-cloud-upload',
            title: 'Import data',
            breadcrumb: [
                <Link key={0} to='/user/students'>Sinh viên</Link>,
                <Link key={1} to='/user/sau-dai-hoc/sinh-vien'>Sinh viên sau đại học</Link>,
                'Import data'
            ],
            content: <>
                {this.state.loading ?
                    <div className='tile'>
                        <OverlayLoading text='Đang xử lý..' />
                    </div> :
                    [<div key={0} className='tile'>
                        <div className='row  justify-content-center'>
                            <FormFileBox ref={e => this.fileBox = e} className='col-md-6' postUrl='/user/upload' uploadType='fwSinhVienSdhFile' userData='fwSinhVienSdhImportData' onSuccess={this.onSuccess} />
                        </div>
                    </div>,
                    list.length!=0?
                    <div key={1} className='tile'>{table}</div>:'']
                }
                {/* <a type='button' className='btn btn-success btn-circle' style={{ position: 'fixed', right: '70px', bottom: '10px' }} href={'/api/oisp-tuyen-sinh/import/get-sample-file'} >
                    <i className='fa fa-download' />
                </a> */}

                {(readOnly || list.length==0) ? '' :
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                        <i className='fa fa-lg fa-save' />
                    </button>}
            </>,
            backRoute: '/user/sau-dai-hoc/sinh-vien',

        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createSvSdhMutiple };
export default connect(mapStateToProps, mapActionsToProps)(AdminSvSdhUploadPage);