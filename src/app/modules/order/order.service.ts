import httpStatus from "http-status";

import AppError from "../../errors/AppError";
import QueryBuilder from "../../builder/QueryBuilder";
import { OrderSearchableFields } from "./order.constant";
import { Order } from "./order.model";
import { TOrder } from "./order.interface";

const getOrderFromDB = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(Order.find().populate('menuId'), query)
    .search(OrderSearchableFields)
    .filter(query)
    .sort()
    .paginate()
    .fields();

  const meta = await userQuery.countTotal();
  const result = await userQuery.modelQuery;

  return {
    meta,
    result,
  };
};

const getSingleOrderFromDB = async (id: string) => {
  const result = await Order.findById(id).populate('menuId');
  return result;
};


export const generateNextOrderRefId = (lastRefId: string | null | undefined): string => {
  const now = new Date();
  
  // 1. Format the date part
  const year2Digit = String(now.getFullYear()).slice(-2); // "26"
  const month = String(now.getMonth() + 1).padStart(2, '0'); // "06"
  const day = String(now.getDate()).padStart(2, '0'); // "04"
  const currentDatePrefix = `ord-${year2Digit}${month}${day}`; // "ord-260604"

  let nextSequence = "0001";

  if (lastRefId && lastRefId.startsWith(currentDatePrefix)) {
    const lastSequenceNumber = parseInt(lastRefId.slice(-4), 10);
    const nextSequenceNumber = lastSequenceNumber + 1;
    
    // Pad it back to 4 digits (e.g., 13 becomes "0013")
    nextSequence = String(nextSequenceNumber).padStart(4, '0');
  }

  return `${currentDatePrefix}${nextSequence}`;
};



const createOrderIntoDB = async (payload: TOrder) => {
  try {
    // 1. Fetch the latest created order from the DB
    const lastOrder = await Order.findOne({}, { refId: 1 })
      .sort({ createdAt: -1 }) // Assumes timestamps: true, or use .sort({ _id: -1 })
      .lean();

    // 2. Generate the next unique, incremental refId
    const nextRefId = generateNextOrderRefId(lastOrder?.refId);

    // 3. Inject it into the payload
    const orderData = {
      ...payload,
      refId: nextRefId
    };

    // 4. Save to database
    const result = await Order.create(orderData);
    return result;
  } catch (error: any) {
    console.error("Error in createOrderIntoDB:", error);

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || "Failed to create Order"
    );
  }
};

const updateOrderIntoDB = async (
  id: string,
  payload: Partial<TOrder>
) => {
  const order = await Order.findById(id);

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }


  // Update only the selected user
  const result = await Order.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};


const deleteOrderFromDB = async (
  id: string,
) => {
  const order = await Order.findById(id);

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }


  const result = await Order.findByIdAndDelete(id);

  return result;
};


const getTopOrderedMenuItemsByMonth = async (year: number, month: number) => {
  // Build date range for the given year and month
  const startDate = new Date(year, month - 1, 1);        
  const endDate = new Date(year, month, 1);             

  const result = await Order.aggregate([
    // 1. Filter orders within the given month
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
        status: { $ne: "cancelled" }, // exclude cancelled orders
      },
    },

    // 2. Group by menuId and accumulate order count + total revenue
    {
      $group: {
        _id: "$menuId",
        orderCount: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
      },
    },

    // 3. Sort by most ordered
    {
      $sort: { orderCount: -1 },
    },

    // 4. Limit to top 10
    {
      $limit: 10,
    },

    // 5. Join with Menu collection to get menu details
    {
      $lookup: {
        from: "menus",              // MongoDB collection name (lowercase + plural)
        localField: "_id",
        foreignField: "_id",
        as: "menuDetails",
      },
    },

    // 6. Unwind the joined array into an object
    {
      $unwind: {
        path: "$menuDetails",
        preserveNullAndEmptyArrays: true, // keep even if menu was deleted
      },
    },

    // 7. Shape the final output
    {
      $project: {
        _id: 0,
        menuId: "$_id",
        orderCount: 1,
        totalRevenue: 1,
        title: "$menuDetails.title",
        price: "$menuDetails.price",
        image: "$menuDetails.image",
        status: "$menuDetails.status",
        categoryId: "$menuDetails.categoryId",
      },
    },
  ]);

  return result;
};



export const OrderServices = {
  createOrderIntoDB,
  getOrderFromDB,
  updateOrderIntoDB,
  getSingleOrderFromDB,
  deleteOrderFromDB,
  getTopOrderedMenuItemsByMonth,
};
