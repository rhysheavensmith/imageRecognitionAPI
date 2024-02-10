import bodyParser from 'body-parser';
import express from 'express';
import bcrypt from 'bcrypt-nodejs';
import cors from 'cors';
import knex from 'knex';

const db = knex({
	client: 'pg',
	connection: {
		host: '127.0.0.1',
		port: '5432',
		user: '',
		password: '',
		database: 'imageRecognition',
	},
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
	return res.json('success');
});

app.post('/signin', (req, res) => {
	db.select('email', 'hash')
		.from('login')
		.where('email', '=', req.body.email)
		.then((data) => {
			const isValid = bcrypt.compareSync(req.body.password, data[0].hash);

			if (isValid) {
				return db
					.select('*')
					.from('users')
					.where('email', '=', req.body.email)
					.then((user) => {
						res.json(user[0]);
					})
					.catch((err) => res.status(400).json('unable to get user'));
			} else {
				alert('wrong credentials');
			}
		})
		.catch((err) => {
			res.status(400).json('wrong credentials');
		});
});

//

app.post('/signup', (req, res) => {
	const { email, password, id } = req.body;
	const hash = bcrypt.hashSync(password);
	if (!email || !password) {
		return res.status(400).json('Invalid Credentials');
	}
	db.transaction((trx) => {
		trx
			.insert({
				hash: hash,
				email: email,
			})
			.into('login')
			.returning('email')
			.then((loginEmail) => {
				trx('users')
					.returning('*')
					.insert({
						id: id,
						email: loginEmail[0].email,
						joined: new Date(),
					})
					.then((response) => res.json(response));
			})
			.then(trx.commit)
			.catch(trx.rollback)
			.catch((err) => res.status(400).json(err, 'Unable to register'));
	});
});

app.get('/profile/:id', (req, res) => {
	const { id } = req.params;
	db.select('*')
		.from('users')
		.where('id', '=', id)
		.then((user) => {
			if (user.length) {
				res.json(user[0]);
			} else {
				res.status(404).json('User not found');
			}
		})
		.catch((err) => res.status(500).json('Error accessing the database', err));
});

app.listen(3000, () => {
	console.log('app is running on port 3000');
});
