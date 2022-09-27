import React from 'react';
import { FormCheckbox, FormRichTextBox, FormTextBox } from 'view/component/AdminPage';
import SupportPage from './supportPage';
import CodeEditor from '../CodeEditor';
import parse from 'html-react-parser';

const code = `import React from 'react';
import { AdminPage } from 'view/component/AdminPage';

class ComponentName extends AdminPage {
    render() {
        return this.renderPage({
            icon: 'fa fa-user',
            title: 'Title',
            subTitle: 'Subtitle',
            content: <>
                <div className='tile'>content</div>
            </>,
            backRoute: '/user/your-route',
            onCreate: e => this.yourFunction(e)
        });
    }
}`;

const demoCode = '<div className=\'tile\'>\n   content\n</div>';

const templateCode = `import React from 'react';
import { AdminPage } from 'view/component/AdminPage';

class ComponentName extends AdminPage {
    render() {
        return this.renderPage({
            [icon][title][subTitle][breadcrumb]
            content: <>
                [content]
            </>,
            [backRoute][onCreate][onSave][onExport][onImport]
        });
    }
}`;

export default class SectionAdminPage extends React.Component {
    state = { code, demoCode, outputCode: '' };

    componentDidMount() {
        this.initPage.setup({ icon: 'fa fa-user', title: 'Title', subTitle: 'Subtitle', content: <div className='tile'>content</div>, backRoute: true, onCreate: true });
        this.demoIcon.value('fa fa-code');
        this.demoTitle.value('Tiêu đề thử nghiệm');
        this.demoSubtitle.value('Phụ đề thử nghiệm');
        this.demoBreadcrumb.value('<a href=\'#\'>Người dùng</a>\nChỉnh sửa');
        this.demoBackRoute.value(true);
        this.demoCreate.value(true);
        this.demoSave.value(true);
        this.demoExport.value(true);
        this.demoImport.value(true);

        this.demoPage.setup({
            icon: 'fa fa-code', title: 'Tiêu đề thử nghiệm', subTitle: 'Phụ đề thử nghiệm',
            breadcrumb: [<a key={0} href='#'>Người dùng</a>, 'Chỉnh sửa'],
            backRoute: true, onCreate: true, onSave: true, onExport: true, onImport: true,
            content: parse(this.state.demoCode)
        });
        setTimeout(() => this.setOutputCode(), 100);
    }

    setOutputCode = () => {
        const demoIcon = this.demoIcon.value();
        const demoTitle = this.demoTitle.value();
        const demoSubtitle = this.demoSubtitle.value();
        let demoContent = this.state.demoCode.replaceAll('\n', '\n                ');
        let demoBreadcrumb = this.demoBreadcrumb.value().split('\n');
        const demoBackRoute = this.demoBackRoute.value();
        const demoCreate = this.demoCreate.value();
        const demoSave = this.demoSave.value();
        const demoExport = this.demoExport.value();
        const demoImport = this.demoImport.value();
        demoBreadcrumb = demoBreadcrumb.map(item => item.startsWith('<') ? item : `'${item}'`);
        demoBreadcrumb = demoBreadcrumb.join(', ');
        let outputCode = templateCode.replace('[icon]', demoIcon ? ('icon: \'' + demoIcon + '\',\n            ') : '');
        outputCode = outputCode.replace('[title]', demoTitle ? ('title: \'' + demoTitle + '\',\n            ') : '');
        outputCode = outputCode.replace('[subTitle]', demoSubtitle ? ('subTitle: \'' + demoSubtitle + '\',\n            ') : '');
        outputCode = outputCode.replace('[breadcrumb]', demoBreadcrumb ? ('breadcrumb: [' + demoBreadcrumb + '],') : '');
        outputCode = outputCode.replace('[content]', demoContent ? demoContent : '');
        outputCode = outputCode.replace('[backRoute]', demoBackRoute ? ('backRoute: \'/user/path-to-back\',\n            ') : '');
        outputCode = outputCode.replace('[onCreate]', demoCreate ? ('onCreate: e => this.create(e),\n            ') : '');
        outputCode = outputCode.replace('[onSave]', demoSave ? ('onSave: e => this.save(e),\n            ') : '');
        outputCode = outputCode.replace('[onExport]', demoExport ? ('onExport: e => this.export(e),\n            ') : '');
        outputCode = outputCode.replace('[onImport]', demoImport ? ('onImport: e => this.import(e)') : '');
        this.setState({ outputCode });
    }

    setupDemo = data => {
        this.demoPage.setup(data);
        setTimeout(this.setOutputCode, 100);
    }

    render() {
        return <>
            <div className='tile'>
                <div className='page-header'>
                    <div className='row'>
                        <div className='col-lg-12'>
                            <h2 className='mb-3 line-head'>AdminPage</h2>
                        </div>
                    </div>
                </div>
                <br />
                <strong className='text-primary'>AdminPage</strong> dùng để render ra phần giao diện chính của một trang (route) cụ thể
                <SupportPage ref={e => this.initPage = e} />
                <br />
                Đoạn code dùng để tạo ra một Component mới theo template <strong className='text-primary'>AdminPage</strong>:
                <CodeEditor value={this.state.code} readOnly />
                {/*onValueChange={code => this.setState({ code })}*/}

                <br />
                Các function có trong <strong className='text-primary'>AdminPage</strong>:
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Function</th>
                            <th>Mô tả</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className='text-warning'>willUnmount</td>
                            <td>Hàm thực hiện các thao tác khi life-cycle của Component này kết thúc (Bị tháo gỡ)</td>
                        </tr>
                        <tr>
                            <td className='text-warning'>getCurrentPermissions</td>
                            <td>Hàm trả về Array các <strong>permissions</strong> của người dùng hiện tại, mặc định trả về Array rỗng ([])</td>
                        </tr>
                        <tr>
                            <td className='text-warning'>getUserPermission</td>
                            <td>
                                Hàm trả về dạng <strong>Object JSON</strong> các quyền hạn (mặc định read, write, delete) của một quyền với prefix cụ thể<br />
                                <span className='text-muted'>Ví dụ:{' { read: true, write: true, delete: false } '}</span>
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>renderPage</td>
                            <td>Hàm trả về một <strong>Virtual DOM</strong> - là giao diện chính của AdminPage với đầy đủ các thành phần cấu thành một site</td>
                        </tr>
                    </tbody>
                </table>

                <br />
                Các tham số có trong hàm <strong className='text-primary'>renderPage</strong>:
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
                            <td className='text-warning'>icon</td>
                            <td className='text-center'>{'\'\''}</td>
                            <td className='text-justify'>
                                Phần <strong>icon</strong> hiển thị trên phần header trước tiêu đề của site.<br />
                                Các icons được chấp nhận thuộc bộ icon của <a href='https://fontawesome.com/v4.7/icons/' target='_blank' rel='noreferrer'>FontAwesome 4.7 <i className='fa fa-external-link' /></a>
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>title</td>
                            <td className='text-center'>{'\'\''}</td>
                            <td className='text-justify'>
                                Phần <strong>tiêu đề</strong> hiển thị trên phần header của site.
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>subTitle</td>
                            <td className='text-center'>{'\'\''}</td>
                            <td className='text-justify'>
                                Phần <strong>phụ đề</strong> hiển thị bên dưới phần tiêu đề của site.
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>header</td>
                            <td className='text-center'>null</td>
                            <td className='text-justify'>
                                Phần <strong>Virtual DOM</strong> hiển thị trên phần header của site
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>breadcrumb</td>
                            <td className='text-center'>[]</td>
                            <td className='text-justify'>
                                Phần <strong>breadcrumb</strong> hiển thị trên phần header của site. Ví dụ:
                                <ul className='app-breadcrumb breadcrumb'><a href='#' onClick={e => e.preventDefault()}><i className='fa fa-home fa-lg' /></a>&nbsp;/&nbsp;<a href='#' onClick={e => e.preventDefault()}>Người dùng</a>&nbsp;/&nbsp;Chỉnh sửa</ul>
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>advanceSearch</td>
                            <td className='text-center'>null</td>
                            <td className='text-justify'>
                                Phần <strong>tìm kiếm nâng cao</strong> hỗ trợ cho chức năng tìm kiếm của hàm <strong>T.onSearch</strong>
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>content</td>
                            <td className='text-center'>null</td>
                            <td className='text-justify'>
                                Phần <strong>body chính</strong> của site
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>backRoute</td>
                            <td className='text-center'>null</td>
                            <td className='text-justify'>
                                Định nghĩa back URL của site hiện tại. Button back được render ở phía dưới góc trái của site.<br />
                                <span className='text-muted'>Ví dụ: backRoute: {'\'/user\''}</span>
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>onCreate</td>
                            <td className='text-center'>null</td>
                            <td className='text-justify'>
                                Định nghĩa thao tác <strong>tạo mới</strong> của site hiện tại. Button create được render ở phía dưới bên phải của site.<br />
                                <span className='text-muted'>Ví dụ: onCreate: {'(e) => this.create(e)'}</span>
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>onSave</td>
                            <td className='text-center'>null</td>
                            <td className='text-justify'>
                                Định nghĩa thao tác <strong>lưu trữ</strong> của site hiện tại. Button save được render ở phía dưới bên phải của site.<br />
                                <span className='text-muted'>Ví dụ: onSave: {'permission.write ? (e) => this.save(e) : null'}</span>
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>onExport</td>
                            <td className='text-center'>null</td>
                            <td className='text-justify'>
                                Định nghĩa thao tác <strong>Xuất dữ liệu</strong> của site hiện tại. Button export được render ở phía dưới bên phải của site.<br />
                                <span className='text-muted'>Ví dụ: onExport: {'(e) => this.download(e)'}</span>
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>onImport</td>
                            <td className='text-center'>null</td>
                            <td className='text-justify'>
                                Định nghĩa thao tác <strong>Nhập dữ liệu</strong> của site hiện tại. Button import được render ở phía dưới bên phải của site.<br />
                                <span className='text-muted'>Ví dụ: onImport: {'(e) => this.showImportModal(e)'}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className='tile'>
                <h4>Live demo</h4>
                <SupportPage ref={e => this.demoPage = e} />
                <div className='row pt-2'>
                    <FormTextBox ref={e => this.demoIcon = e} className='col-12 col-md-2' label='icon' onChange={e => this.setupDemo({ icon: e.target.value })} />
                    <FormTextBox ref={e => this.demoTitle = e} className='col-12 col-md-4' label='title' onChange={e => this.setupDemo({ title: e.target.value })} />
                    <FormTextBox ref={e => this.demoSubtitle = e} className='col-12 col-md-6' label='subTitle' onChange={e => this.setupDemo({ subTitle: e.target.value })} />
                    <FormRichTextBox ref={e => this.demoBreadcrumb = e} className='col-12' label='breadcrumb' onChange={e => this.setupDemo({ breadcrumb: e.target.value.split('\n').map(item => parse(item)) })} />

                    <FormCheckbox ref={e => this.demoBackRoute = e} className='col-12 col-md' label='backRoute' onChange={value => this.setupDemo({ backRoute: value })} />
                    <FormCheckbox ref={e => this.demoImport = e} className='col-12 col-md-auto' label='onImport' onChange={value => this.setupDemo({ onImport: value })} />
                    <FormCheckbox ref={e => this.demoExport = e} className='col-12 col-md-auto' label='onExport' onChange={value => this.setupDemo({ onExport: value })} />
                    <FormCheckbox ref={e => this.demoSave = e} className='col-12 col-md-auto' label='onSave' onChange={value => this.setupDemo({ onSave: value })} />
                    <FormCheckbox ref={e => this.demoCreate = e} className='col-12 col-md-auto' label='onCreate' onChange={value => this.setupDemo({ onCreate: value })} />

                    <div className='form-group col-12'>
                        <label>content</label>
                        <CodeEditor value={this.state.demoCode} disableCopy onValueChange={demoCode => this.setState({ demoCode }, () => this.setupDemo({ content: parse(demoCode) }))} />
                    </div>

                    <div className='form-group col-12'>
                        <label>Parse to code</label>
                        <CodeEditor value={this.state.outputCode} readOnly />
                    </div>
                </div>
            </div>
        </>;
    }
}