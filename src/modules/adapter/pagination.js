export const pagination = async (pagination,count) => {
    if(!pagination && !pagination?.page && !pagination?.perPage) {
        return;
    }
    const page = +pagination.page;
    const perPage = +pagination.perPage;
    const pagesCount = Math.ceil(count / perPage);

    return {
        page,
        totalCount: count,
        pageCount: pagesCount,
        perPage,
        nextPage: page === pagesCount ? page : page + 1
    }
}