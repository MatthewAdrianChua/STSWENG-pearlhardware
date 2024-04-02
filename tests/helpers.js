// Helper functions

const helper = {
    
}
export async function getProductsAdmin(category, req) {
    try {
        var product_list = [];
        let resp;
        let testNext;
        console.log("HERE")
        switch (category) {
            case 'welding':
                resp = await Product.find({ type: category }).skip(req.session.pageIndex * pageLimit).limit(pageLimit);
                testNext = await Product.find({ type: category }).skip((req.session.pageIndex + 1) * pageLimit).limit(pageLimit);
                break;
            case 'safety':
                resp = await Product.find({ type: category }).skip(req.session.pageIndex * pageLimit).limit(pageLimit);
                testNext = await Product.find({ type: category }).skip((req.session.pageIndex + 1) * pageLimit).limit(pageLimit);
                break;
            case 'cleaning':
                resp = await Product.find({ type: category }).skip(req.session.pageIndex * pageLimit).limit(pageLimit);
                testNext = await Product.find({ type: category }).skip((req.session.pageIndex + 1) * pageLimit).limit(pageLimit);
                break;
            case 'industrial':
                resp = await Product.find({ type: category }).skip(req.session.pageIndex * pageLimit).limit(pageLimit);
                testNext = await Product.find({ type: category }).skip((req.session.pageIndex + 1) * pageLimit).limit(pageLimit);
                break;
            case 'brassfittings':
                resp = await Product.find({ type: category }).skip(req.session.pageIndex * pageLimit).limit(pageLimit);
                testNext = await Product.find({ type: category }).skip((req.session.pageIndex + 1) * pageLimit).limit(pageLimit);
                break;
            default:
                resp = await Product.find({}).skip(req.session.pageIndex * pageLimit).limit(pageLimit);
                testNext = await Product.find({}).skip((req.session.pageIndex + 1) * pageLimit).limit(pageLimit);
                break;
        }

        if (testNext.length == 0)
            req.session.nextPage = false;
        else
            req.session.nextPage = true;

        if (req.session.pageIndex == 0)
            req.session.prevPage = false;
        else
            req.session.prevPage = true;

        console.log(req.session.pageIndex);
        console.log(req.session.nextPage);
        console.log(req.session.prevPage);

        for (let i = 0; i < resp.length; i++) {
            product_list.push({
                name: resp[i].name,
                type: resp[i].type,
                price: resp[i].price,
                quantity: resp[i].quantity,
                productpic: resp[i].productpic,
                p_id: resp[i]._id,
                description: resp[i].description,
                isShown: resp[i].isShown
            });
        }
        return product_list;
    } catch (error) {
        console.error(error);
    }
}

export async function sortProducts(product_list, sortValue) {
    if (sortValue !== undefined) {
        switch (sortValue) {
            case 'def':

                break;
            case 'price_asc':
                product_list.sort((a, b) => a.price - b.price);

                break;
            case 'price_desc':
                product_list.sort((a, b) => b.price - a.price);
                break;
            case 'name_asc':
                product_list.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name_desc':
                product_list.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'stock_asc':
                product_list.sort((a, b) => a.quantity - b.quantity);
                break;
            case 'stock_desc':
                product_list.sort((a, b) => b.quantity - a.quantity);
                break;
        }
    }
}
