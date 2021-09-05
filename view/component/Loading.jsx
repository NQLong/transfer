import React from 'react';

class Loading extends React.Component {

    componentDidMount() {
        $(document).ready(() => setInterval(() => {
            $('#loading_wrapper').addClass('shine');
            setTimeout(() => {
                $('#loading_wrapper').removeClass('shine');
            }, 500);
        }, 1000));
    }

    render() {
        return (
            <div style={{ width: '100%', height: '100%', backgroundColor: 'white', position: 'fixed', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, top: 0, left: 0, bottom: 0, right: 0, cursor: 'pointer' }}>
                <div id='loading_wrapper'>
                    <img src='/img/favicon.png' height='200px' importance='high' />
                    <div className='icon-effect'></div>
                </div>
            </div>
        );
    }
}

export default Loading;