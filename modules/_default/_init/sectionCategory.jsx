import React from 'react';
import { connect } from 'react-redux';
import { getAll, createCategory, swapCategory, updateCategory, deleteCategory } from './reduxCategory';
import { getDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import ImageBox from 'view/component/ImageBox';

class CategoryModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = { readOnly: false };

        this.modal = React.createRef();
        this.imageBox = React.createRef();
        this.btnSave = React.createRef();
    }

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#catViName').focus());
            const user = this.props.system && this.props.system.user;
            if (user && user.maDonVi) {
                this.props.getDmDonVi(user.maDonVi, data => {
                    if (data.ma) {
                        $('#maDonVi').val(data.ten);
                        this.setState({ donVi: data });
                    }
                });
            }
        }, 250));
    }

    show = (item, categoryType, readOnly) => {
        let { id, title, image } = item ? item : { id: null, title: '', image: '/img/avatar.png' };
        title = T.language.parse(title, true);
        $('#catViName').val(title.vi);
        $('#catEnName').val(title.en);
        $(this.btnSave.current).data('id', id).data('categoryType', categoryType);

        this.setState({ image, readOnly: readOnly ? true : false });
        this.imageBox.current.setData(this.props.uploadType + ':' + (id ? id : 'new'), image);

        $(this.modal.current).modal('show');
    }

    save = () => {
        const btnSave = $(this.btnSave.current),
            id = btnSave.data('id'),
            changes = {
                title: JSON.stringify({ vi: $('#catViName').val().trim(), en: $('#catEnName').val().trim() }),
                image: this.imageBox.current.getImage()
            };

        if (id) { // Update
            this.props.updateCategory(id, changes, () => $(this.modal.current).modal('hide'));
        } else { // Create
            changes.type = btnSave.data('categoryType');
            changes.active = 0;
            changes.maDonVi = this.props.system && this.props.system.user
                && this.props.system.user && this.props.system.user.maDonVi ? this.props.system.user.maDonVi : -1;
            if (changes.maDonVi == -1) {
                T.alert('Tài khoản chưa được gán đơn vị!', 'error', false, 800);
                return;
            }
            this.props.createCategory(changes, () => $(this.modal.current).modal('hide'));
        }
    }

    render() {
        const readOnly = this.state.readOnly;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog' role='document' onSubmit={e => { this.save(); e.preventDefault(); }}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Danh mục</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='catViName'>Tên danh mục</label>
                                <input className='form-control' id='catViName' type='text' placeholder='Tên danh mục' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='catEnName'>Category name</label>
                                <input className='form-control' id='catEnName' type='text' placeholder='Category name' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='catEnName'>Thuộc đơn vị</label>
                                <input className='form-control' id='maDonVi' type='text' placeholder='Thuộc đơn vị' readOnly={true} />
                            </div>
                            <div className='form-group'>
                                <label>Hình đại diện</label>
                                <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='CategoryImage' readOnly={readOnly} />
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='submit' className='btn btn-success' ref={this.btnSave}>Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class Category extends React.Component {
    modal = React.createRef();
    state = { donVi: '' }

    componentDidMount() {
        this.props.getAll(this.props.type);
    }

    edit = (e, item, permissionWrite) => {
        this.modal.current.show(item, this.props.type, !permissionWrite);
        e.preventDefault();
    }

    swap = (e, item, isMoveUp) => {
        this.props.swapCategory(item.id, isMoveUp, this.props.type);
        e.preventDefault();
    }

    changeActive = (item) => {
        this.props.updateCategory(item.id, { active: item.active ? 0 : 1 });
    }

    delete = (e, item) => {
        T.confirm('Xóa danh mục', 'Bạn có chắc bạn muốn xóa danh mục này?', true, isConfirm =>
            isConfirm && this.props.deleteCategory(item.id)
        );
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.contains('category:write');
        let table = null;
        if (this.props.category && this.props.category.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '80%' }}>Tên</th>
                            <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Hình ảnh</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.category.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td>
                                    <a href='#' onClick={e => this.edit(e, item, permissionWrite)}>{T.language.parse(item.title, true).vi}</a>
                                </td>
                                <td style={{ width: '20%', textAlign: 'center' }}>
                                    <img src={item.image ? item.image : '/img/avatar.png'} alt='avatar' style={{ height: '32px' }} />
                                </td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.active} onChange={() => permissionWrite && this.changeActive(item, index)} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td>
                                    <div className='btn-group'>
                                        {/* {permissionWrite && [
                                            <a key={0} className='btn btn-success' href='#' onClick={e => this.swap(e, item, true)}>
                                                <i className='fa fa-lg fa-arrow-up' />
                                            </a>,
                                            <a key={1} className='btn btn-success' href='#' onClick={e => this.swap(e, item, false)}>
                                                <i className='fa fa-lg fa-arrow-down' />
                                            </a>]} */}
                                        <a className='btn btn-primary' href='#' onClick={e => this.edit(e, item, permissionWrite)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
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
            table = <p>Không có danh mục!</p>;
        }

        return (
            <div>
                <div className='tile'>{table}</div>
                {permissionWrite ?
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={e => this.edit(e, null, permissionWrite)}>
                        <i className='fa fa-lg fa-plus' />
                    </button> : ''}
                <CategoryModal ref={this.modal} createCategory={this.props.createCategory}
                    donVi={this.props.donVi} system={this.props.system}
                    getDmDonVi={this.props.getDmDonVi}
                    updateCategory={this.props.updateCategory} uploadType={this.props.uploadType} />
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, category: state.category });
const mapActionsToProps = { getAll, createCategory, swapCategory, updateCategory, deleteCategory, getDmDonVi };
export default connect(mapStateToProps, mapActionsToProps)(Category);