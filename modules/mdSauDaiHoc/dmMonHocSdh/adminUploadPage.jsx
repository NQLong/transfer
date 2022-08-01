import React from 'react';
import { connect } from 'react-redux';
import { createDmMonHocSdhMutiple } from './redux';
import { OverlayLoading } from 'view/component/Pagination';
import { AdminPage, TableCell, renderTable, FormFileBox } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';

class AdminSvSdhUploadPage extends AdminPage {
    state = { data: [], loading: false };

    componentDidMount() {
        T.ready('/user/oisp', () => {
            this.fileBox.setData('dmMonHocSdhImportData');
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
            this.props.createDmMonHocSdhMutiple(data, () => {
                this.setState({ loading: false });
                this.props.history.push('/user/sau-dai-hoc/mon-hoc');
            });
        }
    }

    getSampleFile = (e) => {
        e.preventDefault();
        this.props.getSampleFile();
    }

    render() {
        const permission = this.getUserPermission('dmMonHocSdh', ['read', 'write', 'delete']),
            readOnly = !permission.write;
        let list = this.state.data;
        const table = renderTable({
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }} nowrap='true'>Mã</th>
                    <th style={{ width: '50%' }} nowrap='true'>Tên tiếng Việt</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Tên tiếng Anh</th>
                    <th style={{ width: 'auto' }} nowrap='true'>TC Lý thuyết</th>
                    <th style={{ width: 'auto' }} nowrap='true'>TC Thực hành</th>
                    <th style={{ width: '50%', textAlign: 'center' }}>Khoa</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='link' style={{ textAlign: 'right' }} content={item.ma ? item.ma : ''}
                        onClick={() => this.modal.show(item)} />
                    <TableCell type='text' content={item.tenTiengViet ? item.tenTiengViet : ''} />
                    <TableCell type='text' content={item.tenTiengAnh ? item.tenTiengAnh : ''} />
                    <TableCell type='text' style={{ textAlign: 'center' }} content={item.tcLyThuyet ? item.tcLyThuyet : ''} />
                    <TableCell type='text' style={{ textAlign: 'center' }} content={item.tcThucHanh ? item.tcThucHanh : ''} />
                    <TableCell type='text' content={item.khoaSdh} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-cloud-upload',
            title: 'Import data',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                <Link key={1} to='/user/sau-dai-hoc/mon-hoc'>Danh mục Môn học sau đại học</Link>,
                'Import data'
            ],
            content: <>
                {this.state.loading ?
                    <div className='tile'>
                        <OverlayLoading text='Đang xử lý..' />
                    </div> :
                    [<div key={0} className='tile'>
                        <div className='row  justify-content-center'>
                            <FormFileBox ref={e => this.fileBox = e} className='col-md-6' postUrl='/user/upload' uploadType='dmMonHocSdhFile' userData='dmMonHocSdhImportData' onSuccess={this.onSuccess} />
                        </div>
                    </div>,
                    <div key={1} className='tile'>{table}</div>]
                }
                {/* <a type='button' className='btn btn-success btn-circle' style={{ position: 'fixed', right: '70px', bottom: '10px' }} href={'/api/oisp-tuyen-sinh/import/get-sample-file'} >
                    <i className='fa fa-download' />
                </a> */}

                {readOnly ? '' :
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                        <i className='fa fa-lg fa-save' />
                    </button>}
            </>,
            backRoute: '/user/sau-dai-hoc/mon-hoc'

        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createDmMonHocSdhMutiple };
export default connect(mapStateToProps, mapActionsToProps)(AdminSvSdhUploadPage);