import React from 'react';
import { connect } from 'react-redux';
import { getContent, updateContent } from './redux/reduxContent';
import { Link } from 'react-router-dom';
import { AdminPage, FormCheckbox, FormTextBox, FormEditor } from 'view/component/AdminPage';
import { getDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { FormMultipleLanguage } from 'view/component/MultipleLanguageForm';

class ContentEditPage extends AdminPage {
    state = { id: null, title: '', homeLanguages: ['vi', 'en'] };

    componentDidMount() {
        T.ready('/user/component', () => {
            const route = T.routeMatcher('/user/content/edit/:contentId'),
                params = route.parse(window.location.pathname);
            this.props.getContent(params.contentId, data => {
                if (data.error) {
                    T.notify('Lấy bài viết bị lỗi!', 'danger');
                    this.props.history.push('/user/component');
                } else if (data.item) {
                    let { id, title, content, active } = data.item;

                    this.title.value(title);
                    this.active.value(active);
                    this.editor.value(content);
                    this.setState({ id, title }, () => {
                        if (data.item && data.item.hasOwnProperty('maDonVi')) {
                            this.props.getDmDonVi(data.item.maDonVi, item => {
                                const homeLanguages = item && item.homeLanguage ? item.homeLanguage.split(',') : ['vi', 'en'];
                                this.setState({ homeLanguages });
                            });
                        }
                    });
                } else {
                    this.props.history.push('/user/component');
                }
            });
        });
    }

    changeActive = (event) => this.setState({ active: event.target.checked });

    save = () => {
        const changes = {
            title: this.title.value(),
            content: this.editor.value(),
            active: Number(this.active.value())
        };
        this.props.updateContent(this.state.id, changes);
    }

    render() {
        const currentPermissions = this.getCurrentPermissions();
        const permissionWrite = currentPermissions.includes('component:write') || currentPermissions.includes('website:write');
        const title = this.state.title ? T.language.parse(this.state.title, 'vi') : '<Trống>';

        return this.renderPage({
            icon: 'fa fa-image',
            title: 'Bài viết: Chỉnh sửa',
            subTitle: title,
            breadcrumb: [<Link key={0} to='/user/component'>Thành phần giao diện</Link>, 'Chỉnh sửa'],
            content: <>
                <div className='tile'>
                    <div className='tile-body'>
                        <FormCheckbox ref={e => this.active = e} isSwitch style={{ position: 'absolute', right: '15px' }} label='Kích hoạt' readOnly={!permissionWrite} />
                        <FormMultipleLanguage ref={e => this.title = e} tabRender title='Tiêu đề' languages={this.state.homeLanguages} FormElement={FormTextBox} readOnly={!permissionWrite} />
                        <FormMultipleLanguage ref={e => this.editor = e} tabRender title='Nội dung' languages={this.state.homeLanguages} FormElement={FormEditor} formProps={{ uploadUrl: '/user/upload?category=content' }} readOnly={!permissionWrite} />
                    </div>
                </div>
            </>,
            backRoute: () => this.props.history.goBack(),
            onSave: permissionWrite ? () => this.save() : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, content: state.content });
const mapActionsToProps = { getContent, updateContent, getDmDonVi };
export default connect(mapStateToProps, mapActionsToProps)(ContentEditPage);