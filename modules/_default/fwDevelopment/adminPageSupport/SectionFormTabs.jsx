import React from 'react';
import { FormTabs } from 'view/component/AdminPage';
import CodeEditor from '../CodeEditor';
import UIBox from './UIBox';

const code = `import React from 'react';
import { AdminPage, FormTabs } from 'view/component/AdminPage';

class ComponentName extends AdminPage {
    render() {
        return this.renderPage({
            icon: 'fa fa-user',
            title: 'Title',
            content: <>
                <FormTabs id='exampleTab' tabs={[
                    { title: 'Component 1', component: <div className='tile'>Tab component #1</div> },
                    { title: 'Component 2', component: <div className='tile'>Tab component #2</div> },
                    { title: 'Component 3', component: <div className='tile'>Tab component #3</div> },
                    { title: 'Component 4', component: <div className='tile'>Tab component #4</div> }
                ]}/>
            </>
        });
    }
}`;

export default class SectionFormTabs extends React.Component {
    state = { code }

    render() {
        return <>
            <div className='tile'>
                <div className='page-header'>
                    <div className='row'>
                        <div className='col-lg-12'>
                            <h2 className='mb-3 line-head'>FormTabs</h2>
                        </div>
                    </div>
                </div>
                <br />
                <strong className='text-primary'>FormTabs</strong> dùng để render ra một component dạng chia tab, có giao diện như sau:
                <UIBox>
                    <div style={{ padding: '30px' }}>
                        <FormTabs tabs={[
                            { title: 'Component 1', component: <div className='tile'>Tab component #1</div> },
                            { title: 'Component 2', component: <div className='tile'>Tab component #2</div> },
                            { title: 'Component 3', component: <div className='tile'>Tab component #3</div> },
                            { title: 'Component 4', component: <div className='tile'>Tab component #4</div> }
                        ]} />
                    </div>
                </UIBox>
                <br />
                Đoạn code dùng để tạo ra một component dạng chia tab mới theo template <strong className='text-primary'>FormTabs</strong>:
                <CodeEditor value={this.state.code} readOnly />
                <br />
                Các props mà <strong className='text-primary'>FormTabs</strong> chấp nhận:
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Field</th>
                            <th style={{ whiteSpace: 'nowrap' }} className='text-center'>Mặc định</th>
                            <th>Mô tả</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className='text-warning'>id</td>
                            <td className='text-center'>tab</td>
                            <td className='text-justify'>
                                Định nghĩa <strong>id</strong> cho tab component
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>tabClassName</td>
                            <td className='text-center'>{'\'\''}</td>
                            <td className='text-justify'>
                                Bổ sung <strong>thêm class</strong> cho element phần tab
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>contentClassName</td>
                            <td className='text-center'>{'\'\''}</td>
                            <td className='text-justify'>
                                Bổ sung <strong>thêm class</strong> cho element phần nội dung
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>onChange</td>
                            <td className='text-center'>null</td>
                            <td className='text-justify'>
                                Định nghĩa function thực hiện thao tác nào đó <strong>khi thay đổi tab</strong>
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>tabs</td>
                            <td className='text-center'>{'[]'}</td>
                            <td className='text-justify'>
                                Định nghĩa <strong>số lượng tab, tiêu đề và nội dung của từng tab</strong>.<br />
                                <span className='text-muted'>tabs nhận giá trị là một mảng các Object có dạng: {'\{ title, component \}'}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>;
    }
}