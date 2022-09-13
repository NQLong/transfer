import React from 'react';
import { connect } from 'react-redux';
import { getWebsiteHinhAll, createWebsiteHinh, updateWebsiteHinh, deleteWebsiteHinh, swapWebsiteHinh } from './reduxWebsiteHinh';
import { getDvWebsite } from './redux';
import ImageBox from 'view/component/ImageBox';

class WebsitHinhItemModal extends React.Component {
    state = { image: '', ma: '', maDonVi: '' };
    modal = React.createRef();
    imageBox = React.createRef();

    componentDidMount() {
        $(this.modal.current).on('shown.bs.modal', () => $('#imageTitleVi').focus());
    }

    show = (item, maDv) => {
        let { ma, maDonVi, image, link, } = item ? item : { ma: null, maDonVi: null, image: '/img/avatar.png', link: '', thuTu: null, kichHoat: 0 };
        let tieuDe = item && item.tieuDe ? T.language.parse(item.tieuDe, true) : JSON.stringify({ vi: '', en: '' });
        $('#imageTitleVi').val(tieuDe.vi);
        $('#imageTitleEn').val(tieuDe.en);
        $('#imageLink').data('link', link).val(link);
        this.setState({ image: image ? image : '', ma: ma, maDonVi: maDonVi });
        this.imageBox.current.setData('DvWebsiteHinh: ' + (ma ? `${ma}` : 'new'));
        $(this.modal.current).data('maDv', maDv).data('maDonVi', maDonVi).modal('show');
    }

    save = (e) => {
        e.preventDefault();
        const modal = $(this.modal.current),
            maDv = modal.data('maDv'),
            maDonVi = modal.data('maDonVi'),
            changes = {
                tieuDe: JSON.stringify({ vi: $('#imageTitleVi').val(), en: $('#imageTitleEn').val() }),
                link: $('#imageLink').val().trim(),
            };

        if (maDonVi) {
            changes.image = this.state.image;
            this.props.updateWebsiteHinh(maDonVi, this.state.ma, changes, error => {

                if (error == undefined || error == null) {
                    $(this.modal.current).modal('hide');
                }
            });

        } else {
            changes.maDonVi = maDv;
            changes.image = this.imageBox.current.getImage() ? this.imageBox.current.getImage() : '/img/avatar.jpg';
            this.props.createWebsiteHinh(changes, () => $(this.modal.current).modal('hide'));
        }

    };

    imageChanged = (data) => {
        this.setState({ image: data.image });
    };

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Hình ảnh</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='imageTitleVi'>Tiêu đề (VI)</label>
                                <input className='form-control' id='imageTitleVi' type='text' placeholder='Tiêu đề' />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='imageTitleEn'>Title (EN)</label>
                                <input className='form-control' id='imageTitleEn' type='text' placeholder='Tiêu đề' />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='imageLink'>Link liên kết</label>
                                <input className='form-control' id='imageLink' type='text' placeholder='Link liên kết' />
                            </div>
                            <div className='form-group'>
                                <label>Hình đại diện</label>
                                <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='DvWebsiteGioiThieuImage' userData='DvWebsiteGioiThieu' image={this.state.image} success={this.imageChanged} />
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='button' className='btn btn-primary' onClick={this.save}>Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class AdminHinhSection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.table = React.createRef();
        this.modal = React.createRef();
    }

    componentDidMount() {
        T.ready('/user/website', () => {
            const route = T.routeMatcher('/user/website/edit/:shortname'),
                params = route.parse(window.location.pathname);
            this.setState({ shortname: params.shortname });
            this.props.getDvWebsite(params.shortname, data => {
                this.setState({ maDonVi: data.maDonVi });
                this.props.getWebsiteHinhAll(data.maDonVi);
            });
        });
    }

    createItem = (e) => {
        let item = { maDonVi: this.state.maDonVi, tieuDe: 'Tiêu đề', kichHoat: 0, link: '', image: '/img/avatar.png' };
        this.props.createWebsiteHinh(item, data => {
            this.modal.current.show(data.item, this.state.maDonVi);
            e.preventDefault();
        });

    }

    editItem = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);

    }

    changeItemActive = (item) => this.props.updateWebsiteHinh(this.state.maDonVi, item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 });

    deleteItem = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa hình ảnh', 'Bạn có chắc bạn muốn xóa hình ảnh này?', true, isConfirm => isConfirm && this.props.deleteWebsiteHinh(item));
    }

    swap = (e, maDonVi, ma, thuTu, isMoveUp) => {
        this.props.swapWebsiteHinh(maDonVi, ma, thuTu, isMoveUp);
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('website:write');

        let items = this.props.dvWebsiteHinh && this.props.dvWebsiteHinh.items ? this.props.dvWebsiteHinh.items : [],
            table = null;

        if (items.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto' }}>#</th>
                            <th style={{ width: '30%' }}>Tiêu đề</th>
                            <th style={{ width: '40%', textAlign: 'center' }}>Link</th>
                            <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Hình ảnh</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                            {permissionWrite ? <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th> : null}
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{T.language.parse(item.tieuDe, true).vi}</td>
                                <td>{item.link}</td>
                                <td style={{ textAlign: 'center' }}>
                                    {item.image ? <img src={T.url(item.image)} alt='avatar' style={{ height: '32px' }} /> : null}
                                </td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.kichHoat} onChange={() => permissionWrite && this.changeItemActive(item)} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                {permissionWrite ?
                                    <td>
                                        <div className='btn-group'>
                                            <a className='btn btn-success' href='#' onClick={e => this.swap(e, this.state.maDonVi, item.ma, item.thuTu, true)}>
                                                <i className='fa fa-lg fa-arrow-up' />
                                            </a>
                                            <a className='btn btn-success' href='#' onClick={e => this.swap(e, this.state.maDonVi, item.ma, item.thuTu, false)}>
                                                <i className='fa fa-lg fa-arrow-down' />
                                            </a>
                                            <a className='btn btn-primary' href='#' onClick={e => this.editItem(e, item)}>
                                                <i className='fa fa-lg fa-edit' />
                                            </a>
                                            <a className='btn btn-danger' href='#' onClick={e => this.deleteItem(e, item)}>
                                                <i className='fa fa-lg fa-trash' />
                                            </a>
                                        </div>
                                    </td> : null}
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }
        return (
            <div className='tile'>
                <h3 className='tile-title'>Danh sách hình ảnh</h3>
                <div className='tile-body'>{table}</div>
                <div className='tile-footer'>
                    <div className='row'>
                        <div className='col-md-12' style={{ textAlign: 'right' }}>
                            <button className='btn btn-primary' type='button' onClick={this.createItem}>
                                <i className='fa fa-fw fa-lg fa-plus' />Thêm mới
                            </button>&nbsp;
                        </div>
                    </div>
                </div>
                <WebsitHinhItemModal ref={this.modal} createWebsiteHinh={this.props.createWebsiteHinh} updateWebsiteHinh={this.props.updateWebsiteHinh} />
            </div>

        );

    }
}

const mapStateToProps = state => ({ system: state.system, dvWebsiteHinh: state.dvWebsiteHinh });
const mapActionsToProps = { getWebsiteHinhAll, createWebsiteHinh, updateWebsiteHinh, deleteWebsiteHinh, swapWebsiteHinh, getDvWebsite };
export default connect(mapStateToProps, mapActionsToProps)(AdminHinhSection);