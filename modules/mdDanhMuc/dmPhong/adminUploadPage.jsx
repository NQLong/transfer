import React from 'react';
import { connect } from 'react-redux';
import { getDmPhongPage, getDmPhongAll, deleteDmPhong, createDmPhong, updateDmPhong, createDmPhongByUpload } from './redux';
import { getDmToaNhaAll } from 'modules/mdDanhMuc/dmToaNha/redux';
import Editor from 'view/component/CkEditor4';
import FileBox from 'view/component/FileBox';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    state = { kichHoat: 1, item: {} };
    modal = React.createRef();
    editorVi = React.createRef();
    editorEn = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => {
                $(`a[href='#dmPhongTabVi']`).tab('show');
                $('#dmPhongName').focus();
            });
            $('#categoryBuilding').select2({ minimumResultsForSearch: -1 });
        }, 250));
    }

    show = (item) => {
        let { ma, ten, toaNha, moTa, kichHoat } = item ? item : { ma: '', ten: '', toaNha: '', moTa: '', kichHoat: 1 };
        ten = T.language.parse(ten, true);
        moTa = T.language.parse(moTa, true);
        $('#categoryRoomBuilding').val(toaNha ? item.toaNha : '');
        $('#categoryRoomBuilding').select2({ minimumResultsForSearch: -1 }).trigger('change');

        $('#dmPhongName').val(ten.vi);
        this.editorVi.current.html(moTa.vi);
        this.editorEn.current.html(moTa.en);
        this.setState({ kichHoat });

        $(this.modal.current).attr('data-id', ma).modal('show');
    }
    hide = () => $(this.modal.current).modal('hide')

    save = (e) => {
        e.preventDefault();
        const ma = $(this.modal.current).attr('data-id'),
            changes = {
                ten: JSON.stringify({ vi: $('#dmPhongName').val().trim(), en: $('#dmPhongName').val().trim() }),
                toaNha: $('#categoryRoomBuilding').val(),
                moTa: JSON.stringify({ vi: this.editorVi.current.html(), en: this.editorEn.current.html() }),
                kichHoat: this.state.kichHoat,
            };
        if (changes.ten == '') {
            T.notify('Tên phòng học bị trống!', 'danger');
            $(`a[href='#dmPhongTabVi']`).tab('show');
            $('#dmPhongName').focus();
        } else if (changes.toaNha == null) {
            T.notify('Toà nhà chưa được chọn!', 'danger');
        } else {
            this.props.dataChanges({ changes, ma });
            $(this.modal.current).modal('hide');
        }
    };
    render() {
        const readOnly = this.props.readOnly;
        let listToaNha = this.props.building;
        if (typeof listToaNha == 'object') listToaNha = Object.values(listToaNha);
        const listToaNhaOption = listToaNha.map(item => <option key={item.ma} value={item.ma}>{T.language.parse(item.ten, true).vi}</option>);

        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Phòng học</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <ul className='nav nav-tabs'>
                                <li className='nav-item'>
                                    <a className='nav-link active show' data-toggle='tab' href='#dmPhongTabVi'>Việt Nam</a>
                                </li>
                                <li className='nav-item'>
                                    <a className='nav-link' data-toggle='tab' href='#dmPhongTabEn'>English</a>
                                </li>

                                <div style={{ position: 'absolute', top: '16px', right: '8px' }}>
                                    <div style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
                                        <label htmlFor='dmPhongActive'>Kích hoạt: </label>&nbsp;&nbsp;
                                        <div className='toggle'>
                                            <label>
                                                <input type='checkbox' id='dmPhongActive' checked={this.state.kichHoat} onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
                                                <span className='button-indecator' />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </ul>
                            <div className='tab-content' style={{ marginTop: 8 }}>
                                <div className='form-group row'>
                                    <div className='col-12 col-sm-6'>
                                        <label htmlFor='dmPhongName'>Tên phòng học</label>
                                        <input className='form-control' id='dmPhongName' type='text' placeholder='Tên phòng học' />
                                    </div>
                                    <div className='col-12 col-sm-6'>
                                        <label className='control-label' htmlFor='dmPhongBuilding'>Toà nhà</label>
                                        <select className='form-control' id='categoryRoomBuilding'>{listToaNhaOption}</select>
                                    </div>
                                </div>

                                <div id='dmPhongTabVi' className='tab-pane fade show active'>
                                    <div className='form-group'>
                                        <label>Mô tả</label>
                                        <Editor ref={this.editorVi} height='200px' placeholder='Mô tả' />
                                    </div>
                                </div>
                                <div id='dmPhongTabEn' className='tab-pane fade'>
                                    <div className='form-group'>
                                        <label>Description</label>
                                        <Editor ref={this.editorEn} height='200px' placeholder='Description' />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            {!readOnly && <button type='submit' className='btn btn-primary'>Lưu</button>}
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class adminUploadPage extends React.Component {
    modal = React.createRef();
    state = { uploadSuccess: false, room: [], allBuilding: [], roomNameClass: 'roomName', errorRecords: [] }

    componentDidMount() {
        this.props.getDmToaNhaAll();
        this.props.getDmPhongAll();
        T.ready('/user/category');
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    };

    changeActive = item => {
        this.setState(state => {
            state.room.forEach(data => {
                if (data.ma == item.ma) {
                    data.kichHoat = Number(!data.kichHoat);
                }
            });
            return state;
        })
    };

    delete = (e, item) => {
        e.preventDefault();
        let indexDelete;
        T.confirm('Xóa danh mục phòng', 'Bạn có chắc bạn muốn xóa phòng này?', true, isConfirm =>
            isConfirm && this.setState(state => {
                state.room.forEach((data, index) => {
                    if (data.ma == item.ma) {
                        indexDelete = index;
                    }
                });
                state.room.splice(indexDelete, 1);
                return state;
            }));

    };

    updateTableData = (dataEditModal) => {
        this.setState((state, props) => {
            this.state.allBuilding.forEach(building => {
                if (building.ma == dataEditModal.changes.toaNha) {
                    dataEditModal.changes.toaNha = building.ma;
                }
            });
            state.room.forEach(data => {
                if (data.ma == dataEditModal.ma) {
                    data.ten = dataEditModal.changes.ten;
                    data.toaNha = dataEditModal.changes.toaNha;
                    data.moTa = dataEditModal.changes.moTa;
                    data.kichHoat = dataEditModal.changes.kichHoat;
                }
            });
            return state;
        });
    };

    onSuccess = (data) => {
        this.setState({
            uploadSuccess: true,
            room: data.room,
            allBuilding: data.allBuilding
        });
    };

    saveUpload = () => {
        let dataImport = this.state.room;
        let existRoomsList = this.props.dmPhong && this.props.dmPhong.items ? this.props.dmPhong.items : [];
        let errorRecords = []; // Lưu tên phòng + id tòa nhà
        let continueToRun = 1;
        let noBuildingDataFlag = 0;

        // Kiểm tra dữ liệu import thiếu tòa nhà
        for (let i = 0; i < dataImport.length; i++) {
            if (dataImport[i].toaNha == '') {
                noBuildingDataFlag = 1;
                errorRecords.push(T.language.parse(dataImport[i].ten, true).vi);
                continueToRun = 0;
            }
            for (let j = i + 1; j < dataImport.length; j++) {
                if (dataImport[i].ten === dataImport[j].ten && dataImport[i].toaNha === dataImport[j].toaNha) {
                    let listToaNha =
                        this.props.dmToaNha &&
                            this.props.dmToaNha.items
                            ? this.props.dmToaNha.items
                            : [];
                    if (typeof listToaNha == 'object')
                        listToaNha = Object.values(listToaNha);
                    T.notify(
                        `Dữ liệu import bị trùng tại phòng ${T.language.parse(dataImport[i].ten, true).vi
                        } tòa nhà ${T.language.parse(
                            listToaNha.find(e => e.ma == dataImport[i].toaNha)
                                .ten,
                            true
                        ).vi
                        }!`,
                        'danger'
                    );
                    errorRecords.push(T.language.parse(dataImport[i].ten, true).vi + dataImport[i].toaNha);
                    continueToRun = 0;
                }
            }
        }

        // Kiểm tra dữ liệu import thiếu phòng
        for (let i = 0; i < existRoomsList.length; i++) {
            let roomName = T.language.parse(existRoomsList[i].ten, true).vi;
            let buildingId = existRoomsList[i].toaNha;
            for (let j = 0; j < dataImport.length; j++) {
                if (roomName == T.language.parse(dataImport[j].ten, true).vi && buildingId == dataImport[j].toaNha) {
                    let listToaNha = this.props.dmToaNha && this.props.dmToaNha.items ? this.props.dmToaNha.items : [];
                    if (typeof listToaNha == 'object') listToaNha = Object.values(listToaNha);
                    T.notify(
                        `Phòng ${roomName} tòa nhà ${T.language.parse(listToaNha.find(e => e.ma == buildingId).ten, true).vi} đã tồn tại!`,
                        'danger'
                    );
                    errorRecords.push(roomName + buildingId);
                    continueToRun = 0;
                }
            }
        }
        this.setState({ errorRecords: errorRecords });
        if (noBuildingDataFlag == 1)
            T.notify('Tạo phòng bị lỗi do không có dữ liệu tòa nhà, vui lòng kiểm tra lại dữ liệu!', 'danger');
        if (continueToRun == 0) return;
        for (let i = 0; i < dataImport.length; i++) {
            if ('ma' in dataImport[i]) {
                delete dataImport[i].ma;
            }
        }
        if (dataImport && dataImport.length > 0) {
            this.props.createDmPhongByUpload(dataImport, () => this.props.history.push('/user/danh-muc/phong'));
        }
    };

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmPhong:write'),
            permissionDelete = currentPermissions.includes('dmPhong:delete');
        const { pageNumber, pageSize, pageTotal, totalItem } = this.props.dmPhong && this.props.dmPhong.page ?
            this.props.dmPhong.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        let table = null;
        let listToaNha = this.props.dmToaNha && this.props.dmToaNha.items ? this.props.dmToaNha.items : [];

        if (typeof listToaNha == 'object') listToaNha = Object.values(listToaNha);
        if (this.state.room && this.state.room.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '50%' }}>Tên</th>
                            <th style={{ width: '50%' }}>Tòa nhà</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.room.map((item, index) => (
                            <tr key={index} className='item-model'>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td className={this.state.roomNameClass + `${T.language.parse(item.ten, true).vi + item.toaNha}`}
                                    style={{ color: this.state.errorRecords.find(e => e == `${T.language.parse(item.ten, true).vi + item.toaNha}`) ? 'red' : 'black' }}>
                                    {T.language.parse(item.ten, true).vi}
                                </td>
                                <td className={this.state.roomNameClass + `${T.language.parse(item.ten, true).vi + item.toaNha}`}
                                    style={{ color: this.state.errorRecords.find(e => e == `${T.language.parse(item.ten, true).vi + item.toaNha}`) ? 'red' : 'black' }}>
                                    {listToaNha.find(e => e.ma == item.toaNha) ? T.language.parse(listToaNha.find(e => e.ma == item.toaNha).ten, true).vi : ''}
                                </td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.kichHoat == '1' ? true : false} onChange={() => permissionWrite && this.changeActive(item)} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <div className='btn-group'>
                                        <a className='btn btn-primary' href='#' onClick={e => this.edit(e, item)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        {permissionDelete && (
                                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                                <i className='fa fa-trash-o fa-lg' />
                                            </a>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' /> Danh mục Phòng: Upload</h1>
                </div>
                <div style={{ marginTop: '2%' }} className='row tile'>
                    <FileBox ref={this.fileBox} postUrl='/api/danh-muc/phong/upload' uploadType='RoomFile'
                        userData='roomImportData' style={{ width: '100%', backgroundColor: '#fdfdfd' }}
                        success={this.onSuccess} ajax={true} />
                </div>

                {table ? <div style={{ marginTop: '2%' }} className='row tile'>{table}</div> : null}
                <EditModal dataChanges={this.updateTableData} ref={this.modal} readOnly={!permissionWrite} building={this.props.dmToaNha && this.props.dmToaNha.items ? this.props.dmToaNha.items : []}
                    createDmPhong={this.props.createDmPhong} updateDmPhong={this.props.updateDmPhong} />
                <Link to='/user/danh-muc/phong' className='btn btn-secondary btn-circle' style={{ position: 'fixed', left: '10px', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                {permissionWrite && (
                    <React.Fragment>
                        <a href='/download/Room.xlsx' className='btn btn-success btn-circle' style={{ position: 'fixed', right: '70px', bottom: '10px' }}>
                            <i className='fa fa-download' />
                        </a>
                        <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.saveUpload}>
                            <i className='fa fa-lg fa-save' />
                        </button>
                    </React.Fragment>)}
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmPhong: state.dmPhong, dmToaNha: state.dmToaNha });
const mapActionsToProps = { getDmToaNhaAll, getDmPhongAll, getDmPhongPage, deleteDmPhong, createDmPhong, updateDmPhong, createDmPhongByUpload };
export default connect(mapStateToProps, mapActionsToProps)(adminUploadPage);