require('dotenv').config();
const express = require('express')
const morgan = require('morgan')
const pg = require('pg')
const client = new pg.Client(process.env.DATABASE_URL || 'postgress://localhost/acme_ice_cream_db');
// const flavors = require('./db')
// application initialization
const app = express();

app.use(morgan('dev'));
app.use(express.json());

// -_-_-_-_- Routes -_-_-_-_-

// - Route for all flavors
app.get('/api/flavors', async (req, res, next) => {
    try{
        const SQL =`
        SELECT * from flavors;
        `
        const response = await client.query(SQL)
        res.send(response.rows)
    } catch(ex) {
        // ex for exemption
        next(ex)
    }
})
// - Route for single flavor
app.post('/api/flavors', async (req, res, next) => {
    try {
        const SQL = /*sql*/ `
        INSERT INTO flavors(txt, ranking) VALUES($1, $2) RETURNING *;
        `
        const response = await client.query(SQL, [req.body.txt, req.body.ranking]);
        res.send(response.rows[0]);
    }catch(error) {
        next(error)
    }
})
// - Route create a flavor
app.put('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = /*SQL*/ `
        UPDATE flavors
        SET txt=$1, ranking=$2, updated_at=now()
        WHERE id=$3
        RETURNING *
        `; 
        const response = await client.query(SQL, [req.body.txt, req.body.ranking, req.params.id]);
        res.send(response.rows[0]);
    } catch(ex) {
        next(ex)
    }
})
// - Route to delete flavor
app.delete('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = /*SQL*/ `
            DELETE from flavors
            WHERE id = $1
        `;
        const response = await client.query(SQL, [req.params.id]);
        res.sendStatus(204);
    } catch(error) {
        next(error)
    }
})
// - Route to update a flavor
app.put('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = /*SQL*/ `
        UPDATE flavors
        SET txt=$1, ranking=$2, updated_at=now()
        WHERE id=$3 RETURNING *
        `;
        const response = await client.query(SQL, [req.body.txt, req.body.ranking, req.params.id]);
        res.send(response.rows[0]);
    } catch(error) {
        next(error)
    }
})

// Init Function
async function init() {
    await client.connect();
    // Seed the database
    const SQL = /*sql*/ `
    DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors(
        id SERIAL PRIMARY KEY
        name VARCHAR(255),
        is_favorite BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
    );
    `;

    // await client.query(SQL)
    // flavors.forEach(async (flav) => {
    //     await client.query(`
    //         INSERT INTO flavors(name, is_favorite) VALUES($1, $2);
    //         `, [flav.name, flav.is_favorite])
    // })
    console.log('data connected')
    // Start Server
    const port = process.env.PORT || 3000
    app.listen(port, () => console.log(`listening on port ${port}`))
}

init();