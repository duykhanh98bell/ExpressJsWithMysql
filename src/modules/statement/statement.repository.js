import { createTable,deleteByIdTable,deleteOneTable,findByIdTable,findOneTable,findPaginationTable,findTable,updateOneByIdTable } from '../../shared/querySql.js';

const table = 'statements'
const find = (query,fields) => findTable(query,fields,table);
const findPagination = (query,fields) => findPaginationTable(query,fields,table)
const findById = (id,fields) => findByIdTable(id,fields,table);
const findOne = (query,fields) => findOneTable(query,fields,table)
const create = async (payload) => createTable(payload,table);
const updateOne = async (id,payload) => updateOneByIdTable(id,payload,table);
const deleteById = async (id) => deleteByIdTable(id,table)
const deleteOne = async (query) => deleteOneTable(query,table);

export default {
    find,
    findPagination,
    findById,
    findOne,
    create,
    updateOne,
    deleteById,
    deleteOne
}