import React from 'react';
import { connect } from 'react-redux';
import { getCarousel, updateCarousel, createCarouselItem, updateCarouselItem, deleteCarouselItem, moveCarouselItem, swapCarouselItem } from './redux/reduxCarousel';
import { Link } from 'react-router-dom';
import ImageBox from 'view/component/ImageBox';

class CarouselItemModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.modal = React.createRef();
        this.imageBox = React.createRef();
        this.btnSave = React.createRef();
    }

    componentDidMount() {
        $(this.modal.current).on('shown.bs.modal', () => $('#carViName').focus());
    }

    show = (item, id) => {
        let { carouselId, title, description, image, link, priority } = item ? item : { carouselId: null, title: '', description: '', image: '/img/avatar.png', link: '', priority: null };
        title = T.language.parse(title, true);
        description = T.language.parse(description, true);
        $(this.btnSave.current).data('id', id).data('carouselId', carouselId);
        $('#carViName').data('title', title.vi).val(title.vi);
        $('#carEnName').data('title', title.en).val(title.en);
        $('#carLink').data('link', link).val(link);
        $('#carViDes').data('description', description.vi).val(description.vi);
        $('#carEnDes').data('description', description.en).val(description.en);
        this.setState({ image, priority });
        this.imageBox.current.setData('CarouselItem: ' + (carouselId ? `${carouselId} ${priority}` : 'new'), image);
        $(this.modal.current).modal('show');
    }

    save = (e) => {
        e.preventDefault();
        const id = $(e.target).data('id'),
            carouselId = $(e.target).data('carouselId'),
            changes = {
                title: JSON.stringify({ vi: $('#carViName').val().trim(), en: $('#carEnName').val().trim() }),
                link: $('#carLink').val().trim(),
                description: JSON.stringify({ vi: $('#carViDes').val().trim(), en: $('#carEnDes').val().trim() }),
                priority: this.state.priority
            };
        if (changes.title.vi == '') {
            T.notify('Tên hình ảnh bị trống!', 'danger');
            $('#carViName').focus();
        } else if (changes.title.en == '') {
            T.notify('Tên hình ảnh bị trống!', 'danger');
            $('#carEnName').focus();
        } else {
            if (carouselId) {
                this.props.updateCarouselItem(carouselId, changes.priority, changes, error => {
                    if (error == undefined || error == null) {
                        $(this.modal.current).modal('hide');
                    }
                });
            } else {
                changes.carouselId = id;
                changes.image = this.state.image;
                this.props.createCarouselItem(changes, () => $(this.modal.current).modal('hide'));
            }
        }
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
                            <ul className='nav nav-tabs'>
                                <li className='nav-item'>
                                    <a className='nav-link active show' data-toggle='tab' href='#carouselViTab'>Việt Nam</a>
                                </li>
                                <li className='nav-item'>
                                    <a className='nav-link' data-toggle='tab' href='#carouselEnTab'>English</a>
                                </li>
                            </ul>
                            <div className='tab-content'>
                                <div id='carouselViTab' className='tab-pane fade show active'>
                                    <div className='form-group'>
                                        <label htmlFor='carViName'>Tên hình ảnh</label>
                                        <input className='form-control' id='carViName' type='text' placeholder='Tên hình ảnh' />
                                    </div>
                                    <div className='form-group'>
                                        <label htmlFor='carViDes'>Mô tả hình ảnh</label>
                                        <textarea className='form-control' id='carViDes' rows='5' placeholder='Mô tả hình ảnh' />
                                    </div>
                                </div>
                                <div id='carouselEnTab' className='tab-pane fade'>
                                    <div className='form-group'>
                                        <label htmlFor='carEnName'>Image name</label>
                                        <input className='form-control' id='carEnName' type='text' placeholder='Image name' />
                                    </div>
                                    <div className='form-group'>
                                        <label htmlFor='carEnDes'>Image description</label>
                                        <textarea className='form-control' id='carEnDes' rows='5' placeholder='Image description' />
                                    </div>
                                </div>
                            </div>

                            <div className='form-group'>
                                <label htmlFor='carLink'>Link liên kết</label>
                                <input className='form-control' id='carLink' type='text' placeholder='Link liên kết' />
                            </div>
                            <div className='form-group'>
                                <label>Hình đại diện</label>
                                <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='CarouselItemImage' userData='CarouselItem' success={({ image }) => this.setState({ image })} />
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='button' className='btn btn-success' ref={this.btnSave} onClick={this.save}>Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class CarouselEditPage extends React.Component {
    state = {};
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/component', () => {
            $('#crsTitle').focus();
            const route = T.routeMatcher('/user/carousel/edit/:carouselId'),
                params = route.parse(window.location.pathname);
            this.props.getCarousel(params.carouselId, data => {
                $('#crsTitle').val(data.title).focus();
                $('#crsHeight').val(data.height);
                this.setState(data);
            });

            $('#mainListCarousel').sortable({
                start: (e, ui) => {
                    $(this).attr('data-prevIndex', ui.item.index());
                },
                update: (e, ui) => {
                    e.preventDefault();
                    const newPriority = this.props.carousel.selectedItem.items[ui.item.index()].priority;
                    const currentItems = this.props.carousel.selectedItem.items[$(this).attr('data-prevIndex')];
                    const oldPriority = currentItems.priority;
                    const carouselId = currentItems.carouselId;
                    this.props.moveCarouselItem(carouselId, oldPriority, newPriority);
                }
            });
            $('#mainListCarousel').disableSelection();
        });
    }

    save = () => {
        const changes = {
            title: $('#crsTitle').val(),
            height: parseInt($('#crsHeight').val()),
            single: this.state.single == 1 ? 1 : 0,
            active: this.state.active == 1 ? 1 : 0
        };
        this.props.updateCarousel(this.state.id, changes);
    }

    createItem = (e) => {
        this.modal.current.show(null, this.state.id);
        e.preventDefault();
    }

    editItem = (e, item) => {
        this.modal.current.show(item);
        e.preventDefault();
    }

    changeItemActive = (item) => this.props.updateCarouselItem(item.carouselId, item.priority, { active: item.active == 1 ? 0 : 1 });

    deleteItem = (e, item) => {
        T.confirm('Xóa hình ảnh', 'Bạn có chắc bạn muốn xóa hình ảnh này?', true, isConfirm =>
            isConfirm && this.props.deleteCarouselItem(item.carouselId, item.priority));
        e.preventDefault();
    }

    swap = (e, item, isMoveUp) => {
        this.props.swapCarouselItem(this.state.id, item.priority, isMoveUp);
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('component:write') || currentPermissions.includes('website:write');
        let items = this.props.carousel && this.props.carousel.selectedItem && this.props.carousel.selectedItem.items ? this.props.carousel.selectedItem.items : [],
            table = null;

        if (items.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: '80%' }}>Tiêu đề</th>
                            <th style={{ width: '20%', textAlign: 'center' }}>Hình ảnh</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                            {permissionWrite ? <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th> : null}
                        </tr>
                    </thead>
                    <tbody id='mainListCarousel'>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    {!permissionWrite ? T.language.parse(item.title) : <a href='#' onClick={e => this.editItem(e, item, index)}>
                                        {T.language.parse(item.title)}
                                    </a>}
                                </td>
                                <td style={{ width: '20%', textAlign: 'center' }}>
                                    <img src={item.image} alt='avatar' style={{ height: '32px' }} />
                                </td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.active} onChange={() => permissionWrite && this.changeItemActive(item)} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                {permissionWrite ? <td>
                                    <div className='btn-group'>
                                        <a className='btn btn-success' href='#' onClick={e => this.swap(e, item, true)}>
                                            <i className='fa fa-lg fa-arrow-up' />
                                        </a>
                                        <a className='btn btn-success' href='#' onClick={e => this.swap(e, item, false)}>
                                            <i className='fa fa-lg fa-arrow-down' />
                                        </a>
                                        <a className='btn btn-primary' href='#' onClick={e => this.editItem(e, item, index)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        <a className='btn btn-danger' href='#' onClick={e => this.deleteItem(e, item, index)}>
                                            <i className='fa fa-lg fa-trash' />
                                        </a>
                                    </div>
                                </td> : null}
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        } else {
            table = <p>Không có hình ảnh!</p>;
        }

        const { title, height } = this.props.carousel && this.props.carousel.selectedItem ? this.props.carousel.selectedItem : { title: '', height: 0 };
        const carouselTitle = title != '' ? 'Tên: <b>' + title + '</b>' : '';
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-image' /> Tập hình ảnh: Chỉnh sửa</h1>
                        <p dangerouslySetInnerHTML={{ __html: carouselTitle }} />
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/component'>Thành phần giao diện</Link>
                        &nbsp;/&nbsp;Chỉnh sửa
                    </ul>
                </div>
                <div className='row'>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thông tin chung</h3>
                            <div className='tile-body'>
                                <div className='form-group'>
                                    <label className='control-label'>Tiêu đề tập hình ảnh</label>
                                    <input className='form-control' type='text' placeholder='Tiêu đề tập hình ảnh' id='crsTitle' defaultValue={title} readOnly={!permissionWrite} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Chiều cao</label>
                                    <input className='form-control' type='number' placeholder='Chiều cao' id='crsHeight' defaultValue={height} style={{ textAlign: 'right' }} readOnly={!permissionWrite} />
                                </div>
                                <div className='form-group row'>
                                    <label className='control-label col-3 col-sm-3'>Đơn ảnh</label>
                                    <div className='col-8 col-sm-8 toggle'>
                                        <label>
                                            <input type='checkbox' checked={this.state.single} onChange={e => permissionWrite && this.setState({ single: e.target.checked ? 1 : 0 })} /><span className='button-indecator' />
                                        </label>
                                    </div>
                                </div>
                                <div className='form-group row'>
                                    <label className='control-label col-3 col-sm-3'>Kích hoạt</label>
                                    <div className='col-8 col-sm-8 toggle'>
                                        <label>
                                            <input type='checkbox' checked={this.state.active} onChange={e => permissionWrite && this.setState({ active: e.target.checked ? 1 : 0 })} /><span className='button-indecator' />
                                        </label>
                                    </div>
                                </div>
                            </div>
                            {permissionWrite ? <div className='tile-footer'>
                                <div className='row'>
                                    <div className='col-md-12' style={{ textAlign: 'right' }}>
                                        <button className='btn btn-success' type='button' onClick={this.save}>
                                            <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                        </button>
                                    </div>
                                </div>
                            </div> : null}
                        </div>
                    </div>

                    <div className='col-md-12'>
                        <div className='tile'>
                            <h3 className='tile-title'>Danh sách hình ảnh</h3>
                            <div className='tile-body'>
                                {table}
                            </div>
                        </div>
                    </div>
                </div>
                <Link to='/user/component' className='btn btn-secondary btn-circle' style={{ position: 'fixed', lefft: '10px', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                {permissionWrite ? <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }}
                    onClick={this.createItem}>
                    <i className='fa fa-lg fa-plus' />
                </button> : null}

                <CarouselItemModal ref={this.modal} createCarouselItem={this.props.createCarouselItem} updateCarouselItem={this.props.updateCarouselItem} />
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, carousel: state.carousel });
const mapActionsToProps = { getCarousel, updateCarousel, createCarouselItem, updateCarouselItem, deleteCarouselItem, moveCarouselItem, swapCarouselItem };
export default connect(mapStateToProps, mapActionsToProps)(CarouselEditPage);
