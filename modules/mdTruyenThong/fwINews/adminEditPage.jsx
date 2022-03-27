import React from 'react';
import Dropdown from 'view/component/Dropdown';
import { ajaxSelectNews } from '../fwNews/redux';
import { connect } from 'react-redux';
import Editor from 'view/component/CkEditor4';
import { Link } from 'react-router-dom';
import ImageBox from 'view/component/ImageBox';
import { getInews, updateInews, createInewsItem, updateInewsItem, deleteInewsItem, swapinewsItem } from './redux';
import copy from 'copy-to-clipboard';

class EditModal extends React.Component {
	modal = React.createRef();
	type = React.createRef();
	imageBox = React.createRef();
	textEditor = React.createRef();
	newsTitle = React.createRef();
	newsDesc = React.createRef();
	items = ['text', 'image', 'news'];
	state = { type: '', news: null, image: null, item: null };

	componentDidMount() {
		$('#comNews').select2({
			ajax: ajaxSelectNews,
			dropdownParent: $('#comNews').parent().parent(),
			placeholder: 'Chọn bản tin'
		});
		$('#comNews').on('select2:select', (e) => {
			this.setState({ news: JSON.parse(e.target.value) });
			let lang = $('#comNewsLang').is(':checked') ? 'vi' : 'en';
			this.newsTitle.current.html(JSON.parse(this.state.news.title)[lang]);
			this.newsDesc.current.html(JSON.parse(this.state.news.abstract)[lang]);
		});
		$('#comWidth').select2({
			placeholder: 'Chọn độ rộng',
			dropdownParent: $('#comWidth').parent().parent()
		});
	}

	show = (item, index) => {
		$('#comNewsParent').css('display', 'none');
		$('#comImageParent').css('display', 'none');
		let { width, type, lang, payload, display, id } = item || { width: null, title: '', type: '', lang: 'vi', payload: '', display: { title: '', abstract: '' }, id: '' };

		this.setState({ type: type });
		display = item && type != 'text' ? JSON.parse(display) : display;
		this.newsTitle.current && display && this.newsTitle.current.html(display.title);
		this.newsDesc.current && display && this.newsDesc.current.html(display.abstract);
		if (type === 'text') {
			setTimeout(() => this.textEditor.current.html(display), 250);
		} else if (type === 'news') {
			this.setState({ news: JSON.parse(payload) });
		} else if (type == 'image') {
			this.imageBox.current.setData('iNews:' + ((item && id) ? (id + '_' + new Date().getTime()) : 'fnew'), payload);
		}

		$('#comNewsLang').prop('checked', lang === 'vi' ? true : false);
		$('#comWidth').val(width).trigger('change');
		this.setState({ item });
		$(this.modal.current).data({ 'data-item-index': index !== null ? index : -1 }).modal('show');
	};

	changeLang = () => {
		let lang = $('#comNewsLang').is(':checked') ? 'vi' : 'en';
		this.newsTitle.current.html(JSON.parse(this.state.news.title)[lang]);
		this.newsDesc.current.html(JSON.parse(this.state.news.abstract)[lang]);
	}

	save = (e) => {
		e.preventDefault();
		const width = $('#comWidth').val();
		const data = this.state.item || {};
		data.width = width;

		if (this.state.type === 'text') {
			const text = this.textEditor.current.text();
			const html = this.textEditor.current.html();
			data.payload = text;
			data.display = html;
			data.type = 'text';

		} else if (this.state.type === 'image') {
			const image = this.imageBox.current.getImage();
			data.payload = image;
			data.type = 'image';
		} else if (this.state.type === 'news') {
			const lang = $('#comNewsLang').is(':checked') ? 'vi' : 'en';
			data.payload = JSON.stringify({ ...this.state.news });
			let temp = {
				title: this.newsTitle.current.html(),
				abstract: this.newsDesc.current.html()
			};
			data.display = JSON.stringify(temp);
			data.type = 'news';
			data.lang = lang;
		}

		if (!width) {
			$('#comWidth').focus();
		} else if (!data.payload) {
			if (data.type === 'image') {
				$('#comImage').focus();
			} else if (data.type === 'news') {
				$('#comNews').select2('focus');
			}
		} else {
			const isUpdated = !!this.state.item;
			const index = $(this.modal.current).data('data-item-index');
			if (isUpdated)
				this.props.edit(e, data, index);
			else
				this.props.add(e, data);
			$(this.modal.current).modal('hide');
		}
	}

	render() {
		let data = '';
		const permissionWrite = this.props.permissionWrite;
		if (this.state.type === 'text') {
			$('#comNewsParent').css('display', 'none');
			$('#comImageParent').css('display', 'none');
			data =
				<div className='form-group'>
					<label htmlFor='comText'>Nội dung</label>
					<Editor ref={this.textEditor} placeholder='Nội dung' height={150} />
				</div>;
		} else if (this.state.type === 'image') {
			$('#comNewsParent').css('display', 'none');
			$('#comImageParent').css('display', 'block');
		} else if (this.state.type === 'news') {
			$('#comImageParent').css('display', 'none');
			$('#comNewsParent').css('display', 'block');
		}
		return (
			<div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
				<div className='modal-dialog modal-lg' role='document'>
					<div className='modal-content'>
						<div className='modal-header'>
							<h5 className='modal-title'>Danh mục</h5>
							<button type='button' className='close' data-dismiss='modal' aria-label='Close'>
								<span aria-hidden='true'>&times;</span>
							</button>
						</div>
						<div className='modal-body'>
							<div className='form-group'>
								<label htmlFor='comWidth'>Độ rộng</label>
								<select className='form-control' id='comWidth' readOnly={!permissionWrite}>
									<option value='1'>1</option>
									<option value='2'>2</option>
									<option value='3'>3</option>
									<option value='4'>4</option>
									<option value='5'>5</option>
									<option value='6'>6</option>
									<option value='7'>7</option>
									<option value='8'>8</option>
									<option value='9'>9</option>
									<option value='10'>10</option>
									<option value='11'>11</option>
									<option value='12'>12</option>
								</select>
								<small>Độ rộng của thành phần</small>
							</div>
							<div className='form-group'>
								<div style={{ display: 'inline-flex' }}>
									<label>Loại thành phần:</label>&nbsp;&nbsp;
									<Dropdown ref={this.type} text={this.state.type} items={this.items} onSelected={value => this.setState({ type: value })} />
								</div>
							</div>
							{data}
							<div className='form-group' id='comImageParent' style={{ display: 'none' }}>
								<label htmlFor='comImage'>Hình ảnh</label>
								<ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='INewsImage' />
							</div>
							<div className='form-group' id='comNewsParent' style={{ display: 'none' }}>
								<label htmlFor='comNews'>Bản tin</label>
								<select className='form-control mb-2' id='comNews' />
								<div className='d-flex mt-3'>
									<label className='control-label'>Tiếng Việt: &nbsp;</label>
									<div className='toggle'>
										<label>
											<input type='checkbox' id='comNewsLang' onChange={this.changeLang} />
											<span className='button-indecator' />
										</label>
									</div>
								</div>
								{this.state.news &&
									(
										<>
											<div className='form-group'>
												<label>Tiêu đề:</label>
												<Editor ref={this.newsTitle} placeholder='Tiêu đề' height={100} />
											</div>
											<div className='form-group'>
												<label>Tóm tắt:</label>
												<Editor ref={this.newsDesc} placeholder='Mô tả' height={100} />
											</div>
										</>
									)}
							</div>
						</div>
						<div className='modal-footer'>
							<a href='#' type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</a>
							{permissionWrite ? <a href='#' type='button' className='btn btn-success' onClick={e => this.save(e)}>Lưu</a> : ''}
						</div>
					</div>
				</div>
			</div>
		);
	}
}
class TypeEmail extends React.Component {
	state = {};
	modal = React.createRef();

	show = (item) => {
		this.setState(item);
		$(this.modal.current).modal('show');
		$('#typeEmail').val('');
	}
	send = () => {
		const typeEmail = $('#typeEmail').val();
		if (!typeEmail) {
			T.notify('Vui lòng nhập email.', 'danger');
		} else if (!T.validateEmail(typeEmail)) {
			T.notify('Email không chính xác, vui lòng kiểm tra lại.', 'danger');
		} else {
			$(this.modal.current).modal('hide');
			this.props.send(typeEmail);
		}
	}

	render() {
		return (
			<div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
				<div className='modal-dialog modal-lg' role='document'>
					<div className='modal-content'>
						<div className='modal-header'>
							<h5 className='modal-title'>Nhập email cần gửi</h5>
							<button type='button' className='close' data-dismiss='modal' aria-label='Close'>
								<span aria-hidden='true'>&times;</span>
							</button>
						</div>
						<div className='modal-body'>
							<div className='form-group'>
								<label htmlFor='typeEmail'>Email:</label>
								<input type='text' name='typeEmail' autoComplete='off' id='typeEmail' className='form-control' />
							</div>
						</div>
						<div className='modal-footer'>
							<button type='button' className='btn btn-primary' onClick={this.send}>Gửi</button>
							<button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

class adminINewsEdit extends React.Component {
	modal = React.createRef();
	editor = React.createRef();
	typeEmail = React.createRef();
	state = { iNewsComs: [], inewsId: '', sending: false };

	componentDidMount() {
		T.ready('/user/ocer', () => {
			const route = T.routeMatcher('/user/inews/edit/:id'),
				id = route.parse(window.location.pathname).id;
			this.props.getInews(id, (item, list) => {
				$('#iNewsTitle').val(item.title);
				this.setState({ iNewsComs: list.reverse(), inewsId: id });
			});
		});
	}

	addItem = (e, item) => {
		e.preventDefault();
		this.props.createInewsItem(this.state.inewsId, item, data => {
			let iNewsComs = [...this.state.iNewsComs];
			iNewsComs.push(data);
			this.setState(({ iNewsComs }));
		});
	}

	editItem = (e, item, index) => {
		e.preventDefault();
		this.props.updateInewsItem(item, data => {
			let iNewsComs = [...this.state.iNewsComs];
			if (index !== -1) {
				iNewsComs[index] = data;
			}
			this.setState({ iNewsComs });
		});
	}

	showItem = (e, item, index) => {
		this.modal.current.show(item, index);
		e.preventDefault();
	}

	deleteItem = (e, item, index) => {
		e.preventDefault();
		T.confirm('Xóa phần iNews', 'Bạn có chắc bạn muốn xóa phần iNews này?', true, isConfirm => {
			if (isConfirm) {
				this.props.deleteInewsItem(item, () => {
					let temp = [...this.state.iNewsComs];
					temp.splice(index, 1);
					this.setState({ iNewsComs: temp });
				});
			}
		});
	}

	swapItem = (e, id, index, isMoveUp) => {
		this.props.swapinewsItem(id, this.state.inewsId, isMoveUp, () => {
			let temp = [...this.state.iNewsComs];
			let current = this.state.iNewsComs[index] || null;
			let toChange = null;
			if (isMoveUp) {
				toChange = this.state.iNewsComs[index + 1] || null;
			} else {
				toChange = this.state.iNewsComs[index - 1] || null;
			}
			if (current && toChange) {
				temp[index] = toChange;
				temp[isMoveUp ? index + 1 : index - 1] = current;
				this.setState({ iNewsComs: temp });
				T.notify('Thay đổi thứ tự item thành công', 'success');
			}
		});
		e.preventDefault();
	}

	renderINews = () => {
		let result = '';
		let widthCount = 0;
		let innerBlock = '';
		let attachments = [];
		this.state.iNewsComs.map((item, index) => {
			if (parseInt(widthCount) + parseInt(item.width) > 12) {
				widthCount = 0;
				result += `
					<tr>
						<table style = 'width: 100%; table-layout: fixed;'>
							<tbody>
								<tr>${innerBlock}</tr>
							</tbody>
						</table>
					</tr>`;
				innerBlock = '';
			}

			if (item.type === 'text') {
				innerBlock += `
					<td style='width: ${(item.width / 12) * 100}%; padding: 0 0.25rem 0 0.25rem;'>
						${item.display}
					</td>`;
				widthCount += item.width;
			} else if (item.type === 'image') {
				T.debug && attachments.push({
					filename: item.payload.split('/').slice(-1)[0],
					path: T.rootUrl + item.payload,
					cid: T.rootUrl + item.payload
				});
				innerBlock += `
					<td style='width: ${(item.width / 12) * 100}%; padding: 0 0.25rem 0 0.25rem;'>
						<img src='${T.rootUrl + item.payload}' width='100%' style='margin-bottom: 0.75rem; align-self: center;' alt='img'/>
					</td>`;
				widthCount += item.width;
			} else if (item.type === 'news') {
				const payload = JSON.parse(item.payload);
				const link = T.rootUrl + (payload.link ? '/tin-tuc/' + payload.link : '/news/item/' + payload.id);
				const display = JSON.parse(item.display);
				T.debug && attachments.push({
					filename: payload.image.split('/').slice(-1)[0],
					path: T.rootUrl + payload.image,
					cid: T.rootUrl + payload.image
				});

				innerBlock += `
					<td style='width: ${(item.width / 12) * 100}%; vertical-align:top;'>
						<a href='${link}' target='_blank' style='text-transform: uppercase; font-weight: bold; color: #16387C; text-decoration: none; margin-bottom: 0.75rem; text-align: center; padding: 0 0.25rem 0 0.25rem;'>${display.title}</a>
					 	<img src='${T.rootUrl + payload.image}' width='100%' style='margin-bottom: 0.75rem; align-self: center;' alt='img'/>
					 	<div style='text-align: justify; padding: 0 0.25rem 0 0.25rem;'>
					 		${display.abstract}
					 		<p style='margin: 0; text-align: right'><a target='_blank' href='${link}' style='text-decoration: none; color: #16387C';>${item.lang === 'vi' ? 'Xem tiếp' : 'See more'}</a></p>
					 	</div>
					</td>`;
				widthCount += item.width;
			}
			if (index === this.state.iNewsComs.length - 1) {
				result += `
					<tr>
						<table style = 'width: 100%; table-layout: fixed;'>
							<tbody>
								<tr>${innerBlock}</tr>
							</tbody>
						</table>
					</tr>`;
			}
		});

		const html = `
			<table style = 'margin-left: auto; margin-right: auto;width: 100%; table-layout: fixed;'>
				<tbody>
					${result}
				</tbody>
			</table>`;
		return { attachments, html };
	}
	openTypeEmailModal = () => {
		this.typeEmail.current.show();
	}
	copyClipboard = () => {
		let { html } = this.renderINews();
		copy(html);
	}

	send = (mailTo) => {
		let { html, attachments } = this.renderINews();
		let title = $('#iNewsTitle').val();
		if (!title) {
			$('#iNewsTitle').focus();
		} else {
			T.notify('Email đang được gửi, vui lòng chờ', 'info');
			this.setState({ sending: true });
			T.post('/api/inews/test', {
				mailFrom: null,
				mailFromPassword: null,
				mailTo,
				mailSubject: title,
				mailHtml: html,
				mailAttachments: attachments
			}, () => {
				T.notify('Newsletter được gửi thành công', 'success');
				this.setState({ sending: false });
			});
		}
	}

	preview = () => {
		let html = this.renderINews().html;
		html = `<div style='margin-left: auto; margin-right: auto; width: 100%'>${html}</div>`.replace(/cid:/g, '');
		let wnd = window.open('about:blank', '', '_blank');
		wnd.document.write(html);
	}

	save = () => {
		let title = $('#iNewsTitle').val();
		if (!title) {
			$('#iNewsTitle').focus();
		} else {
			this.props.updateInews(this.state.inewsId, { title });
		}
	}

	render() {
		let iNewsView = 'Không có thành phần';
		const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
		const permissionWrite = currentPermissions.includes('inews:write'),
			permissionRead = currentPermissions.includes('inews:read');
		// permissionDelete = currentPermissions.includes('inews:delete');
		if (this.state.iNewsComs.length > 0) {
			iNewsView =
				<div className='row'>
					{this.state.iNewsComs.map((item, index) => {
						if (item.type === 'text') {
							return (
								<div key={index} className={`col-${item.width} show-on-hover`} style={{ minHeight: 100, wordBreak: 'break-word' }}>
									<p dangerouslySetInnerHTML={{ __html: item.display }} />
									{permissionWrite ?
										<div className='buttons btn-group btn-group-sm'>
											<a className='btn btn-success' href='#' onClick={e => this.swapItem(e, item.id, index, false)}>
												<i className='fa fa-lg fa-arrow-up' />
											</a>
											<a className='btn btn-success' href='#' onClick={e => this.swapItem(e, item.id, index, true)}>
												<i className='fa fa-lg fa-arrow-down' />
											</a>
											<a href='#' className='btn btn-primary' onClick={e => this.showItem(e, item, index)}>
												<i className='fa fa-lg fa-edit' />
											</a>
											<a className='btn btn-danger' href='#' onClick={e => this.deleteItem(e, item, index)}>
												<i className='fa fa-lg fa-trash' />
											</a>
										</div>
										: ''}
								</div>
							);
						} else if (item.type === 'news') {
							const display = JSON.parse(item.display);
							const payload = JSON.parse(item.payload);
							return (
								<div key={index} className={`col-${item.width} d-flex flex-column align-items-center justify-content-flex-start show-on-hover`} style={{ minHeight: 100, wordBreak: 'break-word' }}>
									<div style={{ height: '80px' }}><p dangerouslySetInnerHTML={{ __html: display.title }} /></div>
									<img src={payload.image} width='100%' />
									<div className='text-justify'><p dangerouslySetInnerHTML={{ __html: display.abstract }} /></div>
									{permissionWrite ?
										<div className='buttons btn-group btn-group-sm'>
											<a className='btn btn-success' href='#' onClick={e => this.swapItem(e, item.id, index, false)}>
												<i className='fa fa-lg fa-arrow-up' />
											</a>
											<a className='btn btn-success' href='#' onClick={e => this.swapItem(e, item.id, index, true)}>
												<i className='fa fa-lg fa-arrow-down' />
											</a>
											<a href='#' className='btn btn-primary' onClick={e => this.showItem(e, item, index)}>
												<i className='fa fa-lg fa-edit' />
											</a>
											<a className='btn btn-danger' href='#' onClick={e => this.deleteItem(e, item, index)}>
												<i className='fa fa-lg fa-trash' />
											</a>
										</div>
										: ''}
								</div>
							);
						} else if (item.type === 'image') {
							return (
								<div key={index} className={`col-${item.width} show-on-hover`} style={{ minHeight: 100, wordBreak: 'break-word' }}>
									<img src={item.payload} width='100%' />
									{permissionWrite ?
										<div className='buttons btn-group btn-group-sm'>
											<a className='btn btn-success' href='#' onClick={e => this.swapItem(e, item.id, index, false)}>
												<i className='fa fa-lg fa-arrow-up' />
											</a>
											<a className='btn btn-success' href='#' onClick={e => this.swapItem(e, item.id, index, true)}>
												<i className='fa fa-lg fa-arrow-down' />
											</a>
											<a href='#' className='btn btn-primary' onClick={e => this.showItem(e, item, index)}>
												<i className='fa fa-lg fa-edit' />
											</a>
											<a className='btn btn-danger' href='#' onClick={e => this.deleteItem(e, item, index)}>
												<i className='fa fa-lg fa-trash' />
											</a>
										</div>
										: ''}
								</div>
							);
						}
					})}
				</div>;
		}
		return (
			<div className='app-content'>
				<div className='app-title'>
					<h1><i className='fa fa-newspaper-o' /> iNews</h1>
				</div>
				<div className='tile'>
					<div className='tile-title'>Thông tin chung:</div>
					<div className='form-group'>
						<label htmlFor='iNewsTitle'>Tiêu đề:</label>
						<input type='text' name='iNewsTitle' id='iNewsTitle' className='form-control' readOnly={!permissionWrite} />
					</div>

					{/* <div className='form-group'>
						<label htmlFor='iNewsWidth'>Độ rộng iNews:</label>
						<input type='number' name='iNewsWidth' id='iNewsWidth' className='form-control' defaultValue={600} />
						<small>Đơn vị: pixel</small>
					</div> */}
					<div className='tile-footer'>
						<div className='row'>
							<div className='col-md-12 d-flex justify-content-between'>
								<div>
									{permissionRead ?
										<button className='btn btn-success mr-3' type='button' onClick={this.preview}>
											<i className='fa fa-fw fa-lg fa-newspaper-o'></i>Xem trước
										</button> : ''}
									{/* {permissionRead ?
										<button className='btn btn-warning' type='button' onClick={this.copyClipboard} disabled={this.state.sending}>
											<i className='fa fa-fw fa-lg fa-paper-plane-o'></i>Sao chép
										</button> : ''} */}
									{permissionRead ?
										<button className='btn btn-primary' type='button' onClick={this.openTypeEmailModal} disabled={this.state.sending}>
											<i className='fa fa-fw fa-lg fa-paper-plane-o'></i>Gửi thư
										</button> : ''}

								</div>
								{permissionWrite ?
									<button className='btn btn-success' type='button' onClick={this.save}>
										<i className='fa fa-fw fa-lg fa-save'></i>Lưu
									</button> : ''}
							</div>
						</div>
					</div>
				</div>
				<div className='tile'>
					<div className='tile-title'>Nội dung iNews:</div>
					<div className='tile-body'>
						<div className='form-group'>
							<label className='control-label'></label>
							<div className='component p-2'>
								{iNewsView}
								{permissionWrite ? <a href='#' className='btn btn-primary' onClick={e => this.showItem(e)}>+</a> : ''}
							</div>
						</div>
					</div>
				</div>
				<Link to={'/user/inews'} className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
					<i className='fa fa-lg fa-reply' />
				</Link>
				<TypeEmail ref={this.typeEmail} send={this.send} />
				<EditModal ref={this.modal} add={this.addItem} edit={this.editItem} permissionWrite={permissionWrite} />
			</div>
		);
	}
}

const mapStateToProps = state => ({ system: state.system, inews: state.inews });
const mapActionsToProps = { getInews, updateInews, createInewsItem, updateInewsItem, deleteInewsItem, swapinewsItem };

export default connect(mapStateToProps, mapActionsToProps)(adminINewsEdit);