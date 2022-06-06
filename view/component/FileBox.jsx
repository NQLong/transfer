import React from 'react';
import T from 'view/js/common';

const UploadBoxStyle = {
    backgroundImage: 'url(\'/img/upload.png\')',
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
    state = { isUploading: false, userData: null };
    file = null;

    getFile = () => this.file;

    setData = (userData, reset = true) => this.setState({ userData }, () => {
        if (reset) {
            this.box.style.backgroundImage = 'url(/img/upload.png)';
            this.file = null;
        }
    })

    onDrop = (event) => {
        event.preventDefault();
        const pending = !!this.props.pending;
        this.box.style.backgroundColor = '#FFF';

        if (event.dataTransfer.items) {
            if (event.dataTransfer.items.length > 0) {
                const item = event.dataTransfer.items[0];
                if (item.kind == 'file') {
                    if (pending) {
                        this.file = event.dataTransfer.items[0].getAsFile();
                        this.box.style.backgroundImage = 'url(/img/received.png)';
                    } else {
                        this.onUploadFile(event.dataTransfer.items[0].getAsFile());
                    }
                }
            }
            event.dataTransfer.items.clear();
        } else {
            if (event.dataTransfer.files.length > 0) {
                if (pending) {
                    this.file = event.dataTransfer.files[0];
                    this.box.style.backgroundImage = 'url(/img/received.png)';
                } else {
                    this.onUploadFile(event.dataTransfer.files[0]);
                }
            }
            event.dataTransfer.clearData();
        }
    }

    onDragOver = (event) => event.preventDefault();

    onDragEnter = (event) => {
        this.box.style.backgroundColor = '#009688';
        event.preventDefault();
    }

    onDragLeave = (event) => {
        this.box.style.backgroundColor = '#FFF';
        event.preventDefault();
    }

    onSelectFileChanged = (event) => {
        const pending = !!this.props.pending;
        if (event.target.files.length > 0) {
            if (!pending) {
                this.onUploadFile(event.target.files[0]);
            } else {
                // const sizeFiles = event.target.files[0].size ? event.target.files[0].size / 1024 / 1024 : 0;
                // if (sizeFiles && sizeFiles > 15) {
                //     T.alert(`Tệp hình ảnh có kích thước ${Math.round(sizeFiles * 100) / 100} MB`, 'warning', false, 2000);
                // }
                this.file = event.target.files[0];
                this.box.style.backgroundImage = 'url(/img/received.png)';
                this.onChange(this.file);
            }
            event.target.value = '';
        }
    };

    onUploadFile = (data, done, fileRequired = true) => {
        const pending = !!this.props.pending;
        let file, body;
        if (pending) {
            file = this.file;
            body = data;
        } else {
            file = data;
            body = null;
        }

        if (!file && fileRequired) {
            T.alert('Bạn chưa đính kèm tệp tin', 'warning', false, 2000);
            return;
        } else if (!body && pending) {
            T.alert('Bạn chưa điền đủ dữ liệu', 'warning', false, 2000);
            return;
        }
        this.setState({ isUploading: true });

        const userData = this.state.userData ? this.state.userData : this.props.userData,
            updateUploadPercent = percent => {
                if (this.props.onPercent) this.props.onPercent(percent);
                this.box.innerHTML = percent + '%';
            };

        const formData = new FormData();
        formData.append(this.props.uploadType, file);
        if (userData) formData.append('userData', userData);
        if (body) {
            formData.append('data', JSON.stringify(body));
        }

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
                // box.html('');
                this.box.innerHTML = '';
                this.setState({ isUploading: false });
                if (this.props.complete) this.props.complete();
            },
            success: data => {
                this.setState({ isUploading: false });
                if (this.props.success) this.props.success(data);
                if (done) done(data);
            },
            error: error => {
                this.setState({ isUploading: false });
                if (this.props.error) this.props.error(error);
            }
        });
    }

    onUploadFile2 = (file) => {
        this.setState({ isUploading: true });

        const box = $(this.box),
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

    onClick = (e) => e.preventDefault() || this.uploadInput.click();

    onChange = (file) => this.props.onChange && this.props.onChange(file);

    render() {
        const fileAttrs = { type: 'file' };
        if (this.props.accept) fileAttrs.accept = this.props.accept;

        return (
            <div style={this.props.style} className={this.props.className}>
                <div ref={e => this.box = e} id={this.props.uploadType} style={UploadBoxStyle}
                    onDrop={this.onDrop} onClick={this.onClick}
                    onDragOver={this.onDragOver} onDragEnter={this.onDragEnter} onDragLeave={this.onDragLeave} />
                <small className='form-text text-primary' style={{ textAlign: 'center' }}>
                    {this.props.description ? this.props.description : 'Nhấp hoặc kéo tập tin thả vào ô phía trên!'}
                </small >
                <input {...fileAttrs} name={this.props.uploadType} onChange={this.onSelectFileChanged} style={{ display: 'none' }} ref={e => this.uploadInput = e} />
            </div>
        );
    }
}