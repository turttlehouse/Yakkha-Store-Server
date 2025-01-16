
export interface OrderData{
    phoneNumber : string,
    shippingAddress : string,
    totalAmount : number,
    paymentDetails :{
        paymentMethod : PaymentMethod,
        paymentStatus? : PaymentStatus,
        pidx? : string,
    }
    items : OrderDetails[]   //multiple product huna sako as OrderDetails table include ordered product data
}

export interface OrderDetails{
    productId : string,
    quantity : string
}

export enum PaymentMethod{
    COD = 'cod',
    Khalti = 'khalti'
}

export enum PaymentStatus{
    Paid = 'paid',
    Unpaid = 'unpaid'
}

//After inititating the payment, khalti will return the response in the following format
// data: {
//     pidx: 'BjCAJsgerhSfkbpiqkhvMo',
//     payment_url: 'https://test-pay.khalti.com/?pidx=BjCAJsgerhSfkbpiqkhvMo',
//     expires_at: '2025-01-16T22:27:12.380928+05:45',
//     expires_in: 1800
//   }
export interface KhaltiResponse{
    pidx : string,
    payment_url : string,
    expires_at : Date | string,
    expires_in : number,
    // user_fee : number
}