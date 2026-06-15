import httpStatus from "http-status";

import AppError from "../../errors/AppError";
import QueryBuilder from "../../builder/QueryBuilder";
import { OrderSearchableFields } from "./order.constant";
import { Order } from "./order.model";
import { TOrder } from "./order.interface";
import { sendEmail } from "../../utils/sendEmail";
import { sendEmailAdmin } from "../../utils/sendEmailAdmin";

const getOrderFromDB = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(
    Order.find().populate({
      path: "items.menuId",
      model: "Menu",
    }),
    query,
  )
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
  const result = await Order.findById(id).populate({
    path: "items.menuId",
    model: "Menu",
  });
  return result;
};

export const generateNextOrderRefId = (
  lastRefId: string | null | undefined,
): string => {
  const now = new Date();

  // 1. Format the date part
  const year2Digit = String(now.getFullYear()).slice(-2); // "26"
  const month = String(now.getMonth() + 1).padStart(2, "0"); // "06"
  const day = String(now.getDate()).padStart(2, "0"); // "04"
  const currentDatePrefix = `ord-${year2Digit}${month}${day}`; // "ord-260604"

  let nextSequence = "0001";

  if (lastRefId && lastRefId.startsWith(currentDatePrefix)) {
    const lastSequenceNumber = parseInt(lastRefId.slice(-4), 10);
    const nextSequenceNumber = lastSequenceNumber + 1;

    // Pad it back to 4 digits (e.g., 13 becomes "0013")
    nextSequence = String(nextSequenceNumber).padStart(4, "0");
  }

  return `${currentDatePrefix}${nextSequence}`;
};

// const createOrderIntoDB = async (payload: TOrder) => {
//   try {
//     // 1. Fetch the latest created order from the DB
//     const lastOrder = await Order.findOne({}, { refId: 1 })
//       .sort({ createdAt: -1 })
//       .lean();

//     // 2. Generate the next unique, incremental refId
//     const nextRefId = generateNextOrderRefId(lastOrder?.refId);

//     // 3. Inject it into the payload
//     const orderData = {
//       ...payload,
//       refId: nextRefId,
//     };

//     let result = await Order.create(orderData);

//     result = await result.populate("items.menuId");

//     try {
//       const adminEmail = "info@patty-bros.co.uk";

//       await Promise.all([
//         sendEmail(
//           result.customerEmail,
//           "customer_order_confirmation",
//           `Thank you for your order!`,
//           result.customerName,
//           `Thank you for your order!`,
//           result,
//         ),

//         // Send email to Admin with full order data
//         sendEmailAdmin(
//           adminEmail,
//           "admin_order_notification",
//           `New Order Received - #${result.refId}`,
//           result.customerName,
//           `A new order has been placed.`,
//           result,
//         ),
//       ]);
//     } catch (emailError) {
//       console.error("Email layout dispatch failed:", emailError);
//     }

//     return result;
//   } catch (error: any) {
//     console.error("Error in createOrderIntoDB:", error);

//     if (error instanceof AppError) {
//       throw error;
//     }

//     throw new AppError(
//       httpStatus.INTERNAL_SERVER_ERROR,
//       error.message || "Failed to create Order",
//     );
//   }
// };


const createOrderIntoDB = async (payload: TOrder) => {
  try {
    const lastOrder = await Order.findOne({}, { refId: 1 })
      .sort({ createdAt: -1 })
      .lean();

    const nextRefId = generateNextOrderRefId(lastOrder?.refId);

    const orderData = {
      ...payload,
      refId: nextRefId,
    };

    let result = await Order.create(orderData);

    // Populate the menuId so we can access menu titles and prices
    result = await result.populate("items.menuId");

    try {
      // const adminEmail = "mahitasnimul2@gmail.com";
      const adminEmail = "info@patty-bros.co.uk";

      // ─── WhatsApp Notification ───────────────────────────────────────────────
      const WHATSAPP_API_URL =
        "https://graph.facebook.com/v25.0/1200318036493213/messages";
      const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

      let sendWhatsAppNotification: Promise<void> = Promise.resolve();

      if (!WHATSAPP_TOKEN) {
        console.error(
          "WHATSAPP_ACCESS_TOKEN is not set — skipping WhatsApp notification"
        );
      } else {
        // Build a compact order summary to use as template variables
        // Meta templates have character limits per variable, so keep them concise
        const orderRef = result.refId;
        const customerName = result.customerName;
        const customerPhone = result.customerPhone;
        const pickupTime = result.pickUpTime;

        // Build items summary string (keep under 1024 chars for the variable)
       const itemsSummary = (result.items as any[])
  .map((item: any, index: number) => {
    const menu = item.menuId;
    let line = `${index + 1}. ${menu.title} x${item.quantity}`;
    if (item.addOnItems && item.addOnItems.length > 0) {
      const addons = item.addOnItems
        .map((a: any) => `${a.title} (£${a.price})`)
        .join(", ");
      line += ` [Add-ons: ${addons}]`;
    }
    if (item.instructions) {
      line += ` [Note: ${item.instructions}]`;
    }
    return line;
  })
  .join(" | ");

        const totalAmount = `${result.totalAmount}`;

        /*
         * OPTION A — Use your approved custom template (recommended)
         *
         * Replace "new_order_notification" with whatever template name
         * you created and got approved in WhatsApp Manager.
         *
         * The template body should look like:
         *
         *   New Order - {{1}} 🍔
         *   Customer: {{2}}
         *   Phone: {{3}}
         *   Pickup: {{4}}
         *   Items:
         *   {{5}}
         *   Total: {{6}}
         *
         * Each {{N}} maps to the parameters array below in order.
         */
        const whatsappBody = {
          messaging_product: "whatsapp",
          to: "8801673784522", // no + sign, country code included
          type: "template",
          template: {
            name: "new_order_notification", // ← replace with your approved template name
            language: {
              code: "en", // ← change to match your template language e.g. "en_GB"
            },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: orderRef },           // {{1}} Order ref
                  { type: "text", text: customerName },       // {{2}} Customer name
                  { type: "text", text: customerPhone },      // {{3}} Phone
                  { type: "text", text: pickupTime },         // {{4}} Pickup time
                  { type: "text", text: itemsSummary },       // {{5}} Items
                  { type: "text", text: totalAmount },        // {{6}} Total
                ],
              },
            ],
          },
        };

       
        sendWhatsAppNotification = fetch(WHATSAPP_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(whatsappBody),
        }).then(async (res) => {
          if (!res.ok) {
            const errData = await res.json();
            console.error("WhatsApp API Error:", JSON.stringify(errData, null, 2));
          } else {
            const successData = await res.json();
            console.log("WhatsApp notification sent:", JSON.stringify(successData, null, 2));
          }
        });
      }

      // ─── Execute All Notifications in Parallel ───────────────────────────────
      await Promise.all([
        sendEmail(
          result.customerEmail,
          "customer_order_confirmation",
          `Thank you for your order!`,
          result.customerName,
          `Thank you for your order!`,
          result
        ),
        sendEmailAdmin(
          adminEmail,
          "admin_order_notification",
          `New Order Received - #${result.refId}`,
          result.customerName,
          `A new order has been placed.`,
          result
        ),
        sendWhatsAppNotification,
      ]);
    } catch (notificationError) {
      console.error("Notification dispatch failed:", notificationError);
    }

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


const updateOrderIntoDB = async (id: string, payload: Partial<TOrder>) => {
  // 1. Fetch the existing order to verify existence and check its current status
  const order = await Order.findById(id);

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  // 2. Perform the update and populate required fields in case we need to send an email
  const result = await Order.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).populate("items.menuId"); // Populated so that the email template receives the full data

  if (!result) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to update order");
  }

  // 3. Check if status is transitioning to 'cancelled'
  // (order.status !== 'cancelled' ensures we don't spam emails if it was already cancelled)
  if (payload.status === "cancelled" && order.status !== "cancelled") {
    try {
      const adminEmail = "info@patty-bros.co.uk";

      await Promise.all([
        // Send email to customer using the template we created
        sendEmail(
          result.customerEmail,
          "order_cancelled_customer",
          `Your order #${result.refId} has been cancelled`,
          result.customerName,
          `We are sorry, but your order has been cancelled.`,
          result,
        ),

       
      ]);
    } catch (emailError) {
      console.error("Cancellation email dispatch failed:", emailError);
    }
  }

  return result;
};

const deleteOrderFromDB = async (id: string) => {
  const order = await Order.findById(id);

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  const result = await Order.findByIdAndDelete(id);

  return result;
};

const getTopOrderedMenuItemsByMonth = async (year: number, month: number) => {
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
        status: { $ne: "cancelled" },
      },
    },

    // 2. Unwind items array to process each item separately
    {
      $unwind: "$items",
    },

    // 3. Group by menuId
    {
      $group: {
        _id: "$items.menuId",
        orderCount: { $sum: 1 }, // How many orders include this item
        totalQuantity: { $sum: "$items.quantity" }, // Total pieces ordered
        totalRevenue: { $sum: "$totalAmount" }, // Note: This counts full order value per item
      },
    },

    // 4. Sort by quantity ordered (most popular)
    {
      $sort: { totalQuantity: -1 },
    },

    // 5. Limit to top 10
    {
      $limit: 10,
    },

    // 6. Lookup menu details
    {
      $lookup: {
        from: "menus",
        localField: "_id",
        foreignField: "_id",
        as: "menuDetails",
      },
    },

    // 7. Unwind menu details
    {
      $unwind: {
        path: "$menuDetails",
        preserveNullAndEmptyArrays: true,
      },
    },

    // 8. Final output
    {
      $project: {
        _id: 0,
        menuId: "$_id",
        orderCount: 1,
        totalQuantity: 1,
        totalRevenue: { $round: ["$totalRevenue", 2] },
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
