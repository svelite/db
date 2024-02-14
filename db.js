import { readFileSync, writeFileSync } from 'node:fs';
import { existsSync } from 'node:fs';
import {customAlphabet} from 'nanoid';

// Define the character set for the IDs
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

// Create a custom nanoid function with a specific size
export const getId = customAlphabet(alphabet, 8);

export function createDb(adapter) {
	return (collectionName) => {
		return {
			query({filters = [], page = 1, perPage= 0} = {}) {

                return adapter.query(collectionName, {
                    filters, 
                    pagination: {page, perPage}
                })
			},
			async insert(data) {
                data.id ??= getId();
                const result = await adapter.insert(collectionName, data);
				return result;
			},
			async remove(id) {
                await adapter.remove(collectionName, id)
                return true;
			},
			async update(id, data) {
				const result = await adapter.update(collectionName, id, data);
                return result
			}
		};
	};
}

function applyComparison(value, operator, compareValue) {
    switch (operator) {
        case '=':
            return value === compareValue;
        case '<':
            return value < compareValue;
        case '<=':
            return value <= compareValue;
        case '>':
            return value > compareValue;
        case '>=':
            return value >= compareValue;
        // Add other conditions as needed
        default:
            return true; // No comparison applied for unknown operators
    }
}

function applyFilters(items, filters) {
    return filters.reduce((prev, curr) => {
        return prev.filter((x) => applyComparison(x[curr.field], curr.operator, curr.value));
    }, items);
}

// export const createAdapter1 = () => {
//     return {
//         insert(collection, data) {
//             if (!db[collection]) {
//                 db[collection] = [];
//             }
//             db[collection].push(data);
//             return data;
//         },

//         query(collection, {pagination = {page: 1, perPage: 0}, filters = []}) {
//             if (!db[collection]) {
//                 return {data:[], total: 0, page: 1, perPage: 0};
//             }

//             let items = applyFilters(db[collection], filters)

//             return {
//                 data: pagination.perPage === 0 ? items : items.slice(
//                     (pagination.page - 1) * pagination.perPage,
//                     pagination.page * pagination.perPage
//                 ),
//                 total: items.length,
//                 page: pagination.page,
//                 perPage: pagination.perPage === 0 ? items.length : Math.min(items.length, pagination.perPage)
//             }
//         },

//         update(collection, id, data) {
//             if (!db[collection]) {
//                 return null;
//             }
//             const index = db[collection].findIndex(item => item.id === id);
//             if (index !== -1) {
//                 db[collection][index] = { ...db[collection][index], ...data };
//                 return db[collection][index];
//             }
//             return null;
//         },

//         remove(collection, id) {
//             if (!db[collection]) {
//                 return null;
//             }
//             const index = db[collection].findIndex(item => item.id === id);
//             if (index !== -1) {
//                 const deleted = db[collection][index];
//                 db[collection].splice(index, 1);
//                 return deleted;
//             }
//             return null;
//         }
//     }
// }

export const createAdapter = (token) => {
    if(!existsSync('./data/' + token + '/db.json')) {
        throw new Error('database not esists. create new database first (/new)')
    }
    let db = {}

    function read() {
        const file = readFileSync('./data/' + token + '/db.json');
        db = JSON.parse(file)
    }
    read()

    function write() {
        writeFileSync('./data/' + token + '/db.json', JSON.stringify(db));
    }

    let isDirty = false;

    setInterval(() => {
        if(isDirty) {
            write()
        }
        isDirty = false
    }, 2000)

    return {
        insert(collection, data) {
            if (!db[collection]) {
                db[collection] = [];
            }
            db[collection].push(data);
            isDirty = true
            return data;
        },

        query(collection, {pagination = {page: 1, perPage: 0}, filters = []}) {
            if (!db[collection]) {
                return {data:[], total: 0, page: 1, perPage: 0};
            }

            let items = applyFilters(db[collection], filters)

            return {
                data: pagination.perPage === 0 ? items : items.slice(
                    (pagination.page - 1) * pagination.perPage,
                    pagination.page * pagination.perPage
                ),
                total: items.length,
                page: pagination.page,
                perPage: pagination.perPage === 0 ? items.length : Math.min(items.length, pagination.perPage)
            }
        },

        update(collection, id, data) {
            if (!db[collection]) {
                return null;
            }
            const index = db[collection].findIndex(item => item.id === id);
            if (index !== -1) {
                db[collection][index] = { ...db[collection][index], ...data };
                isDirty = true
                return db[collection][index];
            }
            return null;
        },

        remove(collection, id) {
            if (!db[collection]) {
                return null;
            }
            const index = db[collection].findIndex(item => item.id === id);
            if (index !== -1) {
                const deleted = db[collection][index];
                db[collection].splice(index, 1);
                isDirty = true
                return deleted;
            }
            return null;
        }
    }
}
