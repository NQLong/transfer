import React from 'react';
import { connect } from 'react-redux';

export class ComponentHocVi extends React.Component {
    render() {
        return (
            <div>

            </div>
        );
    }
}

const mapStateToProps = state => ({ staff: state.tccb.staff, system: state.system });
const mapActionsToProps = {

};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentHocVi);