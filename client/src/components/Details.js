import React, {useState, useEffect} from 'react';
import html2canvas from 'html2canvas';
import jspdf from 'jspdf';
import {Link} from 'react-router-dom';
import axios from 'axios';
import './Details.css';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
export default function Details() {
	let baseUrl;
	if (process.env.NODE_ENV === 'development') {
		baseUrl = process.env.REACT_APP_DEV_URL;
	} else {
		baseUrl = process.env.REACT_APP_PROD_URL;
	}
	const [certificates, setCertificates] = useState([]);
	useEffect(() => {
		const getCertificatesData = async () => {
			const {data} = await axios.get(`${baseUrl}/certificates/all`);
			setCertificates(data);
		};
		getCertificatesData();
	}, [baseUrl]);
	const handleCertificateDownload = () => {
		const cert = document.getElementById('maybeHidden');
		console.log(cert);
		console.log('he');
		if (cert) {
			cert.style.visibility = 'visible';
			html2canvas(cert).then((canvas) => {
				const imgdata = canvas.toDataURL('images/png');
				const pdf = new jspdf();
				pdf.addImage(imgdata, 'JPEG', 0, 0);
				pdf.save('certificate.pdf');
			});
			cert.style.visibility = 'hidden';
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
			<div className='main'>
				<TableContainer component={Paper}>
					<Table sx={{minWidth: 650}} aria-label='simple table'>
						<TableHead>
							<TableRow>
								<TableCell align='center'></TableCell>
								<TableCell align='center'>
									<strong>UUID</strong>
								</TableCell>
								<TableCell align='center'>
									<strong>Hash</strong>
								</TableCell>
								<TableCell align='center'>
									<strong>Tx Initiated</strong>
								</TableCell>
								<TableCell align='center'>
									<strong>Tx Recorded</strong>
								</TableCell>
								<TableCell align='center'>
									<strong>Download</strong>
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{certificates &&
								certificates.map((row) => (
									<TableRow
										key={row._id}
										sx={{
											'&:last-child td, &:last-child th': {border: 0},
										}}
									>
										{/*Certificate Creation*/}
										<TableCell id='maybeHidden' style={{visibility: 'hidden'}}>
											<div className='heading'>
												<h1>Timestamp Certificate</h1>
												<h4>
													This timestamp is created by Ethereum blockchain
												</h4>
												<h4>iprotect</h4>

												<div className='pdf__rows'>
													<span className='pdf__title'>
														Your unique Id:{' '}
													</span>
													<span className='pdf__value'>{row.uuid}</span>
												</div>
												<div className='pdf__rows'>
													<span className='pdf__title'>
														Your unique Hash:{' '}
													</span>
													<span className='pdf__value'>{row.txHash}</span>
												</div>
												<div className='pdf__rows'>
													<span className='pdf__title'>Timstamp: </span>
													<span className='pdf__value'>
														{new Date(
															row.txInitiatedTimestamp,
														).toString()}
													</span>
												</div>
											</div>
										</TableCell>
										<TableCell align='center'>{row.uuid}</TableCell>
										<TableCell align='center'>{row.txHash}</TableCell>
										<TableCell align='center'>
											{row.txInitiatedTimestamp}
										</TableCell>
										<TableCell align='center'>
											{row.txWrittenInBlockTimestamp}
										</TableCell>
										<TableCell>
											<button onClick={handleCertificateDownload}>
												Download
											</button>
										</TableCell>
									</TableRow>
								))}
						</TableBody>
					</Table>
				</TableContainer>
			</div>
		</div>
	);
}
