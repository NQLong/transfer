import React from 'react';
import { TableCell, renderTable } from 'view/component/AdminPage';
import CodeEditor from '../CodeEditor';
import UIBox from './UIBox';

const code = `import React from 'react';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';

class ComponentName extends AdminPage {
    render() {
        const list = [
            { name: 'Nguyễn Quang Sang', birthday: new Date(1997, 0, 9), phone: '0948358166', image: '/img/avatar.png', active: true },
            { name: 'Nguyễn Văn A', birthday: new Date(2000, 0, 1), phone: '0123456789', image: '/img/avatar.png', active: false },
            { name: 'Nguyễn Văn B', birthday: new Date(2000, 0, 1), phone: '0123456789', image: '/img/avatar.png', active: true }
        ];
        return this.renderPage({
            icon: 'fa fa-user',
            title: 'Title',
            content: <>
                <div className='tile'>
                    {renderTable({
                        getDataSource: () => list,
                        renderHead: () => (
                            <tr>
                                <th>#</th>
                                <th style={{ width: '100%' }}>Họ và tên</th>
                                <th>Ngày sinh</th>
                                <th>Số điện thoại</th>
                                <th>Hình ảnh</th>
                                <th>Kích hoạt</th>
                                <th>Thao tác</th>
                            </tr>
                        ),
                        renderRow: (item, index) => (
                            <tr key={index}>
                                <TableCell type='number' content={index + 1}/>
                                <TableCell type='link' content={item.name} onClick={() => {}}/>
                                <TableCell type='date' content={item.birthday} dateFormat='dd/mm/yyyy'/>
                                <TableCell type='text' content={item.phone}/>
                                <TableCell type='image' content={item.image}/>
                                <TableCell type='checkbox' content={item.active}/>
                                <TableCell type='buttons' onEdit={() => {}} onDelete={() => {}} permission={{ write: true, delete: true }}/>
                            </tr>
                        )
                    })}
                </div>
            </>
        });
    }
}`;

const functionRenderTable = `function renderTable({
    style, className, getDataSource, loadingText, stickyHead, emptyTable, renderHead, renderRow, header
})`;

const loadingText = `import React from 'react';
import { AdminPage, renderTable } from 'view/component/AdminPage';

class ComponentName extends AdminPage {
    render() {
        return this.renderPage({
            icon: 'fa fa-user',
            title: 'Title',
            content: <>
                <div className='tile'>
                    {renderTable({
                        getDataSource: () => [],
                        emptyTable: 'Không có dữ liệu trong bảng'
                    })}
                </div>
                
                <div className='tile'>
                    {renderTable({
                        loadingText: 'Đang tải...'
                    })}
                </div>
            </>
        });
    }
}`;

const stickyText = `import React from 'react';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';

class ComponentName extends AdminPage {
    render() {
        const list = new Array(15).fill('Nguyễn Quang Sang');
        return this.renderPage({
            icon: 'fa fa-user',
            title: 'Title',
            content: <>
                <div className='tile'>
                    {renderTable({
                        getDataSource: () => list, stickyHead: true,
                        renderHead: () => (
                            <tr>
                                <th>#</th>
                                <th style={{ width: '100%' }}>Họ và tên</th>
                            </tr>
                        ),
                        renderRow: (item, index) => (
                            <tr key={index}>
                                <TableCell type='number' content={index + 1}/>
                                <TableCell type='text' content={item}/>
                            </tr>
                        )
                    })}
                </div>
            </>
        });
    }
}`;

export default class SectionRenderTable extends React.Component {
    state = { code, functionRenderTable, loadingText, stickyText }

    render() {
        const list = [
            { name: 'Nguyễn Quang Sang', birthday: new Date(1997, 0, 9), phone: '0948358166', image: '/img/avatar.png', active: true },
            { name: 'Nguyễn Văn A', birthday: new Date(2000, 0, 1), phone: '0123456789', image: '/img/avatar.png', active: false },
            { name: 'Nguyễn Văn B', birthday: new Date(2000, 0, 1), phone: '0123456789', image: '/img/avatar.png', active: true }
        ];
        const list_2 = new Array(15).fill('Nguyễn Quang Sang');
        return <>
            <div className='tile'>
                <div className='page-header'>
                    <div className='row'>
                        <div className='col-lg-12'>
                            <h2 className='mb-3 line-head'>renderTable</h2>
                        </div>
                    </div>
                </div>
                <br />
                <strong className='text-primary'>renderTable</strong> là function dùng để render ra một table. renderTable thường được dùng kết hợp với component <strong className='text-primary'>TableCell</strong>
                <UIBox>
                    <div style={{ padding: '30px' }}>
                        <div className='tile'>
                            {renderTable({
                                getDataSource: () => list,
                                renderHead: () => (
                                    <tr>
                                        <th>#</th>
                                        <th style={{ width: '100%' }}>Họ và tên</th>
                                        <th>Ngày sinh</th>
                                        <th>Số điện thoại</th>
                                        <th>Hình ảnh</th>
                                        <th>Kích hoạt</th>
                                        <th>Thao tác</th>
                                    </tr>
                                ),
                                renderRow: (item, index) => (
                                    <tr key={index}>
                                        <TableCell type='number' content={index + 1} />
                                        <TableCell type='link' content={item.name} onClick={() => { }} />
                                        <TableCell type='date' content={item.birthday} dateFormat='dd/mm/yyyy' />
                                        <TableCell type='text' content={item.phone} />
                                        <TableCell type='image' content={item.image} />
                                        <TableCell type='checkbox' content={item.active} />
                                        <TableCell type='buttons' onEdit={() => { }} onDelete={() => { }} permission={{ write: true, delete: true }} />
                                    </tr>
                                )
                            })}
                        </div>
                    </div>
                </UIBox>
                <br />
                Đoạn code dùng để tạo ra một table mới theo function <strong className='text-primary'>renderTable</strong>:
                <CodeEditor value={this.state.code} readOnly />
                <br />
                Function <strong className='text-primary'>renderTable</strong> có dạng như sau:
                <CodeEditor value={this.state.functionRenderTable} readOnly />
                <br />
                Trong đó:
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Props</th>
                            <th style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>Mặc định</th>
                            <th>Mô tả</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className='text-warning'>style</td>
                            <td className='text-center'>{'\'\''}</td>
                            <td className='text-justify'>
                                Bổ sung <strong>thêm style</strong> cho table
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>className</td>
                            <td className='text-center'>{'\'\''}</td>
                            <td className='text-justify'>
                                Bổ sung <strong>thêm class</strong> cho table
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>getDataSource</td>
                            <td className='text-center'>{'() => null'}</td>
                            <td className='text-justify'>
                                Function trả về danh sách <strong>các phần tử được render trong hàng</strong>. Khi giá trị trả về là <span className='text-primary'>null </span>
                                thì function <strong className='text-primary'>renderTable</strong> sẽ trả về element dạng loanding với đoạn text được định nghĩa trong field <strong className='text-primary'>loadingText</strong><br />
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>loadingText</td>
                            <td className='text-center' style={{ whiteSpace: 'nowrap' }}>Đang tải...</td>
                            <td className='text-justify'>
                                Định nghĩa <strong>đoạn chữ thông báo</strong> khi table ở trạng thái loading
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>stickyHead</td>
                            <td className='text-center'>false</td>
                            <td className='text-justify'>
                                Quy định <strong>phần header của table có được sticky hay không</strong>
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>emptyTable</td>
                            <td className='text-center' style={{ whiteSpace: 'nowrap' }}>Chưa có dữ liệu!</td>
                            <td className='text-justify'>
                                Định nghĩa <strong>đoạn chữ thông báo</strong> khi table không có dữ liệu
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>renderHead</td>
                            <td className='text-center'>{'() => null'}</td>
                            <td className='text-justify'>
                                Function trả về <strong>element render ra header của table</strong>
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>renderRow</td>
                            <td className='text-center'>{'() => null'}</td>
                            <td className='text-justify'>
                                Function trả về <strong>element render ra các hàng của table</strong>
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>header</td>
                            <td className='text-center'>thead-dark</td>
                            <td className='text-justify'>
                                Định nghĩa <strong>className</strong> cho phần header của table<br />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className='tile'>
                <strong className='text-primary'>renderTable</strong> ở trạng thái loading và khi không có dữ liệu
                <UIBox>
                    <div style={{ padding: '30px' }}>
                        <div className='tile'>
                            {renderTable({
                                getDataSource: () => [],
                                emptyTable: 'Không có dữ liệu trong bảng'
                            })}
                        </div>

                        <div className='tile' style={{ position: 'relative' }}>
                            {renderTable({
                                loadingText: 'Đang tải...'
                            })}
                        </div>
                    </div>
                </UIBox>
                <CodeEditor value={this.state.loadingText} readOnly />
            </div>
            <div className='tile'>
                <strong className='text-primary'>renderTable</strong> với sticky head
                <UIBox>
                    <div style={{ padding: '30px' }}>
                        <div className='tile'>
                            {renderTable({
                                getDataSource: () => list_2, stickyHead: true,
                                renderHead: () => (
                                    <tr>
                                        <th>#</th>
                                        <th style={{ width: '100%' }}>Họ và tên</th>
                                    </tr>
                                ),
                                renderRow: (item, index) => (
                                    <tr key={index}>
                                        <TableCell type='number' content={index + 1} />
                                        <TableCell type='text' content={item} />
                                    </tr>
                                )
                            })}
                        </div>
                    </div>
                </UIBox>
                <CodeEditor value={this.state.stickyText} readOnly />
            </div>
        </>;
    }
}