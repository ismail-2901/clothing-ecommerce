export const faqItems = [
  {
    category: "Orders",
    question: "How do I place an order?",
    answer:
      "Browse the shop, select your size and color, then add items to your cart. Proceed to checkout, enter your delivery details, choose a payment method, and confirm your order. You'll receive a confirmation on screen."
  },
  {
    category: "Orders",
    question: "Can I check out as a guest?",
    answer:
      "Yes. Guest checkout is supported. You can also create an account at any point to track your orders, save your wishlist, and manage addresses."
  },
  {
    category: "Orders",
    question: "Can I cancel my order?",
    answer:
      "Orders can be cancelled while they are in Pending or Confirmed status. Once packed or shipped, cancellation requires contacting support. Return requests are handled separately."
  },
  {
    category: "Delivery",
    question: "How long does delivery take?",
    answer:
      "Standard delivery within Dhaka takes 2–3 business days. Outside Dhaka is typically 3–5 business days. Express delivery options may be available at checkout."
  },
  {
    category: "Delivery",
    question: "Do you offer free shipping?",
    answer:
      "Yes. Use code SHIPFREE for free shipping on orders over ৳2,000. Free shipping eligibility is always verified server-side at checkout."
  },
  {
    category: "Returns",
    question: "What is your return policy?",
    answer:
      "You may return any unworn, unwashed, and undamaged item within 14 days of delivery. Start a return from Account → Orders. Exchanges are processed after we receive and inspect the return."
  },
  {
    category: "Returns",
    question: "How long do refunds take?",
    answer:
      "Refunds are processed within 5–7 business days after we inspect the returned item. The refund is issued to the original payment method where applicable."
  },
  {
    category: "Payment",
    question: "What payment methods do you accept?",
    answer:
      "We accept Cash on Delivery (COD), bKash, Nagad, SSLCommerz, and card payments. Payment methods are configured server-side and verified before order confirmation."
  },
  {
    category: "Products",
    question: "How do I find my size?",
    answer:
      "Each product page includes a size guide button. When in doubt, size up for relaxed or oversized fits. Contact our support team if you need specific measurements."
  },
  {
    category: "Products",
    question: "Can the AI assistant invent discounts or prices?",
    answer:
      "No. The AI assistant only references products, prices, and discounts that exist in our catalog database. It cannot invent, modify, or confirm a discount. Final prices are always determined by our server-side pricing engine."
  }
];

export const shippingPolicy = {
  title: "Shipping Policy",
  sections: [
    {
      heading: "Delivery areas",
      body: "We deliver across Bangladesh. Dhaka Metro deliveries typically arrive within 2–3 business days. Outside Dhaka is 3–5 business days. Remote areas may require additional time."
    },
    {
      heading: "Shipping fees",
      body: "A flat shipping fee applies to orders below the free-shipping threshold. The exact fee is shown at checkout before you confirm your order. Use code SHIPFREE on qualifying orders for free delivery."
    },
    {
      heading: "Order tracking",
      body: "Once your order ships, you can track it from Account → Orders or by entering your order number on the Track Order page. Status is updated at each delivery milestone."
    },
    {
      heading: "Failed deliveries",
      body: "If a delivery attempt fails, we will contact you to arrange a second attempt. Repeated failed deliveries may result in order cancellation. Contact us immediately if you have delivery address concerns."
    }
  ]
};

export const returnPolicy = {
  title: "Return & Refund Policy",
  sections: [
    {
      heading: "Return eligibility",
      body: "Items must be returned within 14 days of delivery. Products must be unworn, unwashed, undamaged, and in original packaging. Sale items and customised items are not eligible for return unless defective."
    },
    {
      heading: "How to start a return",
      body: "Log in to your account, go to Orders, and select the order containing the item(s) you wish to return. Follow the return request flow. You will receive return instructions by email."
    },
    {
      heading: "Refunds",
      body: "Refunds are processed within 5–7 business days after we receive and inspect your return. The refund is credited to the original payment method. COD orders receive a store credit or bank transfer."
    },
    {
      heading: "Defective items",
      body: "If you receive a defective or incorrect item, contact us within 48 hours of delivery with photos. We will prioritise resolution and cover return shipping for defective items."
    }
  ]
};
