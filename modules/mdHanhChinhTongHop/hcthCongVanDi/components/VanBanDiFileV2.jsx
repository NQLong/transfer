import { Tooltip } from '@mui/material';
import React from 'react';
import { renderTable, TableCell } from 'view/component/AdminPage';
import PdfViewer from './PdfViewer';
import SignatureConfigModal from './SignatureConfigModal';
import SubmitFileModal from './SubmitFileModal';


export default class VanBanDiFileV2 extends React.Component {
    state = { files: null }

    setFiles = (files) => this.setState({ files });

    getFiles = () => this.state.files;

    renderFileTable = () => {
        return renderTable({
            loadingOverlay: false,
            loadingClassName: 'd-flex justify-content-center',
            getDataSource: () => this.state.files,
            renderHead: () => <tr>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ width: '100%', textAlign: 'center', whiteSpace: 'nowrap' }}>Tệp tin</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Phụ lục</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>,
            renderRow: (item, index) => {
                return <tr key={item.id || index}>
                    <TableCell style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content={index + 1} />
                    <TableCell type='link' onClick={() => this.pdfModal.show({ id: item.id })} style={{ textAlign: 'left' }} content={item.file.ten} />
                    <TableCell type='checkbox' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content={item.phuLuc} />
                    <TableCell style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} type='buttons' >
                        {item.id && <>
                            <Tooltip title='Cấu hình chữ ký' arrow>
                                <button className='btn btn-outline-info' onClick={(e) => e.preventDefault() || e.stopPropagation() || this.configModal.show(item)}><i className='fa fa-lg fa-sliders' /></button>
                            </Tooltip>
                            <Tooltip title='Tải xuống' arrow>
                                <a className='btn btn-info' href={`/api/hcth/van-ban-di/file/${item.id}`} download title='Tải về'>
                                    <i className='fa fa-lg fa-download' />
                                </a>
                            </Tooltip>
                        </>}
                    </TableCell>
                </tr>;
            }
        });
    }

    onAdd = () => {
        this.modal.show();
    }

    onSuccess = (file, done) => {
        if (!this.props.id) {
            this.setState({ files: [...this.state.files, file] }, () => done && done());
        }
        else this.props.getFile(this.props.id, (files) => { this.setFiles(files) || (done && done(files)); });
    }

    render() {
        return (
            <div className='tile'>
                <h3 className='tile-title'>
                    Danh sách văn bản
                </h3>
                <div className='tile-body row'>
                    <div className='col-md-12'>
                        {this.renderFileTable()}
                    </div>
                    <div className='col-md-12 d-flex justify-content-end'>
                        <div className='d-flex justify-content-between'>
                            <button className='btn btn-success' onClick={this.onAdd}>
                                <i className='fa fa-lg fa-plus' /> Thêm
                            </button>
                        </div>
                    </div>
                </div>
                <SubmitFileModal ref={e => this.modal = e} success={this.onSuccess} id={this.props.id} />
                <PdfViewer ref={e => this.pdfModal = e} />
                <SignatureConfigModal ref={e => this.configModal = e} pdfModal={this.pdfModal} getFile={this.props.getFile} setFiles={this.setFiles} />
            </div>
        );
    }
}
