//we are implementing three features that are the pagination,filter and search 
// that the user will be able to use to filter the result 

//pagination is used so that only the required result should be displayed
// filter is used so that the products can be filtered according to some category which 
// each of the product are having
// search is used to search the product by their name using the keyword that is given in the query string 
// when the user is making the search 



class ApiFeatures {
    // eg (findone(),{name:"laptop"}) --> something like this console.log() to check

    constructor(query,queryStr){
        this.query = query;
        this.queryStr = queryStr;
    }

    search(){
        const keyword = this.queryStr.keyword?{
            name:{
                $regex:this.queryStr.keyword,
                $options:"i", // making the search case insensitive
            },
        }:{};
        this.query = this.query.find({...keyword});
        return this;
    }

    // we are mking filter to filter by category and not to filter by 
    // the keyword therefore we are going to remove the options to search by keyword
    // by removing the keyword option from the query copy

    filter(){
        const queryCopy = {...this.queryStr};
        //removing some fields for category 

        // console.log(queryCopy);

        const removeField = ["keyword","page","limit"];

        removeField.forEach((key)=> delete queryCopy[key]);


        // console.log(queryCopy    );
        // filter for price and rating

        let queryStr = JSON.stringify(queryCopy);

        // for filtering based on the rating and the price
        // the mongo db have the symbol $ attached before all its operator
        // therefore we are trying to attach the same symbol in the code below

        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g,(key)=>`$${key}`);

        this.query = this.query.find(JSON.parse(queryStr));
        return this;

    }

    // query in the db according to the pagination and then show the results 

    pagination(resultPerPage){
        const currentPage = Number(this.queryStr.page)||1;
        const skip = resultPerPage* (currentPage-1);
        this.query = this.query.limit(resultPerPage).skip(skip);
        return this;
    }
}


module.exports = ApiFeatures;