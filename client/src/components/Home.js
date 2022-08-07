import React, {useRef, useEffect, useState} from 'react';

import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import './Home.css';
import {Alert, Snackbar} from '@mui/material';
import {Link} from 'react-router-dom';

export default function Home(props) {
	let baseUrl;
	if (process.env.NODE_ENV === 'development') {
		baseUrl = process.env.REACT_APP_DEV_URL;
	} else {
		baseUrl = process.env.REACT_APP_PROD_URL;
	}
	const [allData, setAllData] = useState();
	const [uploadedFile, setUploadedFile] = useState();
	const [open, setOpen] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState();
	const [snackbarColor, setSnackbarColor] = useState('success');
	const handleClose = (event, reason) => {
		if (reason === 'clickaway') {
			return;
		}

		setOpen(false);
	};
	useEffect(() => {
		async function getFiles() {
			const {data} = await axios.get(`${baseUrl}/uploads`);
			setAllData(data);
		}
		getFiles();
	}, [baseUrl]);
	const fileRef = useRef(null);

	const handleClick = (event) => {
		fileRef.current.click();
	};
	const handleChange = (event) => {
		const fileUploaded = event.target.files[0];
		setUploadedFile(fileUploaded);
	};

	const uploadFile = async () => {
		let formData = new FormData();
		formData.append('file', uploadedFile);
		try {
			const resp = await axios.post(`${baseUrl}/upload`, formData);
			setSnackbarMessage(resp.message);
			setSnackbarColor('success');
		} catch (err) {
			setSnackbarMessage(err.response.data.message);
			setSnackbarColor('error');
			setOpen(true);
		}
	};
	const generateCertificate = async (hash) => {
		try {
			const resp = await axios.post(`${baseUrl}/certificate/new`, {
				hash: hash._id,
			});
			setSnackbarMessage(resp.message);
			setSnackbarColor('success');
		} catch (err) {
			setSnackbarMessage(err.response.data.message);
			setSnackbarColor('error');
			setOpen(true);
		}
	};

	return (
		<div className='container'>
			<div className='header'>
				<span>Timestamping</span>
				<nav>
					<Link to='/'>Home</Link>
					<Link to='/details'>Details</Link>
				</nav>
			</div>
			<div className='left'>
				<input
					type='file'
					ref={fileRef}
					onChange={handleChange}
					style={{display: 'none'}}
				/>
				<Button variant='contained' onClick={handleClick}>
					Upload
				</Button>
				{uploadedFile && (
					<div>
						<span>
							<b>FileName:</b> {uploadedFile.name}
						</span>
						<br />
						<span>
							<b>File Size:</b> {uploadedFile.size}
						</span>
						<Button type='outline' onClick={uploadFile}>
							Submit
						</Button>
					</div>
				)}
			</div>
			<div className='right'>
				<TableContainer component={Paper}>
					<Table sx={{minWidth: 650}} aria-label='simple table'>
						<TableHead>
							<TableRow>
								<TableCell align='center'>
									<strong>File Name</strong>
								</TableCell>
								<TableCell align='center'>
									<strong>Original Name</strong>
								</TableCell>
								<TableCell align='center'>
									<strong>Size</strong>
								</TableCell>
								<TableCell align='center'>
									<strong>Action</strong>
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{allData &&
								allData.map((row) => (
									<TableRow
										key={row._id}
										sx={{
											'&:last-child td, &:last-child th': {border: 0},
										}}
									>
										<TableCell align='center'>{row.fileName}</TableCell>
										<TableCell align='center'>{row.originalName}</TableCell>
										<TableCell align='center'>{row.size}</TableCell>
										<TableCell align='center'>
											<Button onClick={() => generateCertificate(row)}>
												Generate
											</Button>
										</TableCell>
									</TableRow>
								))}
						</TableBody>
					</Table>
				</TableContainer>
			</div>
			<Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
				<Alert onClose={handleClose} severity={snackbarColor} sx={{width: '100%'}}>
					{snackbarMessage}
				</Alert>
			</Snackbar>
			;
		</div>
	);
}
