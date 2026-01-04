type IOptions = {
    page?: Number | String,
    limit?: Number | String,
    sortOrder?: string,
    sortBy?: string
}

// return type
type IOptionsResult = {
    page: number,
    limit: number,
    skip: number,
    sortBy: string,
    sortOrder: string
}

const paginationSortingHelper = (options: IOptions): IOptionsResult => {
    // getting info for pagination
    const page: number = Number(options.page) || 1;
    const limit: number = Number(options.limit) || 10;
    const skip = (page - 1) * limit;

    // getting info for sorting
    const sortBy: string = options.sortBy || "createdAt";
    const sortOrder: string = options.sortOrder || "desc";

    // sending (returning) this to anywhere, wherever use this function
    return {
        page,
        limit,
        skip,
        sortBy,
        sortOrder
    }
}

export default paginationSortingHelper;