
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
    CARD = 'khalti'
}

export enum PaymentStatus{
    Paid = 'paid',
    Unpaid = 'unpaid'
}
