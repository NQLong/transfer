import React from 'react';
import { connect } from 'react-redux';
import { uploadDmDonVi } from './redux';
import xlsx from 'xlsx';
import { Link } from 'react-router-dom';

const UploadBoxStyle = {
    backgroundImage: 'url(\'/img/upload.png\')',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
    width: 'auto',
    height: '124px',
    lineHeight: '124px',
    fontSize: '64px',
    color: 'black',
    textAlign: 'center',
    border: '1px dashed #333',
    cursor: 'pointer'
};

class UploadDmDonVi extends React.Component {
    state = { isUploading: false, userData: 'dmDonViData', totalRecord: 0 };
    box = React.createRef();
    uploadInput = React.createRef();

    componentDidMount() {
        T.ready('/user/danh-muc/don-vi');
    }

    parseDataToInput = (data, index) => {
        return `
            <tr key={index}>
                <td>
                    <input id='ma${index}' type='number' value='${data['   MS_DV'] != undefined ? data['   MS_DV'] : ''}' />
                </td>
                <td>
                    <input id='ten${index}' type='string' value='${data['   TEN_DV'] != undefined ? data['   TEN_DV'] : ''}' />
                </td>
                <td>
                    <input id='tenTiengAnh${index}' type='string' value='${data['   TEN_TIENG_ANH'] != undefined ? data['   TEN_TIENG_ANH'] : ''}' />
                </td>
                <td>
                    <input id='tenVietTat${index}' type='string' value='${data['TEN_VIET_TAT'] != undefined ? data['TEN_VIET_TAT'] : ''}' />
                </td>
                <td>
                    <input id='qdThanhLap${index}' type='string' value='${data['QD_TLAP'] ? data['QD_TLAP'] : ''}' />
                </td>
                <td>
                    <input id='kichHoat${index}' type='checkbox' ${data['KICH_HOAT'] == true ? 'checked' : ''} />
                </td>
                <td>
                    <input id='qdXoaTen${index}' type='string' value='${data['QD_XOA_TEN'] != undefined ? data['QD_XOA_TEN'] : ''}' />
                </td>
                <td>
                    <input id='maPL${index}' type='string' value='${data['MA_PL'] != undefined ? data['MA_PL'] : ''}' />
                </td>
                <td>
                    <input id='ghiChu${index}' type='string' value='${data['GHI_CHU'] != undefined ? data['GHI_CHU'] : ''}' />
                </td>
            </tr>
        `;
    }

    onDrop = (e) => {
        e.preventDefault();
        $(this.box.current).css('background-color', '#FFF');

        if (e.dataTransfer.items) {
            if (e.dataTransfer.items.length > 0) {
                const item = e.dataTransfer.items[0];
                if (item.kind == 'file') {
                    this.onUploadFile(e.dataTransfer.items[0].getAsFile());
                }
            }
            e.dataTransfer.items.clear();
        } else {
            if (e.dataTransfer.files.length > 0) {
                this.onUploadFile(e.dataTransfer.files[0]);
            }
            e.dataTransfer.clearData();
        }
    }

    onClick = (e) => {
        e.preventDefault();
        $(this.uploadInput.current).click();
    }

    onDragOver = (e) => e.preventDefault();
    onDragEnter = (e) => {
        $(this.box.current).css({ 'background-color': '#009688' });
        e.preventDefault();
    }

    onDragLeave = (e) => {
        $(this.box.current).css({ 'background-color': '#FFF' });
        e.preventDefault();
    }

    onSelectFileChanged = (e) => {
        if (e.target.files.length > 0) {
            this.onUploadFile(e.target.files[0]);
        }
    };

    onUploadFile = (file) => {
        this.setState({ isUploading: true });
        let reader = new FileReader();
        reader.onload = (event) => {
            let data = event.target.result;
            let workbook = xlsx.read(data, { type: 'binary' });
            workbook.SheetNames.forEach((sheetName) => {
                let XL_row = xlsx.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                this.setState({ totalRecord: XL_row.length });
                let result = '';
                XL_row.forEach((item, index) => {
                    result += this.parseDataToInput(item, index);
                });
                document.getElementById('tbodyTableDmDonVi').innerHTML = result;
            });
        };
        reader.onerror = (event) => console.log('errors', event.target.error);
        reader.readAsBinaryString(file);
    }

    submit = (e) => {
        e.preventDefault();
        let params = [];
        for (let i = 0; i < this.state.totalRecord; i++) {
            params.push({
                ma: $(`#ma${i}`).val(),
                ten: $(`#ten${i}`).val(),
                tenTiengAnh: $(`#tenTiengAnh${i}`).val(),
                tenVietTat: $(`#tenVietTat${i}`).val(),
                qdThanhLap: $(`#qdThanhLap${i}`).val(),
                kichHoat: $(`#kichHoat${i}`).is(':checked') ? 1 : 0,
                qdXoaTen: $(`#kichHoat${i}`).is(':checked') ? '0' : '1',
                maPL: $(`#maPL${i}`).val(),
                ghiChu: $(`#ghiChu${i}`).val(),
            });
        }
        this.props.uploadDmDonVi(params, this.props.history);
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmDonVi:upload');
        return (
            <main className='app-content'>
                <div className='row tile'>
                    <div style={{ width: '100%', backgroundColor: '#fdfdfd' }}>
                        <div ref={this.box} id='dragDmDonVi' style={UploadBoxStyle}
                            onDrop={this.onDrop} onClick={this.onClick}
                            onDragOver={this.onDragOver} onDragEnter={this.onDragEnter} onDragLeave={this.onDragLeave} />
                        <small className='form-text text-primary' style={{ textAlign: 'center' }}>
                            Nhấp hoặc kéo tập tin thả vào ô phía trên!
                        </small>
                        <input name='uploadType' onChange={this.onSelectFileChanged} style={{ display: 'none' }} ref={this.uploadInput} />
                    </div>
                </div>
                {this.state.totalRecord != 0 && (
                    <div className='tile'>
                        <table className='table table-responsive table-hover table-bordered'>
                            <thead>
                                <tr>
                                    <td style={{ width: 'auto' }}>Mã</td>
                                    <td style={{ width: '50%' }}>Tên đơn vị</td>
                                    <td style={{ width: '50%' }}>Tên tiếng Anh</td>
                                    <td style={{ width: 'auto' }}>Tên viết tắt</td>
                                    <td style={{ width: 'auto' }}>QĐ thành lập</td>
                                    <td style={{ width: 'auto' }} nowrap='true'>Kích hoạt</td>
                                    <td style={{ width: 'auto' }} nowrap='true'>QĐ xóa tên</td>
                                    <td style={{ width: 'auto' }}>Mã PL</td>
                                    <td style={{ width: 'auto' }}>Ghi chú</td>
                                </tr>
                            </thead>
                            <tbody id='tbodyTableDmDonVi'></tbody>
                        </table>
                    </div>
                )}

                {permissionWrite && (
                    <button className='btn btn-success btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.submit}>
                        <i className='fa fa-lg fa-upload' />
                    </button>)}
                <Link to='/user/danh-muc/don-vi/' className='btn btn-secondary btn-circle' style={{ position: 'fixed', lefft: '10px', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { uploadDmDonVi };
export default connect(mapStateToProps, mapActionsToProps)(UploadDmDonVi);