const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");


// create new Order 

exports.newOrder = catchAsyncErrors(async(req,res,next)=>{
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt:Date.now(),
        user:req.user._id,
    });

    res.status(201).json({
        success:true,
        order,
    });
});


// get single Order
// here populate function is used to fill the value that must be filled as they are reference to other tables
// if populate method is not used we only get the object id but using populate we get the entire detail of the user
// the parameter of populate are the fields whose value we want to be populated here like here we want the user name and the email to be populated
// populate(table name , the fields to populate)

exports.getSingleOrder = catchAsyncErrors(async(req,res,next)=>{
    const order = await Order.findById(req.params.id).populate(
        "user",
        "name email"
    );

    if(!order){
        return next(new ErrorHandler("Order not found with this Id",400));
    }

    res.status(200).json({
        success:true,
        order,
    });
});


//get logged in user orders
exports.myOrders = catchAsyncErrors(async(req,res,next)=>{
    const orders = await Order.find({user:req.user._id});
    res.status(200).json({
        success:true,
        orders,
    });
});

//get all orders -- admin 
exports.getAllOrders = catchAsyncErrors(async(req,res,next)=>{
    const orders = await Order.find();
    let totalAmount=0;

    orders.forEach((order)=>{
        totalAmount+=order.totalPrice;
    });

    res.status(200).json({
        success:true,
        totalAmount,
        orders,
    });
});


//update order status --admin 

exports.updateOrder = catchAsyncErrors(async(req,res,next)=>{
    
    const order = await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHandler("Order not found with this id",404));
    }

    if(order.orderStatus==="Delivered"){
        return next(new ErrorHandler("the order has already been delivered",400));
    }
    
    if(req.body.status==="Shipped"){
        order.orderItems.forEach(async(o)=>{
            await updateStock(o.product,o.quantity);
        });
    }

    order.orderStatus = req.body.status; 

    if(req.body.status === "Delivered"){
        order.deliveredAt = Date.now();
    }

    await order.save({validateBeforeSave:false});

    res.status(200).json({
        success:true,
        order,
    });
});

// update order stocks 

async function updateStock(id,quantity){
    const product = await Product.findById(id);
    product.Stock-=quantity;
    await product.save({validateBeforeSave:false});
}

// delete order

exports.deleteOrder = catchAsyncErrors(async(req,res,next)=>{
    const order = await Order.findById(req.params.id);
    if(!order){
        return next(new ErrorHandler("order not found with this id",404));
    }
    await order.deleteOne();
    res.status(200).json({
        success:true,
    });
});





