// Helper function to calculate the discounted price
function calculateDiscountedPrice(originalPrice, discountRate, discountType) {

  if (discountType === 'Percentage') {
    return originalPrice - (originalPrice * (discountRate / 100));
  } else if (discountType === 'Flat') {
    return originalPrice - discountRate;
  }
  return originalPrice;
}

// Function to apply the highest discount from the offers
const applyHighestDiscount = (product, offers) => {
  if (!product || !offers || !Array.isArray(offers)) return product?.price || 0;

  const applicableOffers = offers.filter((offer) => {
    if (!offer.typeId) return false;

    const offerTypeId = offer.typeId.toString();
    
    if (offer.offerType === 'Category') {
      // Handle both populated and unpopulated category fields
      const parentId = product.parentCategory?._id ? product.parentCategory._id.toString() : product.parentCategory?.toString();
      const subId = product.subCategory?._id ? product.subCategory._id.toString() : product.subCategory?.toString();
      
      return offerTypeId === parentId || offerTypeId === subId;
    } else if (offer.offerType === 'Product') {
      return offerTypeId === product._id.toString();
    }
    return false;
  });

  let highestDiscountedPrice = product.price; 
  
  applicableOffers.forEach((offer) => {
    const discountedPrice = calculateDiscountedPrice(
      product.price,
      offer.discountRate,
      offer.discountType
    );
    highestDiscountedPrice = Math.min(highestDiscountedPrice, discountedPrice);
  });

  return highestDiscountedPrice;
};


module.exports = {
  applyHighestDiscount,
};
