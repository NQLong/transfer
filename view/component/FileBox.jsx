import React from 'react';

const UploadBoxStyle = {
    backgroundImage: `url('/img/upload.png')`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
    width: 'auto',
    height: '124px',
    lineHeight: '124px',
    fontSize: '64px',
    color: 'black',
    textAlign: 'center',
    border: '1px dashed #333',
    cursor: 'pointer'
};

export default class FileBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isUploading: false, userData: null };

        this.box = React.createRef();
        this.uploadInput = React.createRef();
    }

    setData = (userData) => this.setState({ userData })

    init = () => {
        this.setState({ file: null });
        $(this.box.current).css({ 'background-image': `url('/img/upload.png')` });
    }

    onDrop = (event) => {
        event.preventDefault();
        $(this.box.current).css('background-color', '#FFF')

        if (event.dataTransfer.items) {
            if (event.dataTransfer.items.length > 0) {
                const item = event.dataTransfer.items[0];
                if (item.kind == 'file') {
                    this.onUploadFile(event.dataTransfer.items[0].getAsFile());
                }
            }
            event.dataTransfer.items.clear();
        } else {
            if (event.dataTransfer.files.length > 0) {
                this.onUploadFile(event.dataTransfer.files[0]);
            }
            event.dataTransfer.clearData();
        }
    }

    onClick = (event) => {
        event.preventDefault();
        $(this.uploadInput.current).click();
    }

    onDragOver = (event) => event.preventDefault();
    onDragEnter = (event) => {
        $(this.box.current).css({ 'background-color': '#009688' });
        event.preventDefault();
    }

    onDragLeave = (event) => {
        $(this.box.current).css({ 'background-color': '#FFF' });
        event.preventDefault();
    }
    getFileState = () => {
        return this.state.file
    }
    onSelectFileChanged = (event) => {
        if (event.target.files.length > 0) {
            if (this.props.ajax) {
                this.onUploadFile2(event.target.files[0]);
            } else {
                const sizeFiles = event.target.files[0].size ? event.target.files[0].size / 1024 / 1024 : 0;
                if (sizeFiles && sizeFiles > 15) {
                    T.alert(`Tệp hình ảnh có kích thước ${Math.round(sizeFiles * 100) / 100} MB`, 'warning', false, 2000);
                }
                this.setState({ file: event.target.files[0] });
                $(this.box.current).css({ 'background-image': `url('/img/received.png')` });
            }
            event.target.value = '';
        }
    };

    onUploadFile = (body) => {
        const { file } = this.state;
        if (!file) {
            T.alert(`Bạn chưa đính kèm tệp tin`, 'warning', false, 2000);
            return;
        } else if (!body) {
            T.alert(`Bạn chưa điền đủ dữ liệu`, 'warning', false, 2000);
            return;
        }
        this.setState({ isUploading: true });

        const box = $(this.box.current),
            userData = this.state.userData ? this.state.userData : this.props.userData,
            updateUploadPercent = percent => {
                if (this.props.onPercent) this.props.onPercent(percent);
                box.html(percent + '%');
            };

        const formData = new FormData();
        formData.append(this.props.uploadType, file);
        if (userData) formData.append('userData', userData);
        formData.append('data', JSON.stringify(body));
        $.ajax({
            method: 'POST',
            url: this.props.postUrl,
            dataType: 'json',
            data: formData,
            body: formData,
            cache: false,
            contentType: false,
            processData: false,
            xhr: () => {
                const xhr = new window.XMLHttpRequest();

                xhr.upload.addEventListener('progress', evt => {
                    if (evt.lengthComputable) {
                        updateUploadPercent((100 * evt.loaded / evt.total).toFixed(2));
                    }
                }, false);

                xhr.addEventListener('progress', evt => {
                    if (evt.lengthComputable) {
                        updateUploadPercent((100 * evt.loaded / evt.total).toFixed(2));
                    }
                }, false);

                return xhr;
            },
            complete: () => {
                box.html('');
                this.setState({ isUploading: false });
                if (this.props.complete) this.props.complete();
            },
            success: data => {
                this.setState({ isUploading: false });
                if (this.props.success) this.props.success(data);
            },
            error: error => {
                this.setState({ isUploading: false });
                if (this.props.error) this.props.error(error);
            }
        });
    }

    onUploadFile2 = (file) => {
        this.setState({ isUploading: true });

        const box = $(this.box.current),
            userData = this.state.userData ? this.state.userData : this.props.userData,
            updateUploadPercent = percent => {
                if (this.props.onPercent) this.props.onPercent(percent);
                box.html(percent + '%');
            };

        const formData = new FormData();
        formData.append(this.props.uploadType, file);
        if (userData) formData.append('userData', userData);

        $.ajax({
            method: 'POST',
            url: this.props.postUrl,
            dataType: 'json',
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            xhr: () => {
                const xhr = new window.XMLHttpRequest();

                xhr.upload.addEventListener('progress', evt => {
                    if (evt.lengthComputable) {
                        updateUploadPercent((100 * evt.loaded / evt.total).toFixed(2));
                    }
                }, false);

                xhr.addEventListener('progress', evt => {
                    if (evt.lengthComputable) {
                        updateUploadPercent((100 * evt.loaded / evt.total).toFixed(2));
                    }
                }, false);

                return xhr;
            },
            complete: () => {
                box.html('');
                this.setState({ isUploading: false });
                if (this.props.complete) this.props.complete();
            },
            success: data => {
                this.setState({ isUploading: false });
                if (this.props.success) this.props.success(data);
            },
            error: error => {
                this.setState({ isUploading: false });
                if (this.props.error) this.props.error(error);
            }
        });
    }

    render() {
        const accept = this.props.accept ? this.props.accept : '';
        const fileAttrs = { type: 'file' };
        if (this.props.accept) fileAttrs.accept = this.props.accept;

        return (
            <div style={this.props.style} className={this.props.className}>
                <div ref={this.box} id={this.props.uploadType} style={UploadBoxStyle}
                    onDrop={this.onDrop} onClick={this.onClick}
                    onDragOver={this.onDragOver} onDragEnter={this.onDragEnter} onDragLeave={this.onDragLeave} />
                <small className='form-text text-primary' style={{ textAlign: 'center' }}>
                    {this.props.description ? this.props.description : 'Nhấp hoặc kéo tập tin thả vào ô phía trên!'}
                </small >
                <input {...fileAttrs} name={this.props.uploadType} onChange={this.onSelectFileChanged} style={{ display: 'none' }} ref={this.uploadInput} />
            </div>
        );
    }
}
