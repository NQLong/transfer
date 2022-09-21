import React from 'react';
import { connect } from 'react-redux';
import { getDvWebsite } from './redux';
import { getWebsiteGioiThieuAll, createWebsiteGioiThieu, updateWebsiteGioiThieu, deleteWebsiteGioiThieu, swapWebsiteGioiThieu } from './reduxWebsiteGioiThieu';
import { Link } from 'react-router-dom';
import Editor from 'view/component/CkEditor4';

class WebsiteGTlModal extends React.Component {
    modal = React.createRef();
    editor = React.createRef();
    viEditor = React.createRef();
    enEditor = React.createRef();
    componentDidMount() {
        $(this.modal.current).on('shown.bs.modal', () => $('#wgtWeight').focus());
    }
    show = () => {
        $('#wgtViTitle').focus();
        $('#wgtViTitle').val('');
        $('#wgtEnTitle').val('');
        this.viEditor.current.html('');
        $('#wgtWeight').val(null);
        this.enEditor.current.html('');
        $(this.modal.current).modal('show');
    }

    save = (event) => {
        event.preventDefault();
        const ten = {
            vi: $('#wgtViTitle').val().trim(),
            en: $('#wgtEnTitle').val().trim()
        },
            noiDung = {
                vi: this.viEditor.current.html(),
                en: this.enEditor.current.html()
            };
        const item = {
            maDonVi: this.props.maDonVi,
            ten: JSON.stringify(ten),
            thuTu: 1,
            noiDung: JSON.stringify(noiDung),
            trongSo: $('#wgtWeight').val()

        };
        if (ten.vi == '') {
            T.notify('Tên giới thiệu bị trống!', 'danger');
            $('#wgtViTitle').focus();
        } else if (ten.en == '') {
            T.notify('Referral name is blank!', 'danger');
            $('#wgtEnTitle').focus();
        } else if (noiDung.vi == '') {
            T.notify('Nội dung giới thiệu bị trống!', 'danger');
            $('#wgtViContent').focus();
        } else if (noiDung.en == '') {
            T.notify('The introductory content is blank!', 'danger');
            $('#wgtEnContent').focus();
        } else if (item.trongSo == null || (item.trongSo != 1 && item.trongSo != 2)) {
            T.notify('Trọng số không được để trống và phái có giá trị 1 hoặc 2!', 'danger');
            $('#crsWeight').focus();
        }
        else {
            this.props.createWebsiteGioiThieu(item);
            $(this.modal.current).modal('hide');
        }
    }

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Giới thiệu khoa </h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label className='control-label'>Trọng số</label>
                                <input className='form-control' type='number' placeholder='Trọng số (1 hoặc 2)' id='wgtWeight' style={{ textAlign: 'right' }} />
                            </div>
                            <ul className='nav nav-tabs'>
                                <li className='nav-item'>
                                    <a className='nav-link active show' data-toggle='tab' href='#videoViTab'>Việt Nam</a>
                                </li>
                                <li className='nav-item'>
                                    <a className='nav-link' data-toggle='tab' href='#videoEnTab'>English</a>
                                </li>
                            </ul>
                            <div className='tab-content'>
                                <div id='videoViTab' className='tab-pane fade show active'>
                                    <div className='form-group'>
                                        <label className='control-label'>Tên</label>
                                        <input className='form-control' type='text' placeholder='Tên' id='wgtViTitle' />
                                    </div>
                                    <div className='form-group'>
                                        <label htmlFor='wgtViContent'>Nội dung</label>
                                        <Editor ref={this.viEditor} placeholder='Nội dung' id='wgtViContent' /><br />
                                    </div>

                                </div>

                                <div id='videoEnTab' className='tab-pane fade'>
                                    <div className='form-group'>
                                        <label className='control-label'>Name</label>
                                        <input className='form-control' type='text' placeholder='Name' id='wgtEnTitle' />
                                    </div>

                                    <div className='form-group'>
                                        <label htmlFor='wgtEnContent'>Content</label>
                                        <Editor ref={this.enEditor} placeholder='Content' id='wgtEnContent' /><br />
                                    </div>

                                </div>
                            </div>

                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='submit' className='btn btn-primary' onClick={this.save}>Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class websiteGTPage extends React.Component {
    table = React.createRef();
    websiteGTModal = React.createRef();
    state = { gioithieu: [], maDonVi: '', shortname: '' };

    componentDidMount() {
        const route = T.routeMatcher('/user/website/edit/:shortname'),
            params = route.parse(window.location.pathname);
        this.props.getDvWebsite(params.shortname, data => {
            this.setState({ shortname: params.shortname, maDonVi: data.maDonVi });
            this.props.getWebsiteGioiThieuAll(data.maDonVi, items => {
                this.setState({ gioithieu: items });
            });
        });
    }

    create = (e) => {
        e.preventDefault();
        this.websiteGTModal.current.show();
    }

    changeItemActive = (item) => this.props.updateWebsiteGioiThieu(this.state.maDonVi, item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa tập hình ảnh', 'Bạn có chắc bạn muốn xóa tập hình ảnh này?', true, isConfirm => isConfirm && this.props.deleteWebsiteGioiThieu(this.state.maDonVi, item.ma));
    }

    swap = (e, ma, thuTu, isMoveUp) => {
        this.props.swapWebsiteGioiThieu(this.state.maDonVi, ma, thuTu, isMoveUp);
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('website:write');
        let table = 'Không có thông tin!';
        let currentGioiThieu = this.props.dvWebsiteGioiThieu && this.props.dvWebsiteGioiThieu.items ? this.props.dvWebsiteGioiThieu.items : [];
        if (currentGioiThieu && currentGioiThieu.length > 0) {
            table = (
                <table className='table table-hover table-bordered' ref={this.table}>
                    <thead >
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '100%', textAlign: 'left' }}>Tên</th>
                            {/* <th style={{ width: '60%', textAlign: 'center', whiteSpace: 'nowrap' }}>Nội dung</th> */}
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Trọng số</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody >
                        {currentGioiThieu.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td style={{ textAlign: 'left' }}>
                                    <Link to={`/user/website/edit/${this.state.shortname}/${item.ma}`} >{T.language.parse(item.ten)}</Link>
                                </td>
                                <td style={{ textAlign: 'center' }}>{item.trongSo}</td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.kichHoat} onChange={() => permissionWrite && this.changeItemActive(item)} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td>
                                    <div className='btn-group'>
                                        <a className='btn btn-success' href='#' onClick={e => this.swap(e, item.ma, item.thuTu, true)}>
                                            <i className='fa fa-lg fa-arrow-up' />
                                        </a>
                                        <a className='btn btn-success' href='#' onClick={e => this.swap(e, item.ma, item.thuTu, false)}>
                                            <i className='fa fa-lg fa-arrow-down' />
                                        </a>
                                        <Link className='btn btn-primary' to={`/user/website/edit/${this.state.shortname}/${item.ma}`} >
                                            <i className='fa fa-lg fa-edit' />
                                        </Link>
                                        {permissionWrite ?
                                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                                <i className='fa fa-lg fa-trash' />
                                            </a> : null}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        } else {
            table = <p>Không có giới thiệu!</p>;
        }

        return (
            <div className='tile'>
                <h3 className='tile-title'>Giới thiệu khoa</h3>
                <div className='tile-body'>{table}</div>
                <div className='tile-footer text-right'>
                    <button className='btn btn-primary' type='button' onClick={this.create}>
                        <i className='fa fa-lg fa-plus' />Thêm mới
                    </button>
                </div>
                <WebsiteGTlModal ref={this.websiteGTModal} createWebsiteGioiThieu={this.props.createWebsiteGioiThieu} maDonVi={this.state.maDonVi} />
            </div>);
    }
}

const mapStateToProps = state => ({ system: state.system, dvWebsiteGioiThieu: state.dvWebsiteGioiThieu });
const mapActionsToProps = { getDvWebsite, getWebsiteGioiThieuAll, updateWebsiteGioiThieu, deleteWebsiteGioiThieu, swapWebsiteGioiThieu, createWebsiteGioiThieu };
export default connect(mapStateToProps, mapActionsToProps)(websiteGTPage);
