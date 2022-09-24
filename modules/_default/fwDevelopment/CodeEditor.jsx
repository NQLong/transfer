import React, { Fragment } from 'react';
import Editor from 'react-simple-code-editor';
import Highlight, { defaultProps } from 'prism-react-renderer';
// import theme from 'prism-react-renderer/themes/duotoneLight';
import theme from 'prism-react-renderer/themes/nightOwlLight';
// import theme from 'prism-react-renderer/themes/vsLight';
import './style.scss';

const styles = {
    root: {
        boxSizing: 'border-box',
        fontFamily: '"Dank Mono", "Fira Code", monospace',
        ...theme.plain
    }
};

export default class CodeEditor extends React.Component {
    highlight = code => <Highlight {...defaultProps} theme={theme} code={code} language='jsx'>
        {({ tokens, getLineProps, getTokenProps }) => (
            <Fragment>
                {tokens.map((line, i) => (
                    <div key={i} {...getLineProps({ line, key: i })}>
                        {line.map((token, key) => <span key={key} {...getTokenProps({ token, key })} />)}
                    </div>
                ))}
            </Fragment>
        )}
    </Highlight>

    copyCode = () => {
        navigator.clipboard.writeText(this.editor.props.value);
        T.notify('Đã copy vào clipboard!', 'success');
    }

    render() {
        const { disableCopy, ...otherProps } = this.props;
        return (
            <div className='code-viewer'>
                <Editor ref={e => this.editor = e} {...otherProps} highlight={this.highlight} padding={10} tabSize={4} style={styles.root} />
                {!disableCopy && (
                    <div className='copy' onClick={this.copyCode}>
                        <i className='fa fa-copy' /> copy
                    </div>
                )}
            </div>
        );
    }
}