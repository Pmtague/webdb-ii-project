const express = require('express');

const db = require('../data/db-config.js');

const router = express.Router();

router.get('/', (req, res) => {
	db('cars')
		.then(cars => {
			res.status(200).json(cars)
		})
		.catch(err => {
			console.log(err)
			res.status(500).json({ error: 'Failed to retrieve cars' })
		});
});

router.get('/:id', validateRecordId, (req, res) => {
	const { id } = req.params;

	db('cars')
		.where({ id })
		.first()
		.then(car => {
			res.status(200).json(car)
		})
		.catch(err => {
			console.log(err)
			res.status(500).json({ error: 'Failed to retrieve cars' })
		});
})

router.post('/', validateRecordData, (req, res) => {
	const carData = req.body;

	db('cars')
		.insert(carData)
		.then(ids => {
			db('cars')
				.where({ id: ids[0] })
				.then(newCar => {
					res.status(201).json(newCar)
				})
		}) 
		.catch(err => {
			console.log(err)
			res.status(500).json({ error: 'Failed to store carData' })
		})
})

router.put('/:id', validateRecordId, (req, res) => {
	const changes = req.body;

	db('cars')
		.where('id', req.params.id)
		.update(changes)
		.then(count => {
			res.status(200).json({ message: `Updated ${count} record` })
		})
		.catch(err => {
			console.log(err)
			res.status(500).json({ error: 'Could not update record' })
		})
})

router.delete('/:id', validateRecordId, (req, res) => {
	db('cars')
		.where({ id: req.params.id })
		.del()
		.then(count => {
			res.status(200).json({ message: `Deleted ${count} record` })
		})
		.catch(err => {
			console.log(err)
			res.status(500).json({ error: 'Could not delete record' })
		})
})

function validateRecordId(req, res, next) {
	const { id } = req.params;

	db('cars')
		.where({ id })
		.then(car => {
			if(car.length) {
				req.car = car;
				next();
			} else {
				res.status(404).json({ error: 'Could not find record' })
			}
		})
}

function validateRecordData(req, res, next) {
	const { vin, make, model, mileage } = req.body;

	if(!vin) {
		return res.status(400).json({ error: 'VIN is a required field' })
	}
	if(!make) {
		return res.status(400).json({ error: 'Make is a required field' })
	}
	if(!model) {
		return res.status(400).json({ error: 'Model is a required field' })
	}
	if(!mileage) {
		return res.status(400).json({ error: 'Mileage is a required field' })
	}
	next()
}
module.exports = router;
