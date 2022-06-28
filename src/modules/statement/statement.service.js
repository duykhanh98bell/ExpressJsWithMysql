import statementRepository from "./statement.repository.js";
import moment from 'moment-timezone';

const getStatements = async (query) => {
    return await statementRepository.findPagination(query);
}

const getStatement = async (id) => {
    return await statementRepository.findById(id);
}

const generateStatement = async (data) => {
    const {
        stmtStatus,
        subscriptionId,
        fleetPlan,
        creditLimit,
        totalCredit,
        totalDebit,
        statementStartDate,
        statementEndDate,
        gracePaymentDueDate,
        closingBalance,
        currentMonthBalance,
        previousBalance,
        totalPaid
    } = data

    const payload = {
        stmtStatus,
        subscriptionId: +subscriptionId,
        fleetPlan,
        creditLimit: +creditLimit || 0,
        totalCredit: +totalCredit || 0,
        totalDebit: +totalDebit || 0,
        statementStartDate: moment(statementStartDate).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        statementEndDate: moment(statementEndDate).endOf('day').format('YYYY-MM-DD HH:mm:ss'),
        gracePaymentDueDate: moment(gracePaymentDueDate).add(1,'month').endOf('day').format('YYYY-MM-DD HH:mm:ss'),
        closingBalance: +closingBalance || 0,
        currentMonthBalance: +currentMonthBalance || 0,
        previousBalance: +previousBalance || 0,
        totalPaid: +totalPaid || 0
    }

    await statementRepository.create(payload)
}

export default { getStatements,getStatement,generateStatement }