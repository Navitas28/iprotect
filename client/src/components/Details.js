import React, {useState, useEffect} from 'react';
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
										<TableCell align='center'>{row.uuid}</TableCell>
										<TableCell align='center'>{row.txHash}</TableCell>
										<TableCell align='center'>
											{row.txInitiatedTimestamp}
										</TableCell>
										<TableCell align='center'>
											{row.txWrittenInBlockTimestamp}
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
