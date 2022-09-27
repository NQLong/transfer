import React from 'react';
import { FormCheckbox, FormSelect, FormTextBox, AdminModal } from 'view/component/AdminPage';
import CodeEditor from '../CodeEditor';
import parse from 'html-react-parser';
import UIBox from './UIBox';

const code = `import React from 'react';
import { AdminModal } from 'view/component/AdminPage';

class ModalName extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => { /* Xử lý khi modal đã được hiển thị */ }));
    }
    
    onShow = (item) => {
        // Xử lý với item được truyền vào khi modal được hiển thị
    }
    
    onSubmit = (e) => {
        e.preventDefault();
        // Xử lý khi click button Save | khi submit
    }
    
    render = () => this.renderModal({
        title: 'Modal title',
        size: 'large',
        body: <>
            Phần body của modal
        </>
    })
}`;

const demoCode = '<h4 className=\'text-danger\'>Phần body của modal</h4>';

const templateCode = `import React from 'react';
import { AdminPage, AdminModal } from 'view/component/AdminPage';

class ModalName extends AdminModal {
    [isShowSubmitState]componentDidMount() {
        $(document).ready(() => this.onShown(() => { /* Xử lý khi modal đã được hiển thị */ }));
    }
    
    onShow = (item) => {
        // Xử lý với item được truyền vào khi modal được hiển thị
    }
    
    [onSubmit]render = () => this.renderModal({
        [title][demoSize][submitText][isShowSubmit][buttons]body: <>
            [body]
        </>
    })
}

class ComponentName extends AdminPage {
    render() {
        const item = { field1: 'Content of field1', isStudent: true };
        return this.renderPage({
            icon: 'fa fa-code',
            title: 'Template page with modal',
            content: <>
                <div className='tile'>
                    <button className='btn btn-primary' onClick={() => this.modal.show(item)}>
                        Show your modal!
                    </button>
                </div>
                <ModalName ref={e => this.modal = e}[readOnly] />
            </>
        });
    }
}`;

const isLoadingCode = `import React from 'react';
import { AdminModal, FormTextBox } from 'view/component/AdminPage';

class ModalName extends AdminModal {
    state = { isLoading: false };
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.name.focus()));
    }
    
    onShow = (item) => {
        this.name.value(item.name || '');
    }
    
    onSubmit = (e) => {
        e.preventDefault();
        this.setState({ isLoading: true }, () => {
            const data = { name: this.name.value() };
            this.props.create(data, () => {
                this.setState({ isLoading: false });
                this.hide();
            });
        });
    }
    
    render = () => this.renderModal({
        title: 'Demo is loading',
        isLoading: this.state.isLoading,
        body: <div className='row'>
            <FormTextBox ref={e => this.name = e} label='Họ và tên' />
        </div>
    })
}`;

export default class SectionAdminModal extends React.Component {
    state = {
        code, demoCode, isLoadingCode, outputCode: '', size: '', title: 'Modal title', buttons: false, submitText: 'Lưu', isShowSubmit: true,
        body: <h4 className='text-danger'>Phần body của modal</h4>, readOnly: false, onSubmit: true
    };

    componentDidMount() {
        this.demoSize.value('small');
        this.demoTitle.value('Modal title');
        this.demoSubmitText.value('Lưu');
        this.demoButtons.value(false);
        this.demoReadOnly.value(false);
        this.demoOnSubmit.value(true);
        this.demoIsShowSubmit.value(true);
        this.demoModal.setup(this.state);
        setTimeout(() => this.setOutputCode(), 100);
    }

    setOutputCode = () => {
        const demoSize = this.demoSize.value();
        const demoTitle = this.demoTitle.value();
        const demoSubmitText = this.demoSubmitText.value();
        const demoButtons = this.demoButtons.value();
        const demoReadOnly = this.demoReadOnly.value();
        const demoOnSubmit = this.demoOnSubmit.value();
        const demoIsShowSubmit = this.demoIsShowSubmit.value();
        let demoBody = this.state.demoCode.replaceAll('\n', '\n            ');

        const demoSizeReplace = demoSize == 'modal-lg' ? 'large' : (demoSize == 'modal-xl' ? 'extra-large' : '');
        let outputCode = templateCode.replace('[demoSize]', demoSizeReplace ? ('size: \'' + demoSizeReplace + '\',\n        ') : '');
        outputCode = outputCode.replace('[title]', demoTitle ? ('title: \'' + demoTitle + '\',\n        ') : '');
        outputCode = outputCode.replace('[submitText]', demoSubmitText != 'Lưu' ? ('submitText: \'' + demoSubmitText + '\',\n        ') : '');
        outputCode = outputCode.replace('[buttons]', demoButtons ? `buttons: <>
            <button className='btn btn-success'>
                <i className='fa fa-fw fa-lg fa-plus' /> Thêm
            </button>
            <button className='btn btn-danger'>Xóa</button>
        </>,
        ` : '');

        outputCode = outputCode.replace('[readOnly]', demoReadOnly ? ' readOnly={true}' : '');
        outputCode = outputCode.replace('[onSubmit]', demoOnSubmit ? `onSubmit = (e) => {
        e.preventDefault();
        // Xử lý khi click button Save | khi submit
        this.hide();
    }
    
    ` : '');

        outputCode = outputCode.replace('[isShowSubmitState]', !demoIsShowSubmit ? `state = { isShowSubmit: false }
        
    ` : '');
        outputCode = outputCode.replace('[isShowSubmit]', !demoIsShowSubmit ? 'isShowSubmit: this.state.isShowSubmit,\n        ' : '');
        outputCode = outputCode.replace('[body]', demoBody ? demoBody : '');
        this.setState({ outputCode });
    }

    setupDemo = data => {
        this.setState({ ...this.state, ...data }, () => this.demoModal.setup(this.state));
        setTimeout(this.setOutputCode, 100);
    }

    render() {
        const { size, title, buttons, submitText, isShowSubmit, body, readOnly, onSubmit } = this.state;
        return <>
            <div className='tile'>
                <div className='page-header'>
                    <div className='row'>
                        <div className='col-lg-12'>
                            <h2 className='mb-3 line-head'>AdminModal</h2>
                        </div>
                    </div>
                </div>
                <br />
                <strong className='text-primary'>AdminModal</strong> dùng để render ra phần modal
                <UIBox>
                    <div className='modal'
                        style={{ position: 'relative', top: 'auto', right: 'auto', left: 'auto', bottom: 'auto', zIndex: 1, display: 'block' }}>
                        <div className='modal-dialog modal-lg' role='document'>
                            <div className='modal-content'>
                                <div className='modal-header'>
                                    <h5 className='modal-title'>Modal title</h5>
                                    <button className='close' type='button' data-dismiss='modal' aria-label='Close'><span
                                        aria-hidden='true'>×</span></button>
                                </div>
                                <div className='modal-body'>
                                    <p>Phần nội dung của Modal</p>
                                    <FormTextBox label='Họ và tên' />
                                    <div className='row'>
                                        <FormTextBox className='col-md-6' label='Email' />
                                        <FormTextBox className='col-md-6' label='Số điện thoại' />
                                    </div>
                                </div>
                                <div className='modal-footer'>
                                    <button type='button' className='btn btn-secondary' data-dismiss='modal'>
                                        <i className='fa fa-fw fa-lg fa-times' />Đóng
                                    </button>
                                    <button type='submit' className='btn btn-primary'>
                                        <i className='fa fa-fw fa-lg fa-save' /> Lưu
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </UIBox>
                <br />
                Đoạn code dùng để tạo ra một Modal mới theo template <strong className='text-primary'>AdminModal</strong>:
                <CodeEditor value={this.state.code} readOnly />
                {/*onValueChange={code => this.setState({ code })}*/}
                <br />
                Các function có trong <strong className='text-primary'>AdminModal</strong>:
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Function</th>
                            <th>Mô tả</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className='text-warning'>show</td>
                            <td>
                                Hàm dùng để <strong>hiển thị modal</strong>, thường được gọi từ Component chính chứa modal này
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>onShow</td>
                            <td>Hàm thực hiện các thao tác <strong>khi modal được hiển thị</strong>, là hàm cần thiết phải có khi hiện thực một modal</td>
                        </tr>
                        <tr>
                            <td className='text-warning'>onShown</td>
                            <td>Hàm thực hiện các thao tác <strong>khi modal ĐÃ được hiển thị</strong>, thường được khai báo trong <strong>componentDidMount</strong></td>
                        </tr>

                        <tr>
                            <td className='text-warning'>hide</td>
                            <td>Hàm dùng để <strong>đóng modal</strong>, thường được gọi từ Component chính chứa modal này và trong hàm onSubmit</td>
                        </tr>
                        <tr>
                            <td className='text-warning'>onHide</td>
                            <td>Hàm thực hiện các thao tác <strong>khi modal được đóng lại</strong></td>
                        </tr>
                        <tr>
                            <td className='text-warning'>onHidden</td>
                            <td>Hàm thực hiện các thao tác <strong>khi modal ĐÃ được đóng lại</strong>, thường được khai báo trong <strong>componentDidMount</strong></td>
                        </tr>

                        <tr>
                            <td className='text-warning'>data</td>
                            <td>Hàm dùng để <strong>Set|Get một key bằng một giá trị cụ thể</strong> vào trong dữ liệu của modal</td>
                        </tr>
                        <tr>
                            <td className='text-warning'>onSubmit</td>
                            <td>Hàm thực hiện các thao tác <strong>khi người dùng nhấn Submit</strong>, là hàm cần thiết phải có khi hiện thực một modal và dùng để hiển thị nút Submit</td>
                        </tr>
                        <tr>
                            <td className='text-warning'>renderModal</td>
                            <td>Hàm trả về một <strong>Virtual DOM</strong> - là giao diện chính của AdminModal với đầy đủ các thành phần cấu thành một modal</td>
                        </tr>
                    </tbody>
                </table>

                <br />
                Các tham số có trong hàm <strong className='text-primary'>renderModal</strong>:
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Tham số</th>
                            <th style={{ whiteSpace: 'nowrap' }}>Mặc định</th>
                            <th>Mô tả</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className='text-warning'>title</td>
                            <td className='text-center'>{'\'\''}</td>
                            <td className='text-justify'>
                                Phần <strong>tiêu đề</strong> hiển thị trên phần header của site.
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>size</td>
                            <td className='text-center'>small</td>
                            <td className='text-justify'>
                                Quy định <strong>kích thước</strong> của modal<br />
                                <span className='text-muted'>Các kích thước bao gồm: small hoặc không khai báo | large | extra-large</span>
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>body</td>
                            <td className='text-center'>null</td>
                            <td className='text-justify'>
                                Phần <strong>Virtual DOM</strong> hiển thị phần nội dung của modal
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>buttons</td>
                            <td className='text-center'>null</td>
                            <td className='text-justify'>
                                Bổ sung thêm các <strong>nút tùy chỉnh thêm</strong> vào phần <strong>footer</strong> bên cạnh nút đóng và nút submit
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>isShowSubmit</td>
                            <td className='text-center'>true</td>
                            <td className='text-justify'>
                                Quy định <strong>nút Submit có được phép hiển thị hay không</strong>, mặc định là có<br />
                                <span className='text-muted'>Các giá trị: true | false</span>
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>isLoading</td>
                            <td className='text-center'>false</td>
                            <td className='text-justify'>
                                Là tham số <strong>để điều khiển trạng thái của nút Submit (Disable - Loading hay Ready)</strong>.
                                Tham số này thường được điều khiển bằng state của modal khi thực hiện Submit nhằm mục đích ngăn cản người dùng nhấn nhiều lần nút Submit
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>submitText</td>
                            <td className='text-center'>Lưu</td>
                            <td className='text-justify'>
                                Tham số dùng để <strong>đặt tên cho nút Submit</strong> theo ý muốn. Mặc định có tên là <strong>Lưu</strong> khi không set
                            </td>
                        </tr>
                    </tbody>
                </table>

                <br />
                Đoạn code ví dụ sử dụng tham số <strong className='text-primary'>isLoading</strong>:
                <CodeEditor value={this.state.isLoadingCode} readOnly />
                <br />
                Ngoài ra, sự hiển thị của Modal còn phụ thuộc vào props <strong className='text-primary'>readOnly</strong> do Component chính truyền vào.
                Điển hình là khi <strong>readOnly = true</strong>, nút Submit sẽ không được hiển thị.
            </div>
            <div className='tile'>
                <h4>Live demo</h4>
                <UIBox>
                    <div className='modal'
                        style={{ position: 'relative', top: 'auto', right: 'auto', left: 'auto', bottom: 'auto', zIndex: 1, display: 'block' }}>
                        <div className={'modal-dialog ' + size} role='document'>
                            <div className='modal-content'>
                                <div className='modal-header'>
                                    <h5 className='modal-title'>{title}</h5>
                                    <button className='close' type='button' data-dismiss='modal' aria-label='Close'><span
                                        aria-hidden='true'>×</span></button>
                                </div>
                                <div className='modal-body'>
                                    {body}
                                </div>
                                <div className='modal-footer'>
                                    {buttons && <>
                                        <button className='btn btn-success'>
                                            <i className='fa fa-fw fa-lg fa-plus' /> Thêm
                                        </button>
                                        <button className='btn btn-danger'>
                                            Xóa
                                        </button>
                                    </>}
                                    <button type='button' className='btn btn-secondary' data-dismiss='modal'>
                                        <i className='fa fa-fw fa-lg fa-times' />Đóng
                                    </button>
                                    {!isShowSubmit || readOnly == true || !onSubmit ? null :
                                        <button type='submit' className='btn btn-primary'>
                                            <i className='fa fa-fw fa-lg fa-save' /> {submitText}
                                        </button>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </UIBox>

                <div className='row pt-2'>
                    <FormSelect ref={e => this.demoSize = e} className='col-12 col-md-2' label='size' data={[
                        { id: 'small', text: 'small' },
                        { id: 'modal-lg', text: 'large' },
                        { id: 'modal-xl', text: 'extra-large' }
                    ]} onChange={value => this.setupDemo({ size: value.id })} minimumResultsForSearch={-1} />
                    <FormTextBox ref={e => this.demoTitle = e} className='col-12 col-md-5' label='title' onChange={e => this.setupDemo({ title: e.target.value })} />
                    <FormTextBox ref={e => this.demoSubmitText = e} className='col-12 col-md-5' label='submitText' onChange={e => this.setupDemo({ submitText: e.target.value })} />

                    <FormCheckbox ref={e => this.demoButtons = e} className='col-12 col-md' label='buttons' onChange={value => this.setupDemo({ buttons: value })} />
                    <FormCheckbox ref={e => this.demoReadOnly = e} className='col-12 col-md-auto' label='readOnly' onChange={value => this.setupDemo({ readOnly: value })} />
                    <FormCheckbox ref={e => this.demoOnSubmit = e} className='col-12 col-md-auto' label='onSubmit' onChange={value => this.setupDemo({ onSubmit: value })} />
                    <FormCheckbox ref={e => this.demoIsShowSubmit = e} className='col-12 col-md-auto' label='isShowSubmit' onChange={value => this.setupDemo({ isShowSubmit: value })} />

                    <div className='w-100' />
                    <div className='form-group col-12 col-md'>
                        <label>body</label>
                        <CodeEditor value={this.state.demoCode} disableCopy onValueChange={demoCode => this.setState({ demoCode }, () => this.setupDemo({ body: parse(demoCode) }))} />
                    </div>
                    <div className='form-group col-12 col-md-auto'>
                        <button className='btn btn-primary' onClick={() => this.demoModal.show()}>Show your modal!</button>
                    </div>

                    <div className='w-100' />
                    <div className='form-group col-12'>
                        <label>Parse to code</label>
                        <CodeEditor value={this.state.outputCode} readOnly />
                    </div>
                </div>
            </div>
            <DemoModal ref={e => this.demoModal = e} readOnly={readOnly} />
        </>;
    }
}

class DemoModal extends AdminModal {
    state = { size: '', title: '', buttons: false, submitText: 'Lưu', isShowSubmit: true, body: null, onSubmit: true };

    onSubmit = () => this.hide();

    setup = data => this.setState({ ...this.state, ...data });

    render = () => {
        const { size, title, buttons, submitText, isShowSubmit, body, onSubmit } = this.state;
        return this.renderModal({
            size: size == 'modal-lg' ? 'large' : (size == 'modal-xl' ? 'extra-large' : ''),
            title, submitText, isShowSubmit: isShowSubmit && onSubmit, body,
            buttons: buttons && <>
                <button className='btn btn-success'>
                    <i className='fa fa-fw fa-lg fa-plus' /> Thêm
                </button>
                <button className='btn btn-danger'>
                    Xóa
                </button>
            </>,
        });
    }
}