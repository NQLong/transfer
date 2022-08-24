import React, { useRef, useEffect, useState } from 'react';
import { AdminModal } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';

const defaultLineColor = '#000000'; // black

export class DrawSignatureModal extends AdminModal {

	ref = React.createRef();

	contextRef = React.createRef();

	state = {
		sigUrl: ''
	}
	
	onShow = () => {
		this.setState({
			isShow: true
		});

		const canvas = this.ref.current;
		const ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}

	onSubmit = (e) => {
		e.preventDefault();
		const { shcc } = this.props.system.user;
		this.props.createSignatureImg(shcc, this.state.sigUrl, () => this.hide());
	}

	onHide = () => {
		const canvas = this.ref.current;
		const ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}
	
	render = () => {
		return this.renderModal({
			title: 'Vẽ chữ ký',
			size: 'large',
			body: <div>
				<Canvas lineWith={8}
					style={{ border: '2px dotted #CCCCCC', borderRadius: 15, cursor: 'crosshair' }}
					sigUrl={this.state.sigUrl}
					isShow={this.state.isShow}
					onChangeSigData={(data) => this.setState({ sigUrl: data })}
					shcc={this.props.shcc}
					canvasRef={this.ref}
					contextRef={this.contextRef}
				/>
			</div>
		});
	}
}

const Canvas = ({ width = 570, height = 380, lineWith = 4, lineColor = defaultLineColor, style = {}, onChangeSigData, shcc, canvasRef, contextRef }) => {

	// const canvasRef = useRef(null);
	// const contextRef = useRef(null);
	const [isDrawing, setIsDrawing] = useState(false);
	const [isUpload, setIsUpload] = useState(false);
	const [imgUrl, setImgUrl] = useState(null);

	const uploadFileRef = useRef(null);

	useEffect(() => {

		const canvas = canvasRef.current;

		const context = canvas.getContext('2d');

		context.strokeStyle = lineColor;
		context.lineWidth = lineWith;

		contextRef.current = context;
		
	}, []);

	const draw = ({ nativeEvent }) => {
		if (!isDrawing) return;

		const { offsetX, offsetY } = nativeEvent;
		contextRef.current.lineTo(offsetX, offsetY);
		contextRef.current.stroke();
	};

	const startDrawing = ({ nativeEvent }) => {
		const { offsetX, offsetY } = nativeEvent;
		contextRef.current.beginPath();
		contextRef.current.moveTo(offsetX, offsetY);

		setIsDrawing(true);
	};

	const finishDrawing = () => {
		contextRef.current.closePath();
		setIsDrawing(false);
		const canvas = canvasRef.current;

		const { width, height } = canvas;

		const resizeCanvas = document.createElement('CANVAS');
		resizeCanvas.width = 300;
		resizeCanvas.height = 300;
		let ctx = resizeCanvas.getContext('2d');

		ctx.drawImage(canvas, 0, 0, width, height, 0, 0, 300, 300);

		const data = resizeCanvas.toDataURL('image/png', 1.0);
		onChangeSigData(data);
	};

	const clearDraw = () => {
		if (isUpload) {
			setImgUrl('');
			setIsUpload(false);
		} else {
			const canvas = canvasRef.current;
			contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
		}
		onChangeSigData('');
	};

	const onSuccess = (response) => {
		if (response.error) T.notify(response.error, 'danger');
		else if (response.item) {
			setIsUpload(true);
			setImgUrl('data:image/png;base64,' + response.item.content);
			onChangeSigData('data:image/png;base64,' + response.item.content);
		}
	};

	const onUploadFile = (e) => {
		e.preventDefault();
		uploadFileRef.current.uploadInput.click();
	};

	return (
		<>
			<div style={{ display: 'flex', justifyContent: 'space-between' }}>
				<div style={{ textAlign: 'center' }}>
					{
						isUpload ?
							<div style={{ width: width, height: height }}>
								<img src={imgUrl} style={{ maxWidth: '100%', maxHeight: '100%' }} />
							</div>
							:
							<canvas
								ref={canvasRef}
								width={width}
								height={height}
								onMouseDown={startDrawing}
								onMouseUp={finishDrawing}
								onMouseMove={draw}
								style={style}
							></canvas>
					}

				</div>
				<div>
					<button type='button' className='btn btn-danger' onClick={clearDraw} style={{ width: '100%', marginBottom: 10 }}>
						<i className="fa fa-refresh" style={{ marginRight: 10 }}></i>Xoá
					</button>
					<button type='button' className='btn btn-primary' onClick={onUploadFile} style={{ width: '100%' }}>
						<i className='fa fa-upload' style={{ marginRight: 10 }}></i>Tải lên
					</button>
				</div>
			</div>
			<FileBox ref={uploadFileRef} postUrl='/user/upload'
				uploadType='hcthSignatureFile'
				userData={`hcthSignatureFile:${shcc}`}
				style={{ display: 'none' }}
				success={onSuccess} ajax={true} />
		</>
	);
};