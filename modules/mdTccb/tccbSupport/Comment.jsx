import React from 'react';

export default class Comment extends React.Component {
    render() {
        let { avatar, name,
            time, content } = this.props.data;
        avatar = '/img/avatar.png';
        name = 'Phòng Tổ chức - Cán bộ';
        return (
            <div className='comment-card col-md-12'>
                <div className='col-md-12'>
                    <div className='media'>
                        <div className='mr-3 comment-avatar'><img src={avatar} /></div>
                        <div className='media-body'>
                            <div className='row'>
                                <div className='col-md-12 d-flex' style={{ alignItems: 'flex-end', marginBottom: '10px' }}>
                                    <h5 style={{ marginBottom: 0 }}>{name?.normalizedName()}</h5>&nbsp;&nbsp;
                                    <small><i>{T.dateToText(time, 'dd/mm/yyyy HH:mm:ss')}</i></small>
                                </div>
                            </div>
                            {content}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}