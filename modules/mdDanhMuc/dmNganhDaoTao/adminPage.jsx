import React from 'react';
import { connect } from 'react-redux';
import { getDmNganhDaoTaoPage, createDmNganhDaoTao, deleteDmNganhDaoTao, updateDmNganhDaoTao } from './redux';
import { getDmDonViAll, getDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import AdminSearchBox from 'view/component/AdminSearchBox';
import Editor from 'view/component/CkEditor4';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    state = { kichHoat: true };
    modal = React.createRef();
    editorVi = React.createRef();
    editorEn = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => {
                $('a[href=\'#dmNganhDaoTaoTabVi\']').tab('show');
                $('#dmNganhDaoTaoNameVi').focus();
            });
            $('#dmNganhDaoTaoFaculty').select2({ minimumResultsForSearch: -1 });
        }, 250));
    }

    show = (item) => {
        let { ma, ten, moTa, maDonVi, kichHoat } = item ? item : { ma: null, ten: '', moTa: '', maDonVi: null, kichHoat: true };
        ten = T.language.parse(ten, true);
        moTa = T.language.parse(moTa, true);

        $('#dmNganhDaoTaoNameVi').val(ten.vi);
        $('#dmNganhDaoTaoNameEn').val(ten.en);
        this.editorVi.current.html(moTa.vi);
        this.editorEn.current.html(moTa.en);
        $('#dmNganhDaoTaoFaculty').val(maDonVi ? maDonVi : '');
        $('#dmNganhDaoTaoFaculty').select2({ minimumResultsForSearch: -1 }).trigger('change');
        this.setState({ kichHoat });

        $(this.modal.current).attr('data-id', ma).modal('show');
    };

    save = e => {
        e.preventDefault();
        const ma = $(this.modal.current).attr('data-id'),
            changes = {
                ten: { vi: $('#dmNganhDaoTaoNameVi').val().trim(), en: $('#dmNganhDaoTaoNameEn').val().trim() },
                moTa: { vi: this.editorVi.current.html(), en: this.editorEn.current.html() },
                maDonVi: $('#dmNganhDaoTaoFaculty').val(),
                kichHoat: this.state.kichHoat ? '1' : '0'
            };
        if (changes.ten.vi == '') {
            T.notify('Tên ngành đào tạo bị trống!', 'danger');
            $('a[href=\'#dmNganhDaoTaoTabVi\']').tab('show');
            $('#dmNganhDaoTaoNameVi').focus();
        } else if (changes.ten.en == '') {
            T.notify('Tên ngành đào tạo bị trống!', 'danger');
            $('a[href=\'#dmNganhDaoTaoTabEn\']').tab('show');
            $('#dmNganhDaoTaoNameEn').focus();
        } else if (changes.maDonVi == null) {
            T.notify('Đơn vị chưa được chọn!', 'danger');
        } else {
            changes.ten = JSON.stringify(changes.ten);
            changes.moTa = JSON.stringify(changes.moTa);
            if (ma) {
                this.props.updateDmNganhDaoTao(ma, changes);
            } else {
                this.props.createDmNganhDaoTao(changes);
            }
            $(this.modal.current).modal('hide');
        }
    }

    render() {
        const readOnly = this.props.readOnly;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Ngành đào tạo</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <ul className='nav nav-tabs'>
                                <li className='nav-item'>
                                    <a className='nav-link active show' data-toggle='tab' href='#dmNganhDaoTaoTabVi'>Việt Nam</a>
                                </li>
                                <li className='nav-item'>
                                    <a className='nav-link' data-toggle='tab' href='#dmNganhDaoTaoTabEn'>English</a>
                                </li>

                                <div style={{ position: 'absolute', top: '16px', right: '8px' }}>
                                    <div style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
                                        <label htmlFor='dmNganhDaoTaoActive'>Kích hoạt: </label>&nbsp;&nbsp;
                                        <div className='toggle'>
                                            <label>
                                                <input type='checkbox' id='dmNganhDaoTaoActive' checked={this.state.kichHoat} onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
                                                <span className='button-indecator' />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </ul>
                            <div className='tab-content' style={{ marginTop: 8 }}>
                                <div id='dmNganhDaoTaoTabVi' className='tab-pane fade show active'>
                                    <div className='form-group'>
                                        <label htmlFor='dmNganhDaoTaoNameVi'>Tên Ngành đào tạo</label>
                                        <input className='form-control' id='dmNganhDaoTaoNameVi' type='text' placeholder='Tên Ngành đào tạo' readOnly={readOnly} />
                                    </div>
                                    <div className='form-group'>
                                        <label>Mô tả</label>
                                        <Editor ref={this.editorVi} placeholder='Mô tả' readOnly={readOnly} />
                                    </div>
                                </div>

                                <div id='dmNganhDaoTaoTabEn' className='tab-pane fade'>
                                    <div className='form-group'>
                                        <label htmlFor='dmNganhDaoTaoNameEn'>Name</label>
                                        <input className='form-control' id='dmNganhDaoTaoNameEn' type='text' placeholder='Name' readOnly={readOnly} />
                                    </div>
                                    <div className='form-group'>
                                        <label>Description</label>
                                        <Editor ref={this.editorEn} placeholder='Description' readOnly={readOnly} />
                                    </div>
                                </div>
                            </div>
                            <div className='form-group'>
                                <label className='control-label' htmlFor='dmNganhDaoTaoFaculty'>Đơn vị</label>
                                <select className='form-control' id='dmNganhDaoTaoFaculty'>{this.props.optionsDonVi}</select>
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

class DmNganhDaoTaoPage extends React.Component {
    state = { searching: false };
    searchBox = React.createRef();
    modal = React.createRef();
    mapperDonVi = [];
    optionsDonVi = [];

    componentDidMount() {
        this.props.getDmDonViAll(items => {
            if (items) {
                const mapper = {};
                items.forEach(item => {
                    mapper[item.ma] = item.ten;
                    if (item.kichHoat == 1 && item.maPl == '01') this.optionsDonVi.push(<option key={item.ma} value={item.ma}>{item.ten}</option>);
                });
                this.mapperDonVi = mapper;
            }
        });
        T.ready('/user/category', () => this.searchBox.current.getPage());
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    changeActive = item => this.props.updateDmNganhDaoTao(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa ngành đào tạo', 'Bạn có chắc bạn muốn xóa ngành đào tạo này?', true, isConfirm =>
            isConfirm && this.props.deleteDmNganhDaoTao(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmNganhDaoTao:write'),
            permissionDelete = currentPermissions.includes('dmNganhDaoTao:delete');
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.dmNganhDaoTao && this.props.dmNganhDaoTao.page ?
            this.props.dmNganhDaoTao.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        let table = 'Không có ngành đào tạo!';
        if (list && list.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <td style={{ width: '50%' }}>Ngành đào tạo</td>
                            <td style={{ width: '50%' }}>Đơn vị</td>
                            <td style={{ width: 'auto' }} nowrap='true'>Kích hoạt</td>
                            <td style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</td>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((item, index) => (
                            <tr key={item.ma}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td><a href='#' onClick={e => this.edit(e, item)}>{T.language.parse(item.ten, true).vi}</a></td>
                                <td>{this.mapperDonVi[item.maDonVi] ? this.mapperDonVi[item.maDonVi] : ''}</td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.kichHoat} onChange={e => permissionWrite && this.changeActive(item)} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <div className='btn-group'>
                                        <a className='btn btn-primary' href='#' onClick={e => this.edit(e, item)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        {permissionDelete &&
                                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                                <i className='fa fa-trash-o fa-lg' />
                                            </a>}
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
                    <h1><i className='fa fa-list-alt' /> Danh mục Ngành đào tạo</h1>
                    <AdminSearchBox ref={this.searchBox} getPage={this.props.getDmNganhDaoTaoPage} setSearching={value => this.setState({ searching: value })} />
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Ngành đào tạo
                    </ul>
                </div>
                <div className='tile'>
                    {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
                    <EditModal ref={this.modal} readOnly={!permissionWrite} optionsDonVi={this.optionsDonVi} createDmNganhDaoTao={this.props.createDmNganhDaoTao} updateDmNganhDaoTao={this.props.updateDmNganhDaoTao} />
                    <Pagination name='pageDmNganhDaoTao' style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                        getPage={this.searchBox.current && this.searchBox.current.getPage} />
                    {permissionWrite &&
                        <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                            <i className='fa fa-lg fa-plus' />
                        </button>}
                    <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                        <i className='fa fa-lg fa-reply' />
                    </Link>
                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmNganhDaoTao: state.dmNganhDaoTao, dmDonVi: state.dmDonVi });
const mapActionsToProps = { getDmNganhDaoTaoPage, getDmDonViAll, getDmDonVi, createDmNganhDaoTao, deleteDmNganhDaoTao, updateDmNganhDaoTao };
export default connect(mapStateToProps, mapActionsToProps)(DmNganhDaoTaoPage);