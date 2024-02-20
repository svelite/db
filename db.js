import { getId } from './helpers.js';

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
                data.createdAt = new Date().valueOf()
                data.updatedAt = 0
                const result = await adapter.insert(collectionName, data);
				return result;
			},
			async remove(id) {
                await adapter.remove(collectionName, id)
                return true;
			},
			async update(id, data) {
                data.updatedAt = new Date().valueOf()
				const result = await adapter.update(collectionName, id, data);
                return result
			}
		};
	};
}
