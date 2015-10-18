# find close points between 2 lists of 2D points
# param keypointsList1: list. list A of points
# param keypointsList2: list. list B of points
# return: keypoints data, image with keypoints	
def getCloseKeypoints(keypointsList1, keypointsList2):
	
	if (len(keypointsList1) == 0 or len(keypointsList2) == 0):
		return []
	
	maxDistance = 20
	points1 = [[keypoint.pt[0], keypoint.pt[1]] for keypoint in keypointsList1]
	points2 = [[keypoint.pt[0], keypoint.pt[1]] for keypoint in keypointsList2]
	
	distanceMatrix = spatial.distance.cdist(points1, points2)
	relevantKeypoints = []
	for i in range(np.shape(distanceMatrix)[0]):
		for j in range(np.shape(distanceMatrix)[1]):
			if distanceMatrix[i][j] < maxDistance:
				relevantKeypoints.append(keypointsList1[i])

	return relevantKeypoints
	
	
	
def findMaxBlob(blobArray):
	maxBlob = blobArray[0]
	for blob in blobArray[0:]:
		if blob.size > maxBlob.size:
			maxBlob = blob
	return [maxBlob]

	
	
# find keypoints of light sources by filtering image according to certain boundaries
# param image: np.array. image to process
# param filterLowerBound: tuple. lower bound of color filter, in HSV format (h, s, v)
# param filterUpperBound: tuple. upper bound of color filter, in HSV format (h, s, v)
# param keypointsColor: tuple. color of keypoints, in BGR format (b, g, r)
# return: keypoints data, image with keypoints
def findLightSourcesByColorFilter(image, filterLowerBound, filterUpperBound):
	
	# Setup blob detector parameters
	params = cv2.SimpleBlobDetector_Params()
	params.minDistBetweenBlobs = 30
	params.filterByArea = True
	params.minArea = 100
	params.filterByCircularity = False
	params.minCircularity = 0.5
	params.filterByConvexity = True
	params.minConvexity = 0.7
	#params.filterByInertia = True
	#params.minInertiaRatio = 0.8
	
	_, thresholdImage = cv2.threshold(image, 230, 255, cv2.THRESH_BINARY)
	blurThresholdImage = cv2.GaussianBlur(thresholdImage, (5, 5), 0)
	hsvBlurThresholdImage = cv2.cvtColor(blurThresholdImage, cv2.COLOR_BGR2HSV)
	
	# Color-filter and detect blobs in filtered image
	filterImage = cv2.inRange(hsvBlurThresholdImage, filterLowerBound, filterUpperBound)
	blobDetector = cv2.SimpleBlobDetector_create(params)
	keypoints = blobDetector.detect(filterImage)

	return keypoints
	
	

# find keypoints of light sources by:
# 1. find blue-containing parts (like white) by thresholding
# 2. find the real blue parts by inrange on blue HSV
# 3. find light sources by grayscale thresholding
# param image: np.array. image to process
# param threshold: int. threshold value to threshold by.
# param filterLowerBound: tuple. lower bound of color filter, in HSV format (h, s, v)
# param filterUpperBound: tuple. upper bound of color filter, in HSV format (h, s, v)
# return: keypoints data
def findLightSources_old(image, threshold, filterLowerBound, filterUpperBound):
	
	# Filter through only parts of the original image which contain strong blue component
	_, thresholdImage = cv2.threshold(image, threshold, 255, cv2.THRESH_BINARY)
	blueThresholdImage = thresholdImage.copy()
	blueThresholdImage[:,:,1] = thresholdImage[:,:,0]
	blueThresholdImage[:,:,2] = thresholdImage[:,:,0]
	bluePartsImage = cv2.bitwise_and(image, blueThresholdImage)
	blurBluePartsImage = cv2.GaussianBlur(bluePartsImage, (5, 5), 0)
	
	# Filter through only real blue parts of image, not including parts with strong blue component, like white
	hsvBlurBluePartsImage = cv2.cvtColor(blurBluePartsImage, cv2.COLOR_BGR2HSV)
	filterImage = cv2.inRange(hsvBlurBluePartsImage, filterLowerBound, filterUpperBound)
	
	# Find blue light environments
	img, contours, hierarchy = cv2.findContours(filterImage,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
	# Take convex hulls to form fuller shapes, rather than the raw contours to capture the light source
	convexHulls = [cv2.convexHull(contour) for contour in contours]
	convexHullsImage = image.copy()
	convexHullsImage[:,:,:] = 0
	cv2.drawContours(convexHullsImage, convexHulls, -1, (255,255,255), -1)
	blueLightEnvironmentImage = cv2.bitwise_and(image, convexHullsImage)
	
	# Find light sources from blue light environment by thresholding
	keypoints = findLightSourcesByThreshold(blueLightEnvironmentImage, threshold)

	return keypoints findLightSources_old(image, threshold, filterLowerBound, filterUpperBound):
	
	# Filter through only parts of the original image which contain strong blue component
	_, thresholdImage = cv2.threshold(image, threshold, 255, cv2.THRESH_BINARY)
	blueThresholdImage = thresholdImage.copy()
	blueThresholdImage[:,:,1] = thresholdImage[:,:,0]
	blueThresholdImage[:,:,2] = thresholdImage[:,:,0]
	bluePartsImage = cv2.bitwise_and(image, blueThresholdImage)
	blurBluePartsImage = cv2.GaussianBlur(bluePartsImage, (5, 5), 0)
	
	# Filter through only real blue parts of image, not including parts with strong blue component, like white
	hsvBlurBluePartsImage = cv2.cvtColor(blurBluePartsImage, cv2.COLOR_BGR2HSV)
	filterImage = cv2.inRange(hsvBlurBluePartsImage, filterLowerBound, filterUpperBound)
	
	# Find blue light environments
	img, contours, hierarchy = cv2.findContours(filterImage,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
	# Take convex hulls to form fuller shapes, rather than the raw contours to capture the light source
	convexHulls = [cv2.convexHull(contour) for contour in contours]
	convexHullsImage = image.copy()
	convexHullsImage[:,:,:] = 0
	cv2.drawContours(convexHullsImage, convexHulls, -1, (255,255,255), -1)
	blueLightEnvironmentImage = cv2.bitwise_and(image, convexHullsImage)
	
	# Find light sources from blue light environment by thresholding
	keypoints = findLightSourcesByThreshold(blueLightEnvironmentImage, threshold)

	return keypoints
	
	
	
# find keypoints of light sources by thresholding image according to certain threshold value
# param image: np.array. image to process
# param threshold: int. threshold value to threshold by after grayscale conversion
# return: keypoints data
def findLightSourcesByThreshold(image, threshold):
	
	# Setup blob detector parameters
	params = cv2.SimpleBlobDetector_Params()
	params.minDistBetweenBlobs = 30
	params.filterByArea = True
	params.minArea = 50
	params.filterByCircularity = True
	params.minCircularity = 0.5
	params.filterByConvexity = True
	params.minConvexity = 0.5

	# Threshold the image
	grayImage = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
	_, thresholdImage = cv2.threshold(grayImage, threshold, 255, cv2.THRESH_BINARY)
	
	# Blur the image
	blurThresholdImage = cv2.GaussianBlur(thresholdImage, (5, 5), 0)
	blurThresholdImageInv = cv2.bitwise_not(blurThresholdImage)
	
	# Detect blobs in threshold image
	blobDetector = cv2.SimpleBlobDetector_create(params)
	keypoints = blobDetector.detect(blurThresholdImageInv)

	return keypoints