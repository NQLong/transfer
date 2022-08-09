import React from 'react';
import { connect } from 'react-redux';
import { updateMenu, getMenu, createComponent, updateComponent, updateComponentPriorities, deleteComponent, getComponentViews, homeMenuGet } from './redux';
import { getDvWebsite } from 'modules/_default/websiteDonVi/redux';
import Dropdown from 'view/component/Dropdown';
import { AdminPage, FormTextBox, FormSelect, getValue, FormCheckbox } from 'view/component/AdminPage';
import { FormMultipleLanguage } from 'view/component/MultipleLanguageForm';

export class ComponentModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = { viewType: '<empty>', viewItemText: '<empty>', adapter: null };

        this.modal = React.createRef();
        this.viewTypeDisplay = React.createRef();
        this.btnSave = React.createRef();
    }

    componentDidMount() {
        setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#comClassname').focus());
        }, 250);
        this.componentTypes = T.pageTypes.map(key => ({ id: key, text: key }));
    }

    show = (parentId, item) => {
        const { id, className, style, viewId, viewType, detail } = item ? item : { id: null, className: '', style: '', viewId: null, viewType: '<empty>', detail };
        $('#comClassname').val(className);
        $('#comStyle').val(style);
        $(this.btnSave.current)
            .data('parentId', parentId)
            .data('id', id)
            .data('viewId', viewId ? viewId : '');
        if (detail) {
            const detailValue = JSON.parse(detail);
            this.viewTypeDisplay.setText(detailValue ? detailValue.viewTypeDisplay : '');
            $('#valueTitleCom').val(detailValue && detailValue.valueTitleCom ? detailValue.valueTitleCom : '');
            $('#linkSeeAll').val(detailValue ? detailValue.linkSeeAll : '');
        } else {
            this.viewTypeDisplay.setText('');
            $('#valueTitleCom').val('');
            $('#linkSeeAll').val('');
        }
        this.itemViewTyle.value(viewType || '<empty>');
        $('#comView').css('display', viewId ? 'inline-flex' : 'none');
        $('#comDisplay').css('display', 'none');
        $('#divLinkSeeAll').css('display', 'none');

        if (viewType) {
            this.typeChanged(viewType);
        }

        $(this.modal.current).modal('show');
    }

    typeChanged = (selectedType) => {
        const comView = $('#comView').css('display', 'none'),
            comLoading = $('#comLoading').css('display', 'none');
        $('#itemViewItem').empty();
        const types = [
            '<empty>',
            'last news', 'last jobs', 'contact',
            'subscribe', 'contact', 'all staffs',
            'all jobs', 'notification', 'admission'
        ];
        if (selectedType == 'tin tức chung') {
            this.viewTypeDisplay.setItems(['Template 1', 'Template 2', 'Template 3', 'Template 4']);
            $('#comDisplay').css('display', 'block');
            $('#titleCom').css('display', 'block');
            $('#divLinkSeeAll').css('display', 'block');
        } else if (selectedType == 'all news') {
            this.viewTypeDisplay.setItems(['Template 1', 'Template 2']);
            $('#comDisplay').css('display', 'block');
            $('#titleCom').css('display', 'block');
        } else if (selectedType == 'video' || selectedType == 'gallery') {
            $('#titleCom').css('display', 'block');
        } else if (selectedType == 'notification') {
            $('#divLinkSeeAll').css('display', 'block');
        } else if (selectedType == 'last events') {
            $('#titleCom').css('display', 'block');
            this.viewTypeDisplay.setItems(['Template 1', 'Template 2']);
            $('#comDisplay').css('display', 'block');
            $('#divLinkSeeAll').css('display', 'block');
        } else if (selectedType == 'thư viện') {
            this.viewTypeDisplay.setItems(['Tìm kiếm', 'Giới thiệu sách', 'CSDL', 'Hỗ trợ']);
            $('#comDisplay').css('display', 'block');
            $('#titleCom').css('display', 'block');
            $('#divLinkSeeAll').css('display', 'none');
        } else if (selectedType == 'all companies') {
            $('#titleCom').css('display', 'block');
            $('#comDisplay').css('display', 'none');
            $('#divLinkSeeAll').css('display', 'none');
        } else {
            $('#comDisplay').css('display', 'none');
            $('#titleCom').css('display', 'none');
            $('#divLinkSeeAll').css('display', 'none');
        }

        if (types.indexOf(selectedType) == -1) {
            let typeGet = selectedType == 'all news' ? 'all-news' : selectedType;
            if (selectedType == 'tin tức chung') typeGet = 'all-news';
            else if (selectedType == 'all divisions') typeGet = 'division';
            else if (selectedType == 'all events') typeGet = 'all-events';
            else if (selectedType == 'thư viện') {
                const value = this.viewTypeDisplay.getSelectedItem();
                if (value == 'Giới thiệu sách') typeGet = 'gallery';
                else if (value == 'CSDL' || value == 'Hỗ trợ') typeGet = 'feature';
                else return;
            }
            comView.css('display', 'inline-flex');
            comLoading.css('display', 'block');
            this.props.getComponentViews(typeGet, items => {
                comLoading.css('display', 'none');
                let viewItemText = '<empty>',
                    viewItemId = $(this.btnSave.current).data('viewId'),
                    found = false;
                for (let i = 0; i < items.length; i++) {
                    if (viewItemId == items[i].id) {
                        viewItemText = T.language.parse(items[i].text);
                        found = true;
                        break;
                    }
                }
                if (!found) $(this.btnSave.current).data('viewId', '');
                $('#itemViewItem').select2({ data: items.map(item => ({ id: item.id, text: item.text ? item.text.viText() : item })), placeholder: 'Chọn danh mục' })
                    .val(viewItemId).trigger('change');
                this.setState({ viewType: selectedType, viewItemText });
            });
        }
    }

    save = () => {
        const btnSave = $(this.btnSave.current),
            id = btnSave.data('id'),
            parentId = btnSave.data('parentId'),
            viewTypeDisplay = this.viewTypeDisplay.getSelectedItem(),
            valueTitleCom = $('#valueTitleCom').val(),
            linkSeeAll = $('#linkSeeAll').val(),
            data = {
                // viewType: this.viewType.current.getSelectedItem(),
                viewType: this.itemViewTyle.value(),
                className: $('#comClassname').val().trim(),
                style: $('#comStyle').val().trim()
            };
        if (viewTypeDisplay || linkSeeAll || valueTitleCom.length > -1)
            data.detail = JSON.stringify({
                viewTypeDisplay,
                valueTitleCom,
                linkSeeAll
            });
        data.viewId = $('#itemViewItem').val();
        if (id) {
            this.props.onUpdate(id, data, () => $(this.modal.current).modal('hide'));
        } else {
            this.props.onCreate(parentId, data, () => $(this.modal.current).modal('hide'));
        }
    }

    onChangeTypeDisplay = (value) => {
        if (value == 'Giới thiệu sách') {
            $('#itemViewItem').empty();
            this.props.getComponentViews('gallery', items => {
                $('#itemViewItem').select2({ data: items.map(item => ({ id: item.id, text: T.language.parse(item.text ? item.text : item) })), placeholder: 'Chọn danh mục' })
                    .trigger('change');
                $('#comView').css('display', 'inline-flex');
            });
        } else if (value == 'CSDL') {
            $('#itemViewItem').empty();
            this.props.getComponentViews('feature', items => {
                $('#itemViewItem').select2({ data: items.map(item => ({ id: item.id, text: T.language.parse(item.text ? item.text : item) })), placeholder: 'Chọn danh mục' })
                    .trigger('change');
                $('#comView').css('display', 'inline-flex');
            });
        } else if (this.itemViewTyle.value() == 'thư viện') {
            $('#comView').css('display', 'none');
            $('#itemViewItem').val(null);

        }
    }

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <div className='modal-dialog' role='document'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Danh mục</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='comClassname'>Class name</label>
                                <input className='form-control' id='comClassname' type='text' placeholder='Class name' />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='comStyle'>Style</label>
                                <input className='form-control' id='comStyle' type='text' placeholder='Style' />
                                <small>Ví dụ: marginTop: 50px</small>
                            </div>
                            <div className='form-group'>
                                <FormSelect ref={e => this.itemViewTyle = e} label='Loại thành phần' data={this.componentTypes} onChange={data => this.typeChanged(data.id)} readOnly={this.props.readOnly} />
                            </div>
                            <div className='form-group' id='comView' style={{ display: 'none', width: '100%' }}>
                                <select id='itemViewItem' placeholder='Chọn tên thành phần' multiple={false} defaultValue={null} className='select2-input'></select>
                            </div>
                            <div className='form-group' id='comDisplay' style={{ display: 'none' }}>
                                <div style={{ display: 'inline-flex' }}>
                                    <label>Loại hiện thị:</label>&nbsp;&nbsp;
                                    <Dropdown ref={e => this.viewTypeDisplay = e} onSelected={this.onChangeTypeDisplay} text='<empty>' />
                                </div>
                            </div>
                            <div className='form-group' id='titleCom' style={{ display: 'none' }}>
                                <input type='text' className='form-control' id='valueTitleCom' placeholder='Tiêu đề' />
                            </div>
                            <div className='form-group' id='divLinkSeeAll' style={{ display: 'none' }}>
                                <input type='text' className='form-control' id='linkSeeAll' placeholder='Đường dẫn xem tất cả bài viết' />
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='button' className='btn btn-success' ref={this.btnSave} onClick={this.save}>Lưu</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export class MenuEditPage extends AdminPage {
    state = { id: null, priority: 1, title: '', view: 0, items: [], active: false, menuLink: 'Link: ', menuId: null, divisionId: null, languages: ['vi', 'en'] };

    componentDidMount() {
        const route = T.routeMatcher('/user/menu/edit/:menuId'), route2 = T.routeMatcher('/user/menu/edit/:divisionId/:menuId');
        let params = route2.parse(window.location.pathname) || route.parse(window.location.pathname);
        this.setState({ menuId: params.menuId, divisionId: params.divisionId }, () => {
            T.ready(this.state.divisionId ? '/user/website' : '/user/truyen-thong', () => {
                this.getData(true);
            });
        });
    }

    getData = (initial = false) => {
        this.props.getMenu(this.state.menuId, data => {
            if (data.error) {
                T.notify('Lấy thông tin menu bị lỗi!', 'danger');
                this.props.history.goBack();
            } else if (data.menu) {
                if (initial) {
                    const setValue = () => {
                        this.title.value(data.menu.title);
                        this.active.value(data.menu.active);
                        this.link.value(data.menu.link || '');
                        this.menuLinkChange(data.menu.link);
                    };

                    if (this.state.divisionId) {
                        this.props.getDvWebsite(this.state.divisionId, item => {
                            if (item && item.donVi && item.donVi.homeLanguage) {
                                this.setState({ languages: item.donVi.homeLanguage.split(',') }, setValue);
                            } else setValue();
                        });
                    } else {
                        setValue();
                    }
                }

                this.setState(data.menu);
            } else {
                this.props.history.goBack();
            }
        });
    }

    menuLinkChange = (link = '') => {
        link = link.toLowerCase();
        let menuLink;
        if (link.startsWith('http://') || link.startsWith('https://')) {
            menuLink = <>Link: <a href={link} style={{ fontWeight: 'bold' }} target='_blank' rel='noreferrer'>{link}</a></>;
        } else {
            menuLink = <>Link: <a href={link} style={{ fontWeight: 'bold' }} target='_blank' rel='noreferrer'>{T.rootUrl + link}</a></>;
        }
        this.setState({ menuLink });
    }

    save = () => {
        const changes = {
            title: this.title.value(),
            link: getValue(this.link),
            active: Number(getValue(this.active))
        };

        if (this.state.divisionId && changes.link != '#' && !changes.link.startsWith(`/${this.state.maWebsite}`) && !changes.link.includes('http')) {
            T.alert(`Địa chỉ nhập phải bắt đầu bằng /${this.state.maWebsite} !`, 'error', false, 2000);
            return;
        }
        if (changes.link != '#') this.props.homeMenuGet(changes.link, data => {
            if (data.menu && data.menu.id != this.state.id) {
                T.alert('Địa chỉ bạn nhập bị trùng, vui lòng nhập lại', 'error', false, 2000);
            } else {
                this.props.updateMenu(this.state.id, changes);
            }
        });
        else {
            this.props.updateMenu(this.state.id, changes);
        }
    }

    showComponent = (e, parentId, component) => {
        this.modal.show(parentId, component);
        e.preventDefault();
    }
    createComponent = (parentId, data, done) => {
        this.props.createComponent(parentId, data, () => {
            this.getData();
            done();
        });
    }
    updateComponent = (id, data, done) => {
        this.props.updateComponent(id, data, () => {
            this.getData();
            done();
        });
    }
    swapComponent = (e, component, index1, isMoveUp) => {
        e.preventDefault();
        let length = component.components.length,
            index2 = index1 + (isMoveUp ? -1 : +1);
        if (0 <= index1 && index1 < length && 0 <= index2 && index2 < length) {
            const child1 = component.components[index1], child2 = component.components[index2];
            this.props.updateComponentPriorities([
                { id: child1.id, priority: child2.priority },
                { id: child2.id, priority: child1.priority }
            ], () => this.getData());
        }
    }
    deleteComponent = (e, component) => {
        T.confirm('Xóa component', 'Bạn có chắc bạn muốn xóa component này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteComponent(component.id, this.getData));
        e.preventDefault();
    }

    renderComponents = (hasUpdate, level, parentComponent) => parentComponent.components.map((component, index) => {
        const buttons = [];
        if (hasUpdate) {
            buttons.push(
                <a key={0} className='btn btn-info' href='#' onClick={e => this.showComponent(e, component.id, null)}>
                    <i className='fa fa-lg fa-plus' />
                </a>);
            if (level > 0) {
                buttons.push(
                    <a key={1} className='btn btn-success' href='#' onClick={e => this.swapComponent(e, parentComponent, index, true)}>
                        <i className='fa fa-lg fa-arrow-up' />
                    </a>);
                buttons.push(
                    <a key={2} className='btn btn-success' href='#' onClick={e => this.swapComponent(e, parentComponent, index, false)}>
                        <i className='fa fa-lg fa-arrow-down' />
                    </a>);
            }
            buttons.push(
                <a key={3} className='btn btn-primary' href='#' onClick={e => this.showComponent(e, null, component)}>
                    <i className='fa fa-lg fa-edit' />
                </a>);
            if (level > 0) {
                buttons.push(
                    <a key={4} className='btn btn-danger' href='#' onClick={e => this.deleteComponent(e, component)}>
                        <i className='fa fa-lg fa-trash' />
                    </a>
                );
            }
        }

        const mainStyle = { padding: '0 6px', margin: '6px 0', color: '#000' };
        if (component.viewType) {
            if (component.viewType == 'tin tức chung') {
                const detail = JSON.parse(component.detail);
                component.viewName = `${detail ? detail.valueTitleCom : ''} - ${detail ? detail.viewTypeDisplay : ''}`;
                mainStyle.backgroundColor = '#FFCC80';
            } else if (component.viewType == 'carousel') {
                mainStyle.backgroundColor = '#ef9a9a';
            } else if (component.viewType == 'feature') {
                mainStyle.backgroundColor = '#b2dfdb';
            } else if (component.viewType == 'admission') {
                mainStyle.backgroundColor = '#f48fb1';
            } else if (component.viewType == 'notification') {
                mainStyle.backgroundColor = '#ce93d8';
            } else if (component.viewType == 'gallery') {
                mainStyle.backgroundColor = '#b39ddb';
                component.viewName = '';
            } else if (component.viewType == 'video') {
                mainStyle.backgroundColor = '#90caf9';
            } else if (component.viewType == 'all news') {
                mainStyle.backgroundColor = '#8c9eff';
            } else if (component.viewType == 'last news') {
                mainStyle.backgroundColor = '#ffccbc';
                component.viewName = '';
            } else if (component.viewType == 'last events') {
                mainStyle.backgroundColor = '#d7ccc8';
                component.viewName = '';
            } else if (component.viewType == 'all events') {
                mainStyle.backgroundColor = '#d7ccc8';
                component.viewName = '';
            } else if (component.viewType == 'content') {
                mainStyle.backgroundColor = '#f48fb1';
            } else if (component.viewType == 'contact') {
                component.viewName = '';
                mainStyle.backgroundColor = '#66f9b0';
            } else if (component.viewName == 'all divisions') {
                // component.viewName = '';
                mainStyle.backgroundColor = '#66f9b0';
            } else if (component.viewName == 'all companies') {
                // component.viewName = '';
                mainStyle.backgroundColor = '#34fa45';
            }
        }
        let displayText = component.viewType + (component.viewName ? ' - ' + T.language.parse(component.viewName) + ' ' : '');
        if (component.className && component.className.trim() != '') displayText += ' (' + component.className.trim() + ')';

        return (
            <div key={index} data-level={level} className={'component ' + component.className} style={mainStyle}>
                <p style={{ width: '100%' }}>{displayText}</p>
                {component.components && component.components.length ? this.renderComponents(hasUpdate, level + 1, component) : ''}
                <div className='btn-group btn-group-sm control'>{buttons}</div>
            </div>
        );
    });

    render() {
        const permission = this.getUserPermission('menu');
        const currentPermissions = this.getCurrentPermissions();
        const languages = this.state.languages;
        const title = T.language.parse(this.state.title, languages[0], languages);

        return this.renderPage({
            icon: 'fa fa-edit',
            title: 'Menu: Chỉnh sửa',
            subTitle: title != '' ? <>Tiêu đề: <b>{title}</b> - {T.dateToText(this.state.createdDate)}</> : '',
            content: <>
                <div className='tile'>
                    <h3 className='tile-title'>Thông tin chung</h3>
                    <div className='tile-body'>
                        <FormMultipleLanguage gridClassName='col-md-6' ref={e => this.title = e} languages={languages} title='Tiêu đề menu' FormElement={FormTextBox} readOnly={!permission.write} />
                        <div className='row'>
                            <FormTextBox ref={e => this.link = e} className='col-md-6' label={this.state.menuLink} placeholder='Link' onChange={e => this.menuLinkChange(e.target.value)} readOnly={!permission.write} />
                            <FormCheckbox ref={e => this.active = e} className='col-md-6' label='Kích hoạt' readOnly={!permission.write} />
                        </div>
                    </div>
                    {permission.write ?
                        <div className='tile-footer text-right'>
                            <button className='btn btn-success' type='button' onClick={this.save}>
                                <i className='fa fa-fw fa-lg fa-save' /> Lưu
                            </button>
                        </div> : null}
                </div>

                <div className='tile'>
                    <h3 className='tile-title'>Cấu trúc trang web</h3>
                    <div className='tile-body'>
                        {this.state.component ? this.renderComponents(permission.write, 0, { components: [this.state.component] }) : null}
                    </div>
                </div>

                {currentPermissions.includes('component:read') ?
                    <button type='button' className='btn btn-info btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={() => this.props.history.push('/user/component')}>
                        <i className='fa fa-lg fa-cogs' />
                    </button> : null}

                <ComponentModal onUpdate={this.updateComponent} onCreate={this.createComponent} getComponentViews={this.props.getComponentViews} ref={e => this.modal = e} />
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { updateMenu, getMenu, createComponent, updateComponent, updateComponentPriorities, deleteComponent, getComponentViews, homeMenuGet, getDvWebsite };
export default connect(mapStateToProps, mapActionsToProps)(MenuEditPage);
