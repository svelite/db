import express from 'express'
import { createAdapter, createDb, getId } from './db.js'
import { existsSync, mkdirSync, writeFileSync } from 'fs'

const app = express()

app.use(express.json())

app.get('/', (req, res) => {
    res.end('Svelite Db is running!')   
})

app.post('/:token/:table/query', (req, res) => {
    // validate token
    const {token, table} = req.params
    const {filters, sort, page, perPage} = req.body

    const db = createDb(createAdapter(token))


    // filters = [{key: 'title', operator: '=', value: 'something'}]
    // sort = {column: 'title', order: 'ASC'}
    
    const result = db(table).query({filters, page, perPage})
    
    return res.json(result)
})

app.post('/:token/:table/insert', (req, res) => {
    // validate token
    const {token, table} = req.params
    const data = req.body
    const db = createDb(createAdapter(token))

    const result = db(table).insert(data)
    
    return res.json(result)
})

app.post('/:token/:table/update', (req, res) => {
    // validate token
    const {token, table} = req.params
    const data = req.body
    const db = createDb(createAdapter(token))

    const result = db(table).update(data.id, data)
    
    return res.json(result)
})

app.post('/:token/:table/remove', (req, res) => {
    // validate token
    const {token, table} = req.params
    const {id} = req.body
    const db = createDb(createAdapter(token))

    const result = db(table).remove(id)
    
    return res.json(result)
})

app.post('/new', (req, res) => {
    const token = 'sv-' + getId() + '-' + getId() + '-' + getId()

    if(!existsSync('./data')) {
        mkdirSync('./data');
    }

    mkdirSync('./data/' + token)
    writeFileSync('./data/' + token + '/db.json', '{}');
    
    res.json({
        token
    })
})

const {PORT = 3000} = process.env

app.listen(PORT, () => console.log('App started on http://localhost:' + PORT))