import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import ImageBox from 'view/component/ImageBox';
import { getFeatureItem, getFeatureById, updateFeature, createFeatureItem, updateFeatureItem, deleteFeatureItem } from './redux/reduxFeature';

class TestimonyModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = { image: null };

        this.modal = React.createRef();
        this.imageBox = React.createRef();
        this.viEditor = React.createRef();
        this.enEditor = React.createRef();
    }

    componentDidMount() {
        T.ready(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#featureVi').focus());
        });
    }


    show = (selectedItem,) => {
        let { id, image, content, link } = selectedItem ? selectedItem : { id: null, featureId: null, image: null, content: '', link: '' };
        content = T.language.parse(content, true);
        if (id) $('#image').css('display', 'block');
        else { $('#image').css('display', 'none'); }
        this.setState({ image });
        this.imageBox.current.setData('feature:' + (selectedItem ? id : 'fnew'));
        $('#featureVi').val(content.vi);
        $('#featureEn').val(content.en);
        $('#link').val(link);


        $(this.modal.current).attr({ isUpdate: selectedItem ? true : false, id: id }).modal('show');
    }
    hide() {
        $(this.modal.current).modal('hide');
    }

    save = (event) => {
        event.preventDefault();

        if (!$('#featureVi').val()) {
            T.notify('Feature item bị trống!', 'danger');
            $('#featureVi').focus();
        } else {
            const content = JSON.stringify({ vi: $('#featureVi').val(), en: $('#featureEn').val() }),
                image = this.state.image || '/img/feature/default.png',
                isUpdate = $(this.modal.current).attr('isUpdate'),
                featureId = this.props.featureId,
                link = $('#link').val(),
                id = $(this.modal.current).attr('id');

            if (isUpdate === 'true') {
                this.props.updateFeatureItem(id, featureId, { content, image, link }, () => {
                    T.notify('Cập nhật feature item thành công', 'success');
                    $(this.modal.current).modal('hide');
                });
            } else {
                this.props.createFeatureItem(image, content, featureId, link, () => {
                    T.notify('Tạo mới feature item thành công', 'success');
                    $(this.modal.current).modal('hide');
                });
            }
        }
    }

    render() {
        return (
            // TODO: Lỗi tải lên ảnh cho Testimony: có tạo ảnh trong DB nhưng không hiển thị ảnh trên ImageBox.
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Feature</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='featureVi'>Nội dung</label>
                                <textarea id='featureVi' rows='3' className='form-control' />
                            </div>
                            <div className='form-group' style={{ display: 'none' }}>
                                <label htmlFor='featureEn'>English</label>
                                <textarea id='featureEn' rows='3' className='form-control' />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='featureEnTitle'>Link</label>
                                <input className='form-control' type='text' placeholder='Link' id='link' />
                            </div>
                            <div className='form-group' id='image' style={{ display: 'none' }}>
                                <label>Biểu tượng</label>
                                <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='FeatureImage' image={this.state.image} success={({ image }) => this.setState({ image })} />
                            </div>

                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='submit' className='btn btn-success'>Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class TestimonyEditPage extends React.Component {
    constructor(props) {
        super(props);
        this.modal = React.createRef();
        this.imageBox = React.createRef();
    }

    componentDidMount() {
        T.ready('/user/component', () => {
            const route = T.routeMatcher('/user/feature/edit/:featureId'),
                params = route.parse(window.location.pathname);

            this.props.getFeatureById(params.featureId, data => {
                if (data.error) {
                    T.notify('Lấy nhóm feature bị lỗi!', 'danger');
                    this.props.history.push('/user/component');
                } else if (data.item) {
                    const title = T.language.parse(data.item.title, true);
                    $('#featureViTitle').val(title.vi).focus();
                    $('#featureEnTitle').val(title.en);
                    // this.imageBox.current.setData('feature:' + (data.item.id || 'fnew'), data.item.image);
                } else {
                    this.props.history.push('/user/component');
                }
            });

            this.props.getFeatureItem(params.featureId);
        });
    }

    showAddTestimonyModal = () => this.modal.current.show();
    showEditTestimonyModal = (e, selectedTestimony, index) => {
        this.modal.current.show(selectedTestimony, index);
        e.preventDefault();
    }

    add = (fullname, jobPosition, image, content) => {
        this.props.addTestimonyIntoGroup(fullname, jobPosition, image, content);
        this.modal.current.hide();
    }
    update = (index, fullname, jobPosition, image, content) => {
        this.props.updateTestimonyInGroup(index, fullname, jobPosition, image, content);
        this.modal.current.hide();
    }
    remove = (e, item) => {
        T.confirm('Xóa Icon item', 'Bạn có chắc bạn muốn xóa nhóm Icon item này?', true, isConfirm => isConfirm && this.props.deleteFeatureItem(item, () => {
            T.notify('Xoá Icon item thành công', 'success');
        }));
        e.preventDefault();
    }
    swap = (e, index, isMoveUp) => {
        this.props.swapTestimonyInGroup(index, isMoveUp);
        e.preventDefault();
    }

    save = () => {
        const changes = {
            title: JSON.stringify({ vi: $('#featureViTitle').val(), en: $('#featureEnTitle').val() }),
        };
        this.props.updateFeature(this.props.feature.feature.item.id, changes);
    }

    render() {
        let table = <p></p>,
            currentFeatureItem = this.props.feature && this.props.feature.featureItem && this.props.feature.featureItem.list ? this.props.feature.featureItem.list : [],
            currentFeature = this.props.feature && this.props.feature.feature && this.props.feature.feature.item ? this.props.feature.feature.item : null,
            featureId = this.props.feature && this.props.feature.feature && this.props.feature.feature.item ? this.props.feature.feature.item.id : null;
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('website:write');

        if (currentFeatureItem && currentFeatureItem.length > 0) {
            table = (
                <table className='table table-hover table-bordered' ref={this.table}>
                    <thead>
                        <tr>
                            <th style={{ width: '80%' }}>Nội dung</th>
                            <th style={{ width: '20%', textAlign: 'center' }}>Hình ảnh</th>
                            {permissionWrite && <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {currentFeatureItem.map((item, index) => (
                            <tr key={index}>
                                {/* <td>
                                    {!permissionWrite ? <a>{T.language.parse(item.fullname, true).vi}</a> : <a href='#' onClick={e => this.showEditTestimonyModal(e, item, index)}>{T.language.parse(item.fullname, true).vi}</a>}
                                    <p>{T.language.parse(item.jobPosition, true).vi}</p>
                                </td> */}
                                <td>
                                    {!permissionWrite ? <a>{T.language.parse(item.content, true).vi}</a> : <a href='#' onClick={e => this.showEditTestimonyModal(e, item, index)}>{T.language.parse(item.content, true).vi}</a>}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <img src={item.image} height={100} />
                                </td>
                                {permissionWrite ? <td>
                                    <div className='btn-group'>
                                        <a className='btn btn-primary' href='#' onClick={e => this.showEditTestimonyModal(e, item, index)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        <a className='btn btn-danger' href='#' onClick={e => this.remove(e, item)}>
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

        const title = T.language.parse(currentFeature ? currentFeature.title : '<empty>', true);

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-yelp' /> Icon: Chỉnh sửa</h1>
                        <p dangerouslySetInnerHTML={{ __html: title.vi }} />
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/component'>Thành phần giao diện</Link>
                        &nbsp;/&nbsp;Chỉnh sửa
                    </ul>
                </div>
                <div className='row'>
                    <div className='tile col-md-12'>
                        <div className='tile-body'>
                            <div className='form-group'>
                                <label htmlFor='featureViTitle'>Tiêu đề (VI)</label>
                                <input className='form-control' type='text' placeholder='Tiêu đề' id='featureViTitle' readOnly={!permissionWrite} />
                            </div>
                            <div className='form-group' style={{ display: 'none' }}>
                                <label htmlFor='featureEnTitle'>Tiêu đề (EN)</label>
                                <input className='form-control' type='text' placeholder='Title' id='featureEnTitle' readOnly={!permissionWrite} />
                            </div>
                            {/* <div>
                                <label>Hình ảnh</label>
                                <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='FeatureImage' />
                            </div> */}
                            <div className='form-group mt-3'>
                                {table}
                            </div>
                        </div>
                        {permissionWrite ? <div className='tile-footer'>
                            <div className='row'>
                                <div className='col-md-12' style={{ textAlign: 'right' }}>

                                    <button className='btn btn-info' type='button' onClick={this.showAddTestimonyModal}>
                                        <i className='fa fa-fw fa-lg fa-plus'></i>Thêm icon
                                    </button>
                                    &nbsp;

                                    <button className='btn btn-success' type='button' onClick={this.save}>
                                        <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                    </button>
                                </div>
                            </div>
                        </div> : null}
                    </div>
                </div>
                <Link to='/user/component' className='btn btn-secondary btn-circle' style={{ position: 'fixed', lefft: '10px', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>

                <TestimonyModal ref={this.modal} featureId={featureId} createFeatureItem={this.props.createFeatureItem} updateFeatureItem={this.props.updateFeatureItem} />
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, feature: state.feature });
const mapActionsToProps = { getFeatureItem, getFeatureById, updateFeature, createFeatureItem, updateFeatureItem, deleteFeatureItem };
export default connect(mapStateToProps, mapActionsToProps)(TestimonyEditPage);
