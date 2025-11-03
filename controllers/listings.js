const Listing=require("../models/listings");

module.exports.index=async (req,res)=>{
const allListings=await Listing.find({});
res.render("listings/index", { allListings });
};
module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new"); 
}
module.exports.showListing=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate({path:"review",populate:{path:"author",},}).populate("owner");
    if(!listing){
      req.flash("error","Listing you requested for does not exist");
      res.redirect("/listings");
    }else{
    res.render("listings/show",{listing});
    }
}

module.exports.createListing=async(req,res,next)=>{

let url=req.file.path;
let filename=req.file.filename;
if (!req.body|| !req.body.listing) {
  throw new ExpressError(400, "Send valid data for listing");
}
const newListing = new Listing(req.body.listing);
newListing.owner=req.user._id;
newListing.image={url,filename};
await newListing.save();
req.flash("success","New Listing created");
res.redirect("/listings/");
}
module.exports.renderEditForm=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
      req.flash("error","Listing you requested for does not exist");
      return res.redirect("/listings");
    }
    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/h_300,w_250");
    res.render("listings/edit",{listing,originalImageUrl});
    }

module.exports.updateListing=async (req, res) => {
  
  let { id } = req.params;
  let listing = await Listing.findById(id);
  // Extract user inputs
  const updatedData = req.body.listing;
  // If image input is empty, keep the old one
  if (!updatedData.image || updatedData.image.trim() === "") {
    updatedData.image = listing.image;
  } else {
    // Otherwise, rebuild the proper object structure
    updatedData.image = {
      url: updatedData.image,
      filename: listing.image.filename || "listingimage"
    };
  }
  if(typeof req.file!=="undefined") {
  let url=req.file.path;
  let filename=req.file.filename;
  listing.image={url,filename};
  await listing.save();
  }
  await Listing.findByIdAndUpdate(id, updatedData);
  req.flash("success","Listing Updated");

  res.redirect(`/listings/${id}`);
}
module.exports.destroyListing=async(req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success"," Listing Deleted");
    res.redirect("/listings");
};