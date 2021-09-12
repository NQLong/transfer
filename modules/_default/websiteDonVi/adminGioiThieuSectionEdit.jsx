import React from 'react';
import { connect } from 'react-redux';
import { getDmDonViAll } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getWebsiteGioiThieu, updateWebsiteGioiThieu, getWebsiteGioiThieuHinh, updateWebsiteGioiThieuHinh, createWebsiteGioiThieuHinh, deleteWebsiteGioiThieuHinh, swapWebsiteGioiThieuHinh } from './reduxWebsiteGioiThieu';
import { Link } from 'react-router-dom';
import ImageBox from 'view/component/ImageBox';
import Editor from 'view/component/CkEditor4';

class WebsiteGioiThieuItemModal extends React.Component {
    state = { image: '', ma: '' };
    modal = React.createRef();
    imageBox = React.createRef();
    btnSave = React.createRef();

    componentDidMount() {
        $(this.modal.current).on('shown.bs.modal', () => $('#imageLink').focus());
    }

    show = (item, maWebsite) => {
        let { ma, image, link, } = item ? item : { ma: null, maWebsiteGioiThieu: null, image: '/img/upload.png', link: '', thuTu: null };
        $(this.btnSave.current).data('ma', ma).data('maWebsiteGioiThieu', maWebsite);
        $('#imageLink').data('link', link).val(link);
        this.setState({ image: image ? image : '', ma: ma });
        this.imageBox.current.setData('DvWebsiteGioiThieu: ' + (ma ? `${ma}` : 'new'));
        $(this.modal.current).modal('show');
    }

    save = (e) => {
        e.preventDefault();
        const ma = $(e.target).data('ma'),
            maWebsiteGioiThieu = $(e.target).data('maWebsiteGioiThieu'),
            changes = {
                link: $('#imageLink').val().trim(),
            };

        if (ma) {
            changes.image = this.imageBox.current.getImage();
            this.props.updateWebsiteGioiThieuHinh(maWebsiteGioiThieu, this.state.ma, changes, error => {
                if (error == undefined || error == null) {
                    $(this.modal.current).modal('hide');
                }
            });

        } else {
            changes.maWebsiteGioiThieu = maWebsiteGioiThieu;
            changes.image = this.imageBox.current.getImage() ? this.imageBox.current.getImage() : '/img/avatar.jpg';
            this.props.createWebsiteGioiThieuHinh(changes, () => $(this.modal.current).modal('hide'));
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
                                <label htmlFor='imageLink'>Link liên kết</label>
                                <input className='form-control' id='imageLink' type='text' placeholder='Link liên kết' />
                            </div>
                            <div className='form-group'>
                                <label>Hình đại diện</label>
                                <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='DvWebsiteGioiThieuImage' userData='DvWebsiteGioiThieu' image={this.state.image} success={this.imageChanged} />
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal' >Đóng</button>
                            <button type='button' className='btn btn-primary' ref={this.btnSave} onClick={this.save}>Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class WebsiteGioiThieuEditPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { donViOptions: [], donViSelected: [] };
        this.selectDonVi = React.createRef();
        this.table = React.createRef();
        this.modal = React.createRef();
        this.editor = { vi: React.createRef(), en: React.createRef() };
    }

    componentDidMount() {
        this.props.getDmDonViAll(data => this.setState({ donViOptions: data.map(item => ({ value: item.ma, label: item.ten })) }));
        T.ready('/user/website', () => {
            $('#dvGioiThieuTrongSo').focus();
            const route = T.routeMatcher('/user/website/edit/:shortname/:ma'),
                params = route.parse(window.location.pathname);
            this.setState({ shortname: params.shortname });
            this.props.getWebsiteGioiThieu(params.ma, data => {
                const ten = T.language.parse(data.ten, true),
                    noiDung = T.language.parse(data.noiDung, true);
                $('#dvGioiThieuTenVi').val(ten.vi);
                $('#dvGioiThieuTenEn').val(ten.en);
                $('#dvGioiThieuTrongSo').val(data.trongSo).focus;
                this.editor.vi.current.html(noiDung.vi);
                this.editor.en.current.html(noiDung.en);
                this.setState({ donViSelected: data.maDonVi });
                this.setState({ ma: data.ma });
            });
        });
    }

    save = () => {
        const ten = {
            vi: $('#dvGioiThieuTenVi').val().trim(),
            en: $('#dvGioiThieuTenEn').val().trim(),
        },
            noiDung = {
                vi: this.editor.vi.current.html(),
                en: this.editor.en.current.html(),
            };
        const changes = {
            ten: JSON.stringify(ten),
            trongSo: parseInt($('#dvGioiThieuTrongSo').val()),
            noiDung: JSON.stringify(noiDung),
        };

        if (ten.vi == '') {
            T.notify('Tên giới thiệu bị trống!', 'danger');
            $('#dvGioiThieuTenVi').focus();
        } else if (ten.en == '') {
            T.notify('Name is blank!', 'danger');
            $('#dvGioiThieuTenEn').focus();
        } else if (noiDung.vi == '') {
            T.notify('Nội dung giới thiệu bị trống!', 'danger');
        } else if (noiDung.en == '') {
            T.notify('The introductory content is blank!', 'danger');
        } else if (changes.trongSo == null || (changes.trongSo != 1 && changes.trongSo != 2)) {
            T.notify('Trọng số không được để trống và phái có giá trị 1 hoặc 2!', 'danger');
        } else {
            this.props.updateWebsiteGioiThieu(this.state.maDonVi, this.state.ma, changes);
        }
    }

    createItem = (e) => {
        let item = { maWebsiteGioiThieu: this.state.ma, image: '/img/avatar.png', kichHoat: 0, link: '' };
        this.props.createWebsiteGioiThieuHinh(item, data => {
            e.preventDefault();
            this.modal.current.show(data.item, this.state.ma);
        });

    }

    editItem = (e, item) => {
        this.modal.current.show(item, this.state.ma);
        e.preventDefault();
    }

    changeItemActive = (item) => this.props.updateWebsiteGioiThieuHinh(item.maWebsiteGioiThieu, item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 });

    deleteItem = (e, item) => {
        T.confirm('Xóa hình ảnh', 'Bạn có chắc bạn muốn xóa hình ảnh này?', true, isConfirm => isConfirm && this.props.deleteWebsiteGioiThieuHinh(item));
        e.preventDefault();
    }

    swap = (e, maWebsiteGioiThieu, ma, thuTu, isMoveUp) => {
        this.props.swapWebsiteGioiThieuHinh(maWebsiteGioiThieu, ma, thuTu, isMoveUp);
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('website:write');
        let items = this.props.dvWebsiteGioiThieu && this.props.dvWebsiteGioiThieu.selectedItem && this.props.dvWebsiteGioiThieu.selectedItem.hinhAnh ? this.props.dvWebsiteGioiThieu.selectedItem.hinhAnh : [],
            table = 'Không có hình ảnh!';
        if (items.length > 0) {
            table = (
                <table className='table table-hover table-bordered' ref={this.table}>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto' }}>#</th>
                            <th style={{ width: '60%', textAlign: 'center' }}>Link</th>
                            <th style={{ width: '30%', textAlign: 'center' }} nowrap='true'>Hình ảnh</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Kích hoạt</th>
                            {permissionWrite ? <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th> : null}
                        </tr>
                    </thead>
                    <tbody id='mainListCarousel'>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td style={{ width: 'auto', textAlign: 'center' }}>{item.link}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <img src={T.url(item.image ? item.image : '')} alt='avatar' style={{ height: '32px' }} />
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
                                            <a className='btn btn-success' href='#' onClick={e => this.swap(e, this.state.ma, item.ma, item.thuTu, true)}>
                                                <i className='fa fa-lg fa-arrow-up' />
                                            </a>
                                            <a className='btn btn-success' href='#' onClick={e => this.swap(e, this.state.ma, item.ma, item.thuTu, false)}>
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
            <main className='app-content'>
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-image' /> Website đơn vị: Chỉnh sửa mục giới thiệu</h1>
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>&nbsp;/&nbsp;
                        <Link to='/user/settings'>Cấu hình</Link>&nbsp;/&nbsp;
                        <Link to='/user/website'>Website</Link>&nbsp;/&nbsp;
                        <Link to={'/user/website/edit/' + this.state.shortname}>Website: chỉnh sửa</Link>&nbsp;/&nbsp;
                        Website đơn vị: Chỉnh sửa mục giới thiệu
                    </ul>
                </div>

                <div className='tile col-md-12'>
                    <h3 className='tile-title'>Thông tin chung</h3>
                    <div className='tile-body'>
                        <div className='row'>
                            <div className='form-group col-md-12'>
                                <label htmlFor='dvGioiThieuTrongSo'>Trọng số</label>
                                <input type='number' className='form-control' id='dvGioiThieuTrongSo' placeholder='Trọng số (1 hoặc 2)' />
                            </div>
                        </div>
                        <ul className='nav nav-tabs col-md-12'>
                            <li className='nav-item'>
                                <a className='nav-link active show' data-toggle='tab' href='#introViTab'>Việt Nam</a>
                            </li>
                            <li className='nav-item'>
                                <a className='nav-link' data-toggle='tab' href='#introEnTab'>English</a>
                            </li>
                        </ul>
                        <div className='tab-content'>
                            {/* <div className='form-group col-md-8'>
                                    <label htmlFor='dvGioiThieuDonVi'>Đơn vị</label>
                                    <Select ref={this.selectDonVi} id='dvGioiThieuDonVi' placeholder='Chọn đơn vị'
                                        onChange={item => this.setState({ donViSelected: item.value })} options={this.state.donViOptions}
                                        value={this.state.donViOptions.filter(({ value }) => value == this.state.donViSelected)} />
                                </div> */}

                            <div id='introViTab' className='tab-pane fade show active'>

                                <div className='form-group col-md-12'>
                                    <label htmlFor='dvGioiThieuTenVi'>Tên </label>
                                    <input type='text' className='form-control' id='dvGioiThieuTenVi' placeholder='Tên ' />
                                </div>
                                <div className='form-group col-md-12'>
                                    <label htmlFor='dvGioiThieuNoiDungVi'>Nội dung</label>
                                    <Editor ref={this.editor.vi} placeholder='Nội dung' id='dvGioiThieuNoiDungVi' /><br />
                                </div>

                            </div>

                            <div id='introEnTab' className='tab-pane fade'>
                                <div className='form-group col-md-12'>
                                    <label htmlFor='dvGioiThieuTenEn'>Name </label>
                                    <input type='text' className='form-control' id='dvGioiThieuTenEn' placeholder='Name' />
                                </div>
                                <div className='form-group col-md-12'>
                                    <label htmlFor='dvGioiThieuNoiDungEn'>Content</label>
                                    <Editor ref={this.editor.en} placeholder='Content' id='dvGioiThieuNoiDungEn' /><br />
                                </div>
                            </div>


                        </div>
                    </div>
                    {permissionWrite ?
                        <div className='tile-footer text-right'>
                            <button className='btn btn-success' type='button' onClick={this.save}>
                                <i className='fa fa-fw fa-lg fa-save' />Lưu
                            </button>
                        </div> : null}
                </div>
                <div className='tile col-md-12'>
                    <div className='tile'>
                        <h3 className='tile-title'>Danh sách hình ảnh</h3>
                        <div className='tile-body'>
                            {table}
                        </div>
                        <div className='tile-footer'>
                            <div className='row'>
                                <div className='col-md-12' style={{ textAlign: 'right' }}>
                                    <button className='btn btn-primary' type='button' onClick={this.createItem}>
                                        <i className='fa fa-fw fa-lg fa-plus' />Thêm hình ảnh
                                        </button>&nbsp;
                                    </div>
                            </div>
                        </div>
                    </div>

                </div>
                <Link to={'/user/website/edit/' + this.state.shortname} className='btn btn-secondary btn-circle' style={{ position: 'fixed', lefft: '10px', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                <WebsiteGioiThieuItemModal ref={this.modal} createWebsiteGioiThieuHinh={this.props.createWebsiteGioiThieuHinh} updateWebsiteGioiThieuHinh={this.props.updateWebsiteGioiThieuHinh} />
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dvWebsiteGioiThieu: state.dvWebsiteGioiThieu });
const mapActionsToProps = { getWebsiteGioiThieu, updateWebsiteGioiThieu, getDmDonViAll, getWebsiteGioiThieuHinh, updateWebsiteGioiThieuHinh, createWebsiteGioiThieuHinh, deleteWebsiteGioiThieuHinh, swapWebsiteGioiThieuHinh };
export default connect(mapStateToProps, mapActionsToProps)(WebsiteGioiThieuEditPage);
