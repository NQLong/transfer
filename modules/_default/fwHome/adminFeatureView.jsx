import React from 'react';
import { connect } from 'react-redux';
import { getAllTestimonys, createTestimony, deleteTestimony } from './redux/reduxTestimony';
import { Link } from 'react-router-dom';
import { getAllFeatures, createFeature, deleteFeature } from './redux/reduxFeature';

class TestimonyModal extends React.Component {
    constructor(props) {
        super(props);
        this.modal = React.createRef();
        this.btnSave = React.createRef();
        // this.imageBox = React.createRef();
        this.state = {
            image: null
        };
    }

    componentDidMount() {
        $(document).ready(() => {
            setTimeout(() => $(this.modal.current).on('shown.bs.modal', () => $('#featureViName').focus()), 250);
        });
    }

    show = () => {
        $('#featureViName').val('');
        $('#featureEnName').val('');
        $(this.modal.current).modal('show');
        // this.imageBox.current.setData('feature:' + ('fnew'));
    }

    save = (event) => {
        event.preventDefault();
        const item = {
            title: {
                vi: $('#featureViName').val().trim(),
                en: $('#featureEnName').val().trim()
            },
            // image: this.imageBox.current.getImage() || '/img/feature/default.png'
        };
        if (!item.title.vi) {
            T.notify('Tên nhóm feature bị trống!', 'danger');
            $('#featureViName').focus();
        } else {
            let payload = {};
            payload.title = JSON.stringify(item.title);
            payload.image = item.image;
            // this.props.createFeature(payload, data => {
            //     if (data.error == undefined || data.error == null) {
            //         $(this.modal.current).modal('hide');
            //         data.feature && this.props.showFeature(data.feature);
            //     }
            // });
            this.props.createFeature(payload, data => {
                if (!data.error) {
                    $(this.modal.current).modal('hide');
                }
            });
        }
    }

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog' role='document' onSubmit={e => this.save(e)}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Thông tin Icon</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='featureViName'>Tên nhóm Icon</label>
                                <input className='form-control' id='featureViName' type='text' placeholder='Tên nhóm Icon' />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='featureEnName'>The name of Icon</label>
                                <input className='form-control' id='featureEnName' type='text' placeholder='The name of Icon' />
                            </div>
                            {/* <div className='form-group'>
                                <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='FeatureImage' />
                            </div> */}
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

class TestimonyPage extends React.Component {
    constructor(props) {
        super(props);
        this.modal = React.createRef();
    }

    componentDidMount() {
        this.props.getAllFeatures();
    }

    create = (e) => {
        this.modal.current.show();
        e.preventDefault();
    }

    show = (item) => {
        this.props.history.push('/user/feature/edit/' + item.id);
    }

    delete = (e, item) => {
        T.confirm('Xóa nhóm feature', 'Bạn có chắc bạn muốn xóa nhóm feature này?', true, isConfirm => isConfirm && this.props.deleteFeature(item));
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        let table = null;
        if (this.props.feature && this.props.feature.feature && this.props.feature.feature.list && this.props.feature.feature.list.length > 0) {
            table = (
                <table key={0} className='table table-hover table-bordered' ref={this.table}>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '100%' }}>Tên nhóm</th>
                            {/* <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hình ảnh</th> */}
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.feature.feature.list.map((feature, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td>
                                    <Link to={'/user/feature/edit/' + feature.id} data-id={feature.id}>{T.language.parse(feature.title, true).vi}</Link>
                                </td>
                                {/* <t  d style={{ textAlign: 'center' }}><img src={feature.image} height={50} /></td> */}
                                <td>
                                    <div className='btn-group'>
                                        <Link to={'/user/feature/edit/' + feature.id} data-id={feature.id} className='btn btn-primary'>
                                            <i className='fa fa-lg fa-edit' />
                                        </Link>
                                        {currentPermissions.includes('component:write') ? <a className='btn btn-danger' href='#' onClick={e => this.delete(e, feature)}>
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
            table = <p key={0}>Không có nhóm Icon!</p>;
        }

        return ([
            table,
            <TestimonyModal key={1} createFeature={this.props.createFeature} showFeature={this.show} ref={this.modal} />,

            currentPermissions.includes('website:write') ? <button key={2} type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.create}>
                <i className='fa fa-lg fa-plus' />
            </button> : null,
        ]);
    }
}

const mapStateToProps = state => ({ system: state.system, testimony: state.testimony, feature: state.feature });
const mapActionsToProps = { getAllTestimonys, createTestimony, deleteTestimony, getAllFeatures, createFeature, deleteFeature };
export default connect(mapStateToProps, mapActionsToProps)(TestimonyPage);
