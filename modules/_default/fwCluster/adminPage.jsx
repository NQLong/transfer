import React from 'react';
import { connect } from 'react-redux';
import { getClusterAll, createCluster, resetCluster, deleteCluster, applyServiceImage, deleteServiceImage, watchLogs, unWatchLogs, getAllLogs } from './redux';
import { AdminPage, FormTabs, TableCell, renderTable, FormSelect, getValue } from 'view/component/AdminPage';

const parseImageFilename = (filename) => {
  const texts = filename.split('-');
  let date = texts.length >= 1 ? texts[0] : null,
    time = texts.length >= 2 ? texts[1] : null,
    version = texts.length >= 3 ? texts[2] : '?';
  if (date && date.length == 8) date = date.substring(0, 4) + '/' + date.substring(4, 6) + '/' + date.substring(6, 8);
  if (time && time.length == 4) time = time.substring(0, 2) + ' ' + date.substring(2, 4);
  if (version.endsWith('.zip')) version = version.substring(0, version.length - 4);
  return { version, date: date ? date + ':' + time : '?' };
};

class ClusterPage extends AdminPage {
  state = { selectedServiceName: 'main', contentLog: '', listLogs: [], isLoading: false };
  logs = {};
  content = {};
  logLength = 0;
  isWaitingViewLog = true;
  isGetLogFromSocket = true;
  preData = '';
  componentDidMount() {
    T.ready();
    this.props.getClusterAll();
    this.props.getAllLogs((data => {
      const tmpListLogs = data.reduce(((arr, log) => {
        const { outLog, errLog } = log;
        return [...arr, { id: outLog.path, text: outLog.name }, { id: errLog.path, text: errLog.name }];
      }), []);
      this.setState({ listLogs: tmpListLogs });
    }));
    T.socket.on('services-changed', () => this.props.getClusterAll());
    T.socket.on('tail-log', (rs) => {
      const serviceName = this.state.selectedServiceName;
      const key = getValue(this.logs[serviceName]);
      const { datas } = rs;
      if (datas[key] && !this.isWaitingViewLog) {
        if (datas[key] === this.preData) return;
        this.preData = datas[key];
        this.logLength += datas[key].split('\n').length;
        const tmpContentLog = this.state.contentLog.concat(`\n${datas[key]}`);
        this.setState({ contentLog: tmpContentLog, isLoading: false }, () => {
          this.content[serviceName].scrollTo({ top: this.content[serviceName].scrollHeight });
        });
      }
    });
  }

  componentWillUnmount() {
    T.socket.off('services-changed');
    T.socket.off('tail-log');
  }

  viewLog = (path) => {
    this.logLength = 0;
    this.isWaitingViewLog = true;
    this.setState({ contentLog: '', isLoading: true }, () => {
      this.props.watchLogs(path, 0, () => {
        this.isWaitingViewLog = false;
      });
    });
  }

  // scrollLog = (path) => {

  // }

  onServiceTabChanged = (data, serviceNames) => data && data.tabIndex != null && serviceNames[data.tabIndex] &&
    this.setState({ selectedServiceName: serviceNames[data.tabIndex], contentLog: ''});

  resetCluster = (e, serviceName, item) => e.preventDefault() || T.confirm('Reset cluster', `Are you sure you want to reset cluster ${serviceName}:${item.pid}?`, true, isConfirm =>
    isConfirm && this.props.resetCluster(serviceName, item.pid));
  deleteCluster = (e, serviceName, item) => e.preventDefault() || T.confirm('Delete cluster', `Are you sure you want to delete cluster ${serviceName}:${item.pid}?`, true, isConfirm =>
    isConfirm && this.props.deleteCluster(serviceName, item.pid));

  onRefresh = (e) => e.preventDefault() || this.props.getClusterAll();

  applyServiceImage = (e, serviceName, item) => {
    e.preventDefault();
    let applyButton = $(e.target);
    if (applyButton.is('i')) applyButton = applyButton.parent();
    const deleteButton = applyButton.next();
    T.confirm('Apply cluster', `Are you sure you want to apply image ${serviceName}:${item.filename}?`, true, isConfirm => {
      if (isConfirm) {
        applyButton.fadeOut();
        deleteButton.fadeOut();
        this.props.applyServiceImage(serviceName, item.filename, () => {
          applyButton.fadeIn();
          deleteButton.fadeIn();
        });
      }
    });
  }
  deleteServiceImage = (e, serviceName, item) => e.preventDefault() || T.confirm('Delete image', `Are you sure you want to delete image ${serviceName}:${item.filename}?`, true,
    isConfirm => isConfirm && this.props.deleteServiceImage(serviceName, item.filename));


  renderServiceClusters = (permission, service, serviceName) => renderTable({
    getDataSource: () => (service.clusters || []).sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()),
    renderHead: () => (
      <tr>
        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
        <th style={{ width: 'auto', textAlign: 'center' }}>Id</th>
        <th style={{ width: '100%', textAlign: 'center' }} nowrap='true'>Version</th>
        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Primary</th>
        {/* <th style={{ width: 'auto' }} nowrap='true'>Image filename</th> */}
        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Image date</th>
        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Start date</th>
        <th style={{ width: 'auto', textAlign: 'center' }}>Status</th>
        <th style={{ width: 'auto', textAlign: 'center' }}>Actions</th>
      </tr>),
    renderRow: (item, index) => (
      <tr key={index}>
        <TableCell type='number' content={index + 1} />
        <TableCell type='text' style={{ textAlign: 'center' }} content={item.pid} />
        <TableCell type='text' style={{ textAlign: 'center' }} content={item.version} />
        <TableCell type='text' style={{ textAlign: 'center' }} className='text-danger' content={item.primaryWorker ? <i className='fa fa-star' /> : ''} />
        {/* <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.imageInfo} /> */}
        <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={parseImageFilename(item.imageInfo).date} />
        <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={new Date(item.createdDate).getShortText()} />
        <TableCell type='text' className={item.status == 'running' ? 'text-primary' : 'text-danger'} content={item.status} />
        <TableCell type='buttons' content={item} style={{ textAlign: 'center' }} permission={permission} onDelete={e => this.deleteCluster(e, serviceName, item)}>
          {permission.write &&
            <a className='btn btn-success' href='#' onClick={e => this.resetCluster(e, serviceName, item)}>
              <i className='fa fa-lg fa-refresh' />
            </a>}
        </TableCell>
      </tr>),
  });

  renderServiceImages = (permission, service, serviceName) => renderTable({
    getDataSource: () => (service.images || []).sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()),
    renderHead: () => (
      <tr>
        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
        <th style={{ width: '100%', textAlign: 'center' }} nowrap='true'>Version</th>
        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>File</th>
        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Created date</th>
        <th style={{ width: 'auto', textAlign: 'center' }}>Actions</th>
      </tr>),
    renderRow: (item, index) => (
      <tr key={index}>
        <TableCell type='number' content={index + 1} />
        <TableCell type='text' style={{ textAlign: 'center' }} content={parseImageFilename(item.filename).version} />
        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.filename} />
        <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={new Date(item.createdDate).getShortText()} />
        <TableCell type='buttons' content={item} style={{ textAlign: 'center' }} permission={permission} onDelete={e => this.deleteServiceImage(e, serviceName, item)}>
          {permission.write &&
            <a className='btn btn-success' href='#' onClick={e => this.applyServiceImage(e, serviceName, item)}>
              <i className='fa fa-lg fa-arrow-up' />
            </a>}
        </TableCell>
      </tr>),
  });


  render() {
    const permission = this.getUserPermission('cluster');
    const services = (this.props.cluster || {});
    const serviceNames = [];
    Object.keys(services).sort((a, b) => a > b ? +1 : -1).forEach(serviceName => serviceName != 'main' && serviceNames.push(serviceName));
    services.main && serviceNames.unshift('main');
    const tmpListLogs = [...this.state.listLogs];
    const listLogs = {
      'main': [],
    };
    let removedCount = 0;
    this.state.listLogs.forEach((log, idx) => {
      serviceNames.forEach(name => {
        if (log.text.includes(name)) {
          const isService = tmpListLogs.splice(idx - removedCount, 1);
          removedCount++;
          if (!listLogs[name]) listLogs[name] = [];
          listLogs[name].push(isService[0]);
        }
      });
    });
    listLogs['main'] = tmpListLogs;

    const tabs = serviceNames.map(serviceName => {
      const service = services[serviceName],
        title = serviceName.upFirstChar(),
        component = (
          <div className='tile'>
            <h3 className='tile-title'>Clusters</h3>
            <div className='tile-body'>
              {this.renderServiceClusters(permission, service, serviceName)}
            </div>

            <h3 className='tile-title mt-4'>Images</h3>
            <div className='tile-body'>
              {this.renderServiceImages(permission, service, serviceName)}
            </div>
            <h3 className='tile-title mt-4'>Logs
              <button className='btn btn-warning' type='button' style={{ float: 'right' }}>
                <i className='fa fa-fw fa-lg fa-refresh' />Refresh logs
              </button>
            </h3>
            <FormSelect style={{ width: 300 }} ref={e => this.logs[serviceName] = e} label='Lựa chọn log' data={listLogs[serviceName]} onChange={data => this.viewLog(data.id)} />
            <div className='tile-body'>
              <div style={{ overflow: 'auto', height: '300px', backgroundColor: '#000000', color: '#ffffff' }} ref={e => this.content[serviceName] = e}>
                <p style={{ padding: '0px 16px', whiteSpace: 'break-spaces' }}>{this.state.contentLog}</p>
                {this.state.isLoading && <p style={{ padding: '0px 16px' }}>Loading...</p>}
              </div>
            </div>
          </div>);
      return { title, component };
    });

    return this.renderPage({
      icon: 'fa fa-braille',
      title: 'Cluster',
      breadcrumb: ['Cluster'],
      content: <FormTabs id='clusterTab' tabs={tabs} onChange={data => this.onServiceTabChanged(data, serviceNames)} />,
      onCreate: () => permission.write && this.state.selectedServiceName ? this.props.createCluster(this.state.selectedServiceName) : null,
      onRefresh: permission.write ? this.onRefresh : null,
    });
  }
}

const mapStateToProps = state => ({ system: state.system, cluster: state.framework.cluster });
const mapActionsToProps = { getClusterAll, createCluster, resetCluster, deleteCluster, applyServiceImage, deleteServiceImage, watchLogs, unWatchLogs, getAllLogs };
export default connect(mapStateToProps, mapActionsToProps)(ClusterPage);