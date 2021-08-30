import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { createMultiDmBenhVien } from './reduxBenhVien';
import { getDmTuyenBenhVienAll } from './reduxTuyenBenhVien';
import xlsx from 'xlsx';

const UploadBoxStyle = {
    backgroundImage: `url('/img/upload.png')`,
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

class UploadDmBenhVien extends React.Component {
    state = { isUploading: false, userData: 'dmBenhVienData', totalRecord: 0 };
    box = React.createRef();
    uploadInput = React.createRef();

    componentDidMount() {
        this.props.getDmTuyenBenhVienAll();
        T.ready('/user/category');
    }

    parseDataToInput = (data, index) => `
            <tr key=${index}>
                <td>
                    <input id='ma${index}' type='number' value='${data['   MA_KCB'] != undefined ? data['   MA_KCB'] : ''}' />
                </td>
                <td>
                    <input id='ten${index}' type='string' value='${data['   TEN_CO_SO_KCB'] != undefined ? data['   TEN_CO_SO_KCB'] : ''}' />
                </td>
                <td>
                    <input id='diaChi${index}' type='string' value='${data['   DIA_CHI_KCB'] != undefined ? data['   DIA_CHI_KCB'] : ''}' />
                </td>
                <td>
                    <input id='maTuyen${index}' type='string' value='${data['   THUOC_TUYEN'] != undefined ? data['   THUOC_TUYEN'] : ''}' />
                </td>
            </tr>`;

    onDrop = (event) => {
        event.preventDefault();
        $(this.box.current).css('background-color', '#FFF')

        if (event.dataTransfer.items) {
            if (event.dataTransfer.items.length > 0) {
                const item = event.dataTransfer.items[0];
                if (item.kind == 'file') {
                    this.onUploadFile(event.dataTransfer.items[0].getAsFile());
                }
            }
            event.dataTransfer.items.clear();
        } else {
            if (event.dataTransfer.files.length > 0) {
                this.onUploadFile(event.dataTransfer.files[0]);
            }
            event.dataTransfer.clearData();
        }
    }

    onClick = (event) => {
        event.preventDefault();
        $(this.uploadInput.current).click();
    }

    onDragOver = (event) => event.preventDefault();
    onDragEnter = (event) => {
        $(this.box.current).css({ 'background-color': '#009688' });
        event.preventDefault();
    }

    onDragLeave = (event) => {
        $(this.box.current).css({ 'background-color': '#FFF' });
        event.preventDefault();
    }

    onSelectFileChanged = (event) => {
        if (event.target.files.length > 0) {
            this.onUploadFile(event.target.files[0]);
            event.target.value = '';
        }
    };

    onUploadFile = (file) => {
        this.setState({ isUploading: true });
        let reader = new FileReader();
        reader.onload = (event) => {
            let data = event.target.result;
            let workbook = xlsx.read(data, { type: 'binary' })
            workbook.SheetNames.forEach((sheetName) => {
                let XL_row = xlsx.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                this.setState({ totalRecord: XL_row.length });
                let result = '';
                XL_row.forEach((item, index) => {
                    result += this.parseDataToInput(item, index);
                });
                document.getElementById('tbodyTableDmBenhVien').innerHTML = result;
            })
        }
        reader.onerror = (event) => console.log('errors', event.target.error);
        reader.readAsBinaryString(file);
    }

    submit = (event) => {
        event.preventDefault();
        let params = [];
        for (let i = 0; i < this.state.totalRecord; i++) {
            let ma_tuyen = '';
            this.props.dmBenhVienMaTuyen.items.forEach(item => item.ten == $(`#maTuyen${i}`).val().trim() && item.kichHoat == 1 ? ma_tuyen = item.ma : null);
            params.push({
                ma: $(`#ma${i}`).val().trim(),
                ten: $(`#ten${i}`).val().trim(),
                diaChi: $(`#diaChi${i}`).val().trim(),
                maTuyen: ma_tuyen,
                kichHoat: 1
            })
        }

        this.props.createMultiDmBenhVien(params, () => {
            this.props.history.push('/user/danh-muc/benh-vien');
        })
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmBenhVien:upload');
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' /> Tải lên file danh mục Bệnh viện</h1>
                </div>
                <div className='tile'>
                    <div style={{ width: '100%', backgroundColor: '#fdfdfd' }}>
                        <div ref={this.box} id='dragDmBenhVien' style={UploadBoxStyle}
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
                                    <td style={{ width: '10%' }}>Mã KCB</td>
                                    <td style={{ width: '30%' }}>Tên cơ sở KCB</td>
                                    <td style={{ width: '30%' }}>Địa chỉ KCB</td>
                                    <td style={{ width: 'auto' }}>Thuộc tuyến</td>
                                </tr>
                            </thead>
                            <tbody id='tbodyTableDmBenhVien'>
                            </tbody>
                        </table>
                    </div>
                )}
                {permissionWrite && [
                    <Link key={0} to='/user/danh-muc/benh-vien' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                        <i className='fa fa-lg fa-reply' />
                    </Link>,
                    <button key={1} className='btn btn-success btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.submit}>
                        <i className='fa fa-lg fa-upload' />
                    </button>
                ]}
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmBenhVienMaTuyen: state.dmTuyenBenhVien });
const mapActionsToProps = { createMultiDmBenhVien, getDmTuyenBenhVienAll };
export default connect(mapStateToProps, mapActionsToProps)(UploadDmBenhVien);