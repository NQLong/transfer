import React from 'react';
import { connect } from 'react-redux';
import { createDmNganhSdhMutiple } from './redux';
import { OverlayLoading } from 'view/component/Pagination';
import { AdminPage, TableCell, renderTable, FormFileBox } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';

class AdminSvSdhUploadPage extends AdminPage {
    state = { data: [], loading: false };

    componentDidMount() {
        T.ready('/user/oisp', () => {
            this.fileBox.setData('dmNganhSdhImportData');
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
            this.props.createDmNganhSdhMutiple(data, () => {
                this.setState({ loading: false });
                this.props.history.push('/user/danh-muc/nganh-sau-dai-hoc');
            });
        }
    }

    getSampleFile = (e) => {
        e.preventDefault();
        this.props.getSampleFile();
    }

    render() {
        const permission = this.getUserPermission('dmNganhSdh', ['read', 'write', 'delete']),
            readOnly = !permission.write;
        let list = this.state.data;
        const table = renderTable({
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>#</th>
                    <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Mã ngành</th>
                    <th style={{ width: '70%', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Tên ngành</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={index + 1} />
                    <TableCell type='text' content={item.maNganh} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.ten} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-cloud-upload',
            title: 'Import data',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                <Link key={1} to='/user/danh-muc/nganh-sau-dai-hoc'>Danh mục Ngành sau đại học</Link>,
                'Import data'
            ],
            content: <>
                {this.state.loading ?
                    <div className='tile'>
                        <OverlayLoading text='Đang xử lý..' />
                    </div> :
                    [<div key={0} className='tile'>
                        <div className='row  justify-content-center'>
                            <FormFileBox ref={e => this.fileBox = e} className='col-md-6' postUrl='/user/upload' uploadType='dmNganhSdhFile' userData='dmNganhSdhImportData' onSuccess={this.onSuccess} />
                        </div>
                    </div>,
                    <div key={1} className='tile'>{table}</div>]
                }
                {/* <a type='button' className='btn btn-success btn-circle' style={{ position: 'fixed', right: '70px', bottom: '10px' }} href={'/download/'} >
                    <i className='fa fa-download' />
                </a> */}

                {readOnly ? '' :
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                        <i className='fa fa-lg fa-save' />
                    </button>}
            </>,
            backRoute: '/user/danh-muc/nganh-sau-dai-hoc',

        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createDmNganhSdhMutiple };
export default connect(mapStateToProps, mapActionsToProps)(AdminSvSdhUploadPage);