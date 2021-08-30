import React from 'react'
import Pagination from 'view/component/Pagination';
import { connect } from 'react-redux';
import { getINewsPage, createInews, deleteInews } from './redux';
import { Link } from 'react-router-dom';

class adminINews extends React.Component {
	componentDidMount() {
		T.ready('/user/inews', () => {
			this.props.getINewsPage(1, 50);
		});
	}

	create = (e) => {
		this.props.createInews(data => this.props.history.push('/user/inews/edit/' + data.item.id));
		e.preventDefault();
	}

	delete = (e, item) => {
		e.preventDefault();
		T.confirm('iNews', 'Bạn có chắc bạn muốn xóa iNews này?', 'warning', true, isConfirm =>
			isConfirm && this.props.deleteInews(item.id));
	}

	render() {
		const currentPermission = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
		const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.inews && this.props.inews.page ?
			this.props.inews.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
		let table = 'Không có iNews!';
		if (list.length > 0) {
			table = (
				<table className='table table-hover table-bordered'>
					<thead>
						<tr>
							<th style={{ width: 'auto', textAlign: 'center' }}>#</th>
							<th style={{ width: '100%' }}>Tiêu đề</th>
							<th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} nowrap='true'>Thao tác</th>
						</tr>
					</thead>
					<tbody>
						{list.map((item, index) => (
							<tr key={index}>
								<td style={{ textAlign: 'center' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
								<td>
									<Link to={'/user/inews/edit/' + item.id} data-id={item.id}>{item.title}</Link>
								</td>
								<td className='btn-group w-100 text-center'>
									<Link to={'/user/inews/edit/' + item.id} data-id={item.id} className='btn btn-primary'>
										<i className='fa fa-lg fa-edit' />
									</Link>
									{currentPermission.includes('inews:delete') ?
										<a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
											<i className='fa fa-lg fa-trash' />
										</a> : null}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			);
		}

		return (
			<main className='app-content'>
				<div className='app-title'>
					<h1><i className='fa fa-star' /> iNews: Danh sách</h1>
				</div>
				<div className='tile'>
					{table}
					<Pagination name='inewsPage' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
						getPage={this.props.getINewsPage} />
					{currentPermission.includes('inews:write') ?
						<button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.create}>
							<i className='fa fa-lg fa-plus' />
						</button> : null}
				</div>
			</main>
		);
	}
}

const mapStateToProps = state => ({ system: state.system, inews: state.inews });
const mapActionsToProps = { getINewsPage, createInews, deleteInews };

export default connect(mapStateToProps, mapActionsToProps)(adminINews);