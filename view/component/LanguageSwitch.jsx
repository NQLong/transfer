import React from 'react';
import { connect } from 'react-redux';
import { updateSystemState } from 'modules/_default/_init/reduxSystem';

class LanguageSwitch extends React.Component {
    render() {
        return <img src={`/img/flag/${T.language.next()}.png`} style={{ height: '2vw', cursor: 'pointer' }}
            onClick={() => this.props.updateSystemState(T.language.switch())} />;
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { updateSystemState };
export default connect(mapStateToProps, mapActionsToProps)(LanguageSwitch);