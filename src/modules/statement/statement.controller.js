import statementService from './statement.service.js';

export const findAllStatement = async (req,res) => {
    try {
        const rows = await statementService.getStatements(req.query);
        return res.status(200).json(rows);
    } catch(error) {
        return res.json({ message: error.message });
    }
}

export const findOneStatement = async (req,res) => {
    try {
        const statement = await statementService.getStatement(req.params.id);
        return res.status(200).json({ rows: statement })
    } catch(error) {
        return res.json({ message: error.message });
    }
}



export default { findAllStatement,findOneStatement }