const express = require('express');

const router = express.Router();

router.get('/healthcheck', (req, res) => {
	res.status(200).send({message: 'Ok'});
});

module.exports = router;
