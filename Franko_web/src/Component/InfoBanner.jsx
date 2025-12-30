import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getHomePageAdvertisment } from "../Redux/Slice/advertismentSlice";

const InfoBanner = () => {
  const dispatch = useDispatch();
  const { advertisments } = useSelector((state) => state.advertisment);
  const backendBaseURL = "https://smfteapi.salesmate.app";
  const targetFileId = "dceed369-a7fe-4058-8e62-5ab61df74514";

  const [homePageAd, setHomePageAd] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dispatch(getHomePageAdvertisment("Home Page"));
  }, [dispatch]);

  useEffect(() => {
    const matchingAd = advertisments.find((ad) => ad.fileId === targetFileId);
    if (matchingAd) {
      setHomePageAd(matchingAd);
    }
    setIsLoading(false);
  }, [advertisments]);

  const imageUrl = homePageAd
    ? `${backendBaseURL}/Media/Ads/${homePageAd.fileName.split("\\").pop()}`
    : null;

  // Don't render if no ad found
  if (!isLoading && !homePageAd) {
    return null;
  }

  return (
    <div className="mx-auto px-4 mt-1">
      {isLoading ? (
        // Loading Skeleton
        <div className="w-full h-[120px] sm:h-[150px] md:h-[200px] bg-gray-200 rounded-xl animate-pulse" />
      ) : (
        // Banner Image (no navigation)
        <div className="relative w-full overflow-hidden rounded-xl shadow-md">
          <img
            src={imageUrl}
            alt="Advertisement Banner"
            className="w-full h-auto object-cover"
          />
        </div>
      )}
    </div>
  );
};

export default InfoBanner;