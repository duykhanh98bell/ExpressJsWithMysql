import statementService from './statement.service.js';

export const findAllStatement = async (req,res) => {
    try {
        const rows = await statementService.getStatements(req.query);
        res.sendJson(rows);
    } catch(error) {
        res.sendError({ message: error.message,code: error.code });
    }
}

export const findOneStatement = async (req,res) => {
    try {
        const statement = await statementService.getStatement(req.params.id);
        res.sendJson({ rows: statement })
    } catch(error) {
        res.sendError({ message: error.message,code: error.code });
    }
}

export default { findAllStatement,findOneStatement }