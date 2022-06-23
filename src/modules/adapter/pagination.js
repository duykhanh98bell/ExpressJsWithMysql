export const pagination = async (pagination,count) => {
    if(!pagination && !pagination?.page) {
        return;
    }
    const page = +pagination?.page || 1;
    const perPage = +pagination?.perPage || 20;
    const pagesCount = Math.ceil(count / perPage);

    return {
        page,
        totalCount: count,
        pageCount: pagesCount,
        perPage,
        nextPage: page === pagesCount ? page : page + 1
    }
}