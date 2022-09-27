import React from 'react';
import { TableCell } from 'view/component/AdminPage';
import CodeEditor from '../CodeEditor';
import UIBox from './UIBox';

const simpleType = `import React from 'react';
import { AdminPage, TableCell } from 'view/component/AdminPage';

class ComponentName extends AdminPage {
    state = { checkValue: true, checkValue2: true }
    onSwap = (e, item, isMoveUp) => {
        e.preventDefault();
        T.notify(\`\${item}: \${isMoveUp ? 'Move up!' : 'Move down!'}\`, 'info');
    }
    
    onEdit = (e, item) => {
        e.preventDefault();
        T.notify(\`\${item}: Edit!\`, 'info');
    }
    
    onDelete = (e, item) => {
        e.preventDefault();
        T.confirm('Delete item', \`Are you sure want to delete \${item}\`, 'info', true,
            isConfirm => isConfirm && T.alert('Delete successful!', 'success', false, 800));
    }
    render() {
        const permission = { write: true, delete: true };
        return this.renderPage({
            icon: 'fa fa-user',
            title: 'Title',
            content: <>
                <div className='tile'>
                    <table className='table table-bordered'>
                        <thead>
                        <tr>
                            <th>Type</th>
                            <th>Text (default)</th>
                            <th>Number</th>
                            <th>Date (No dateFormat)</th>
                            <th>Date (dd/mm/yyyy HH:MM)</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <TableCell content='' />
                            <TableCell type='text' content={'Nguyễn Quang Sang'} />
                            <TableCell type='number' content={105000000} />
                            <TableCell type='date' content={new Date()} />
                            <TableCell type='date' content={new Date()} dateFormat='dd/mm/yyyy HH:MM' />
                        </tr>
                        </tbody>
                    </table>
                    
                    <table className='table table-bordered'>
                        <thead>
                        <tr>
                            <th>Type</th>
                            <th>Link (url)</th>
                            <th>Link (function)</th>
                            <th>Image</th>
                            <th>Image (no src, has alt)</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <TableCell content='' />
                            <TableCell type='link' content={'Link to /user'} url={'/user'} />
                            <TableCell type='link' content={'alert("Hello HCMUT!");'} onClick={() => alert('Hello HCMUT!')} />
                            <TableCell type='image' content={'/img/avatar.png'} />
                            <TableCell type='image' alt='Logo image' />
                        </tr>
                        </tbody>
                    </table>
                    
                    <table className='table table-bordered'>
                        <thead>
                        <tr>
                            <th>Type</th>
                            <th>Checkbox</th>
                            <th>Checkbox (onChanged)</th>
                            <th>Buttons (onEdit /user)</th>
                            <th>Buttons (function onEdit)</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <TableCell content='' />
                            <TableCell type='checkbox'
                                       content={this.state.checkValue} onChanged={checkValue => this.setState({ checkValue })} />
                            <TableCell type='checkbox' permission={permission}
                                       content={this.state.checkValue2} onChanged={checkValue2 => this.setState({ checkValue2 })} />
                            <TableCell type='buttons' permission={permission} content={'Demo Item'}
                                       onSwap={this.onSwap} onEdit={'/user'} onDelete={this.onDelete} />
                            <TableCell type='buttons' permission={permission} content={'Demo Item'}
                                       onSwap={this.onSwap} onEdit={this.onEdit} onDelete={this.onDelete} />
                        </tr>
                        </tbody>
                    </table>
                </div>
            </>
        });
    }
}`;

const simpleStyle = `import React from 'react';
import { AdminPage, TableCell } from 'view/component/AdminPage';

class ComponentName extends AdminPage {
    render() {
        return this.renderPage({
            icon: 'fa fa-user',
            title: 'Title',
            content: <>
                <div className='tile'>
                    <table className='table table-bordered'>
                        <thead>
                        <tr>
                            <th style={{ width: 'auto' }}>Type</th>
                            <th style={{ width: '100%', textAlign: 'center' }} colSpan={2}>Text with center alignment</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <TableCell content=''/>
                            <TableCell type='text' style={{ textAlign: 'center' }} content={'By addition style: \{ textAlign: \'center\' \} '}/>
                            <TableCell type='text' className='text-center' content={'By addition className: \'text-center\' '}/>
                        </tr>
                        </tbody>
                    </table>
    
                    <table className='table table-bordered mt-5'>
                        <thead>
                        <tr>
                            <th style={{ width: 'auto' }}>Type</th>
                            <th style={{ width: '50%', textAlign: 'center' }}>Link with text bold, centering</th>
                            <th style={{ width: '50%', textAlign: 'center' }}>Text with text bold and green link, centering</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <TableCell content=''/>
                            <TableCell type='link' className='text-center' style={{ fontWeight: 'bold' }} content={'Nguyễn Quang Sang'} onClick={() => {}}/>
                            <TableCell type='link' className='text-center' style={{ fontWeight: 'bold' }} contentStyle={{ color: 'green' }} content={'Nguyễn Quang Sang'} onClick={() => {}}/>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </>
        });
    }
}`;

const simpleButtons = `import React from 'react';
import { AdminPage, TableCell } from 'view/component/AdminPage';

class ComponentName extends AdminPage {
    onSwap = (e, item, isMoveUp) => {
        e.preventDefault();
        T.notify(\`\${item}: \${isMoveUp ? 'Move up!' : 'Move down!'}\`, 'info');
    }
    
    onEdit = (e, item) => {
        e.preventDefault();
        T.notify(\`\${item}: Edit!\`, 'info');
    }
    
    onDelete = (e, item) => {
        e.preventDefault();
        T.confirm('Delete item', \`Are you sure want to delete \${item}\`, 'info', true,
            isConfirm => isConfirm && T.alert('Delete successful!', 'success', false, 800));
    }
    
    render() {
        const permission = { write: true, delete: true };
        return this.renderPage({
            icon: 'fa fa-user',
            title: 'Title',
            content: <>
                <div className='tile'>
                    <table className='table table-bordered'>
                        <thead>
                        <tr>
                            <th className='text-center' style={{ width: '100%' }}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <TableCell className='text-center' type='buttons' permission={permission} content={'Demo Item'}
                                       onSwap={this.onSwap} onEdit={this.onEdit} onDelete={this.onDelete}>
                                <a className='btn btn-warning' href='#' onClick={e => e.preventDefault()}>
                                    <i className='fa fa-lg fa-calendar'/>
                                </a>
                                <a className='btn btn-dark' href='#' onClick={e => e.preventDefault()}>
                                    Khóa item
                                </a>
                                <a href='#' style={{ backgroundColor: '#107a40', borderColor: '#107a40' }}
                                   className='btn btn-primary' onClick={e => e.preventDefault()}>
                                    <i className='fa fa-lg fa-file-excel-o'/>
                                </a>
                                <a href='#' style={{ backgroundColor: '#185abd', borderColor: '#185abd' }}
                                   className='btn btn-primary' onClick={e => e.preventDefault()}>
                                    <i className='fa fa-lg fa-file-word-o'/>
                                </a>
                                <a href='#' style={{ backgroundColor: '#c43f1d', borderColor: '#c43f1d' }}
                                   className='btn btn-primary' onClick={e => e.preventDefault()}>
                                    <i className='fa fa-lg fa-file-powerpoint-o'/>
                                </a>
                                <a href='#' style={{ backgroundColor: '#b8328d', borderColor: '#b8328d' }}
                                   className='btn btn-primary' onClick={e => e.preventDefault()}>
                                    <i className='fa fa-lg fa-cogs'/>
                                </a>
                                <a href='#' style={{ backgroundColor: '#EC7063', borderColor: '#EC7063' }}
                                   className='btn btn-primary' onClick={e => e.preventDefault()}>
                                    <i className='fa fa-lg fa-medkit'/>
                                </a>
                            </TableCell>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </>
        });
    }
}`;

export default class SectionTableCell extends React.Component {
    state = { simpleType, simpleStyle, simpleButtons, checkValue: true, checkValue2: true }
    onSwap = (e, item, isMoveUp) => {
        e.preventDefault();
        T.notify(`${item}: ${isMoveUp ? 'Move up!' : 'Move down!'}`, 'info');
    }

    onEdit = (e, item) => {
        e.preventDefault();
        T.notify(`${item}: Edit!`, 'info');
    }

    onDelete = (e, item) => {
        e.preventDefault();
        T.confirm('Delete item', `Are you sure want to delete ${item}`, 'info', true,
            isConfirm => isConfirm && T.alert('Delete successful!', 'success', false, 800));
    }

    render() {
        return <>
            <div className='tile'>
                <div className='page-header'>
                    <div className='row'>
                        <div className='col-lg-12'>
                            <h2 className='mb-3 line-head'>TableCell</h2>
                        </div>
                    </div>
                </div>
                <br />
                <strong className='text-primary'>TableCell</strong> dùng để render ra một ô (cell) trong một table. TableCell sẽ được dùng kèm với hàm <strong className='text-primary'>renderTable</strong>
                <UIBox>
                    <div style={{ padding: '30px' }}>
                        <div className='tile'>
                            <table className='table'>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Họ và tên</th>
                                        <th>Ngày sinh</th>
                                        <th>Số điện thoại</th>
                                        <th>Hình ảnh</th>
                                        <th>Kích hoạt</th>
                                        <th>Lần truy cập</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <TableCell type='number' content={1} />
                                        <TableCell type='link' content={'Nguyễn Quang Sang'} onClick={() => { }} />
                                        <TableCell type='date' content={new Date(1997, 0, 9)} dateFormat='dd/mm/yyyy' />
                                        <TableCell type='text' content={'094 835 8166'} />
                                        <TableCell type='image' content={'/img/avatar.png'} />
                                        <TableCell type='checkbox' content={true} />
                                        <TableCell type='number' content={100000} />
                                        <TableCell type='buttons' onEdit={() => { }} onDelete={() => { }} permission={{ write: true, delete: true }} />
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </UIBox>

                <br />
                Các props mà <strong className='text-primary'>TableCell</strong> chấp nhận:
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Props</th>
                            <th style={{ whiteSpace: 'nowrap' }}>Mặc định</th>
                            <th>Mô tả</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className='text-warning'>type</td>
                            <td className='text-center'>text</td>
                            <td className='text-justify'>
                                Quy định <strong>kiểu dữ liệu hiển thị của content</strong> được truyền vào, mặc định là text<br />
                                <span className='text-muted'>Các kiểu dữ liệu bao gồm: number | date | link | image | checkbox | buttons | text</span>
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>content</td>
                            <td className='text-center'>{'\'\''}</td>
                            <td className='text-justify'>
                                Chi tiết <strong>nội dung</strong> cần hiển thị
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>permission</td>
                            <td className='text-center'>{'{}'}</td>
                            <td className='text-justify'>
                                Quy định <strong>quyền hạn thực hiện các thao tác</strong> trong TableCell type buttons<br />
                                <span className='text-muted'>permission là một Object JSON chấp nhận các boolean key: write, delete </span>
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>className</td>
                            <td className='text-center'>{'\'\''}</td>
                            <td className='text-justify'>
                                Bổ sung <strong>thêm class</strong> cho cell<br />
                                <span className='text-muted'>Ví dụ: {'<TableCell className=\'text-danger\' content={\'Nguy hiểm\'} />'}</span>
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>style</td>
                            <td className='text-center'>{'{}'}</td>
                            <td className='text-justify'>
                                Bổ sung <strong>thêm style</strong> cho cell<br />
                                <span className='text-muted'>Ví dụ: {'<TableCell style={{ whiteSpace: \'nowrap\' }} content={\'Một đoạn thông điệp dài, không muốn break line\'} />'}</span>
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>contentStyle</td>
                            <td className='text-center'>{'{}'}</td>
                            <td className='text-justify'>
                                Định nghĩa thêm <strong>style cho thẻ a | Link trong TableCell type link</strong>.
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>alt</td>
                            <td className='text-center'>{'\'\''}</td>
                            <td className='text-justify'>
                                Định nghĩa <strong>thuộc tính alt cho thẻ img trong TableCell type image</strong>
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>display</td>
                            <td className='text-center'>true</td>
                            <td className='text-justify'>
                                Quy định cell này <strong>có được hiển thị hay là không</strong>
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>rowSpan</td>
                            <td className='text-center'>1</td>
                            <td className='text-justify'>
                                Quy định <strong>số lượng cột được gộp vào cell này (merge cell)</strong>
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>dateFormat</td>
                            <td className='text-center'>null</td>
                            <td className='text-justify'>
                                Quy định <strong>định dạng ngày tháng hiển thị ở TableCell type date</strong> theo ý muốn (ví dụ dd/mm/yyyy).
                                Mặc định là không set, TableCell này sẽ in ra định dạng ngày tháng mặc định của hệ thống (month dd, yyyy HH:MM)
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>url</td>
                            <td className='text-center'>null</td>
                            <td className='text-justify'>
                                Định nghĩa <strong>url cho thẻ a | Link trong TableCell type link</strong> khi muốn nội dung hiển thị click vào sẽ đi tới một đường dẫn cụ thể
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>onClick</td>
                            <td className='text-center'>null</td>
                            <td className='text-justify'>
                                Định nghĩa <strong>hàm chức năng cho thẻ a trong TableCell type link</strong> khi muốn nội dung hiển thị click vào sẽ thực hiện một tác vụ tùy chỉnh nào đó
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>onChanged</td>
                            <td className='text-center'>null</td>
                            <td className='text-justify'>
                                Định nghĩa <strong>hàm chức năng cho thẻ input trong TableCell type checkbox</strong> để thực hiện một tác vụ tùy chỉnh nào đó khi toggle checkbox
                                <span className='text-muted'>props onChanged là bắt buộc phải định nghĩa khi sử dụng TableCell type checkbox</span>
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>onSwap</td>
                            <td className='text-center'>null</td>
                            <td className='text-justify'>
                                Định nghĩa <strong>chức năng thay đổi vị trí cho item hiện tại trong TableCell type buttons</strong>.
                                Khi onSwap được định nghĩa và permission.write = true, TableCell sẽ render ra 2 buttons &nbsp;
                                <div className='btn-group'>
                                    <a href='#' className='btn btn-sm btn-warning' onClick={e => e.preventDefault()}><i className='fa fa-arrow-up' /></a>
                                    <a href='#' className='btn btn-sm btn-warning' onClick={e => e.preventDefault()}><i className='fa fa-arrow-down' /></a>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>onEdit</td>
                            <td className='text-center'>null</td>
                            <td className='text-justify'>
                                Định nghĩa <strong>hàm chức năng cập nhật nếu onEdit là function hoặc một đường dẫn tới trang cập nhật nếu onEdit là string cho item hiện tại trong TableCell type buttons</strong>.
                                Khi onEdit được định nghĩa, TableCell sẽ render ra 1 button &nbsp;
                                <div className='btn-group'>
                                    <a href='#' className='btn btn-sm btn-primary' onClick={e => e.preventDefault()}><i className='fa fa-edit' /></a>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td className='text-warning'>onDelete</td>
                            <td className='text-center'>null</td>
                            <td className='text-justify'>
                                Định nghĩa <strong>hàm chức năng xóa cho item hiện tại trong TableCell type buttons</strong>.
                                Khi onDelete được định nghĩa, TableCell sẽ render ra 1 button &nbsp;
                                <div className='btn-group'>
                                    <a href='#' className='btn btn-sm btn-danger' onClick={e => e.preventDefault()}><i className='fa fa-trash' /></a>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className='tile'>
                <h4>Demo</h4>
                Các loại TableCell cơ bản:
                <ul>
                    <li>TableCell dạng text mặc định hiển thị nội dung dạng text căn lề trái</li>
                    <li>TableCell dạng number mặc định hiển thị nội dung dạng chữ số phân chia phần ngàn (1.000.000) và căn lề phải</li>
                    <li>TableCell dạng date mặc định hiển thị nội dung dạng ngày tháng và căn lề trái</li>
                    <li>TableCell dạng link mặc định hiển thị nội dung dạng <a href='#' onClick={e => e.preventDefault()}>link text</a> và căn lề trái</li>
                    <li>TableCell dạng image mặc định hiển thị nội dung dạng hình ảnh với height = 32px và căn giữa</li>
                    <li>TableCell dạng checkbox mặc định hiển thị toggle checkbox và căn giữa</li>
                    <li>TableCell dạng buttons mặc định không hiển thị buttons nào khi không có các props children, onEdit, onDelete, onSwap và các permission tương ứng</li>
                </ul>
                <UIBox>
                    <div style={{ padding: '30px' }}>
                        <div className='tile'>
                            <table className='table table-bordered'>
                                <thead>
                                    <tr>
                                        <th style={{ width: 'auto' }}>Type</th>
                                        <th style={{ width: '25%' }}>Text (default)</th>
                                        <th style={{ width: '25%' }}>Number</th>
                                        <th style={{ width: '25%' }}>Date (No dateFormat)</th>
                                        <th style={{ width: '25%' }}>Date (dd/mm/yyyy HH:MM)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <TableCell content='' />
                                        <TableCell type='text' content={'Nguyễn Quang Sang'} />
                                        <TableCell type='number' content={105000000} />
                                        <TableCell type='date' content={new Date()} />
                                        <TableCell type='date' content={new Date()} dateFormat='dd/mm/yyyy HH:MM' />
                                    </tr>
                                </tbody>
                            </table>

                            <table className='table table-bordered'>
                                <thead>
                                    <tr>
                                        <th style={{ width: 'auto' }}>Type</th>
                                        <th style={{ width: '25%' }}>Link (url)</th>
                                        <th style={{ width: '25%' }}>Link (function)</th>
                                        <th style={{ width: '25%' }}>Image</th>
                                        <th style={{ width: '25%' }}>Image (no src, has alt)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <TableCell content='' />
                                        <TableCell type='link' content={'Link to /user'} url={'/user'} />
                                        <TableCell type='link' content={'alert("Hello HCMUT!");'} onClick={() => alert('Hello HCMUT!')} />
                                        <TableCell type='image' content={'/img/avatar.png'} />
                                        <TableCell type='image' alt='Logo image' />
                                    </tr>
                                </tbody>
                            </table>

                            <table className='table table-bordered'>
                                <thead>
                                    <tr>
                                        <th style={{ width: 'auto' }}>Type</th>
                                        <th style={{ width: '25%' }}>Checkbox (no permission)</th>
                                        <th style={{ width: '25%' }}>Checkbox</th>
                                        <th style={{ width: '25%' }}>Buttons (onEdit /user)</th>
                                        <th style={{ width: '25%' }}>Buttons (function onEdit)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <TableCell content='' />
                                        <TableCell type='checkbox'
                                            content={this.state.checkValue} onChanged={checkValue => this.setState({ checkValue })} />
                                        <TableCell type='checkbox' permission={{ write: true, delete: true }}
                                            content={this.state.checkValue2} onChanged={checkValue2 => this.setState({ checkValue2 })} />
                                        <TableCell type='buttons' permission={{ write: true, delete: true }} content={'Demo Item'}
                                            onSwap={this.onSwap} onEdit={'/user'} onDelete={this.onDelete} />
                                        <TableCell type='buttons' permission={{ write: true, delete: true }} content={'Demo Item'}
                                            onSwap={this.onSwap} onEdit={this.onEdit} onDelete={this.onDelete} />
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </UIBox>
                <CodeEditor value={this.state.simpleType} readOnly />
            </div>
            <div className='tile'>
                <h4>TableCell với className và style tùy chỉnh</h4>
                <UIBox>
                    <div style={{ padding: '30px' }}>
                        <div className='tile'>
                            <table className='table table-bordered'>
                                <thead>
                                    <tr>
                                        <th style={{ width: 'auto' }}>Type</th>
                                        <th style={{ width: '100%', textAlign: 'center' }} colSpan={2}>Text with center alignment</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <TableCell content='' />
                                        <TableCell type='text' style={{ textAlign: 'center' }} content={'By addition style: \{ textAlign: \'center\' \} '} />
                                        <TableCell type='text' className='text-center' content={'By addition className: \'text-center\' '} />
                                    </tr>
                                </tbody>
                            </table>

                            <table className='table table-bordered mt-5'>
                                <thead>
                                    <tr>
                                        <th style={{ width: 'auto' }}>Type</th>
                                        <th style={{ width: '50%', textAlign: 'center' }}>Link with text bold, centering</th>
                                        <th style={{ width: '50%', textAlign: 'center' }}>Text with text bold and green link, centering</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <TableCell content='' />
                                        <TableCell type='link' className='text-center' style={{ fontWeight: 'bold' }} content={'Nguyễn Quang Sang'} onClick={() => { }} />
                                        <TableCell type='link' className='text-center' style={{ fontWeight: 'bold' }} contentStyle={{ color: 'green' }} content={'Nguyễn Quang Sang'} onClick={() => { }} />
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </UIBox>
                <CodeEditor value={this.state.simpleStyle} readOnly />
            </div>
            <div className='tile'>
                <h4>TableCell type buttons với buttons tùy chỉnh</h4>
                <UIBox>
                    <div style={{ padding: '30px' }}>
                        <div className='tile'>
                            <table className='table table-bordered'>
                                <thead>
                                    <tr>
                                        <th className='text-center' style={{ width: '100%' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <TableCell className='text-center' type='buttons' permission={{ write: true, delete: true }} content={'Demo Item'}
                                            onSwap={this.onSwap} onEdit={this.onEdit} onDelete={this.onDelete}>
                                            <a className='btn btn-warning' href='#' onClick={e => e.preventDefault()}>
                                                <i className='fa fa-lg fa-calendar' />
                                            </a>
                                            <a className='btn btn-dark' href='#' onClick={e => e.preventDefault()}>
                                                Khóa item
                                            </a>
                                            <a href='#' style={{ backgroundColor: '#107a40', borderColor: '#107a40' }} className='btn btn-primary' onClick={e => e.preventDefault()}>
                                                <i className='fa fa-lg fa-file-excel-o' />
                                            </a>
                                            <a href='#' style={{ backgroundColor: '#185abd', borderColor: '#185abd' }} className='btn btn-primary' onClick={e => e.preventDefault()}>
                                                <i className='fa fa-lg fa-file-word-o' />
                                            </a>
                                            <a href='#' style={{ backgroundColor: '#c43f1d', borderColor: '#c43f1d' }} className='btn btn-primary' onClick={e => e.preventDefault()}>
                                                <i className='fa fa-lg fa-file-powerpoint-o' />
                                            </a>
                                            <a href='#' style={{ backgroundColor: '#b8328d', borderColor: '#b8328d' }} className='btn btn-primary' onClick={e => e.preventDefault()}>
                                                <i className='fa fa-lg fa-cogs' />
                                            </a>
                                            <a href='#' style={{ backgroundColor: '#EC7063', borderColor: '#EC7063' }} className='btn btn-primary' onClick={e => e.preventDefault()}>
                                                <i className='fa fa-lg fa-medkit' />
                                            </a>
                                        </TableCell>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </UIBox>
                <CodeEditor value={this.state.simpleButtons} readOnly />
            </div>
        </>;
    }
}