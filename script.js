import bodyParser from 'body-parser';
import express from 'express';
import bcrypt from 'bcrypt-nodejs';
import cors from 'cors';

const app = express();
app.use(bodyParser.json());
app.use(cors());

const database = {
	users: [],
};

app.get('/', (req, res) => {
	return res.send(database.users);
});

app.post('/signin', (req, res) => {
	const { email, password } = req.body;
	const user = database.users.find((user) => user.email === email);
	if (user) {
		bcrypt.compare(password, user.password, (err, result) => {
			if (err) {
				return res.status(400).json('Error logging in');
			}
			if (result) {
				return res.json(user);
			} else {
				return res.status(400).json('Wrong credentials');
			}
		});
	} else {
		return res.status(400).json('User not found');
	}
});

app.post('/signup', (req, res) => {
	const { email, password, id } = req.body;
	bcrypt.hash(password, null, null, function (err, hash) {
		if (err) {
			return res.status(400).json('Unable to register');
		}
		const newUser = {
			id: id,
			email: email,
			password: hash,
			entries: 0,
			joined: new Date(),
		};
		database.users.push(newUser);
		res.json(newUser);
	});
});

app.get('/profile/:id', (req, res) => {
	const { id } = req.params;
	const numId = Number(id);
	const user = database.users.find((user) => user.id === numId);
	if (user) {
		return res.json(user);
	} else {
		return res.status(400).json('no user');
	}
});

app.listen(3000, () => {
	console.log('app is running on port 3000');
});
