import cv2
import numpy as np
from rectangle import *
import time
import datetime
from websocket import create_connection


# VARIABLES FOR GESTURE TRACKING, RELEVANT FOR: TRACKGESTURE, CLASSIFYGESTURE, RECOGNIZEGESTURE
movementThreshold = (64, 48) # threshold, in pixels, between two consecutive images, to determine movement in x, y axes
gestureThreshold = (160, 120) # threshold, in pixels, to determine if there has been a gesture in some direction, between initial location and final location
movementDirection = ""
lastPosition = (0, 0)
initialGesturePosition = (0, 0)



# track gestures based on changes between current position and previous position
# param currentCoordinate: (x, y) tuple. Current coordinate of the light source.
# param movementDirection: string (enum). "RIGHT", "LEFT", "UP", "DOWN". indicates which gesture we're looking for
# param initialGesturePosition: GLOBAL (x, y) tuple. Initial position of light source, when gesture began.
# param movementThreshold: GLOBAL (xThreshold, yThreshold) tuple. Minimum distance in x or y axes for the movement to be considered as part of a gesture
# return: gesture type
def trackGesture(currentCoordinate):

	global movementDirection, initialGesturePosition, movementThreshold
	
	dx = currentCoordinate[0] - lastPosition[0]
	dy = currentCoordinate[1] - lastPosition[1]

	if abs(dx) > abs(dy) and abs(dx) > movementThreshold[0]:
		if dx > 0:
			# Right movement
			if movementDirection != "RIGHT":
				movementDirection = "RIGHT"
				initialGesturePosition = currentCoordinate
		else:
			# Left movement
			if movementDirection != "LEFT":
				movementDirection = "LEFT"
				initialGesturePosition = currentCoordinate
	elif abs(dy) > abs(dx) and abs(dy) > movementThreshold[1]:
		if dy > 0:
			#Down movement
			if movementDirection != "DOWN":
				movementDirection = "DOWN"
				initialGesturePosition = currentCoordinate
		else:
			# Up movement
			if movementDirection != "UP":
				movementDirection = "UP"
				initialGesturePosition = currentCoordinate
	else:
		gesture = classifyGesture(currentCoordinate)
		return gesture



# recognize gestures based on past movement direction, initial location at gesture beginning, and current location
# NOTE: will always set movementDirection to "" at the end
# param currentCoordinate: (x, y) tuple. Current / last coordinate of the light source.
# param movementDirection: string (enum). "RIGHT", "LEFT", "UP", "DOWN". indicates which gesture we're looking for
# param initialGesturePosition: GLOBAL (x, y) tuple. Initial position of light source, when gesture began.
# param gestureThreshold: GLOBAL (xThreshold, yThreshold) tuple. Minimum distance in x or y axes for the movement to be considered a gesture
# return: gesture 
def classifyGesture(currentCoordinate):

	global movementDirection, initialGesturePosition, gestureThreshold
	gesture = None
	
	if movementDirection == "RIGHT" and abs(currentCoordinate[0] - initialGesturePosition[0]) > gestureThreshold[0]:
		gesture = "GESTURE_SWIPERIGHT"
	elif movementDirection == "LEFT" and abs(currentCoordinate[0] - initialGesturePosition[0]) > gestureThreshold[0]:
		gesture = "GESTURE_SWIPELEFT"
	elif movementDirection == "DOWN" and abs(currentCoordinate[1] - initialGesturePosition[1]) > gestureThreshold[1]:
		gesture = "GESTURE_SWIPEDOWN"
	elif movementDirection == "UP" and abs(currentCoordinate[1] - initialGesturePosition[1]) > gestureThreshold[1]:
		gesture = "GESTURE_SWIPEUP"
	movementDirection = ""
	return gesture



# find keypoints of light sources by:
# 1. find strong white points (suspicious light sources)
# 2. separate the light source and its environment from the image
# 3. check the environment containment of filter color
# 4. if it's above a certain threshold, then this is a valid light source!
# param image: np.array. image to process
# param lightSourceThreshold: int. threshold value to threshold by.
# return: keypoints data
def recognizeGesture(image, lightSourceThreshold):

	global movementDirection, lastPosition, initialGesturePosition, isRecognizingGesture

	# Find all light sources in image
	grayImage = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
	_, thresholdImage = cv2.threshold(grayImage, lightSourceThreshold, 255, cv2.THRESH_BINARY)
	im2, contours, hier = cv2.findContours(thresholdImage, cv2.RETR_TREE, cv2.CHAIN_APPROX_NONE)

	thresholdImageClean = np.zeros(np.shape(thresholdImage))
	minAreaContours = []
	for contour in contours:
		if cv2.contourArea(contour) > 30:
			minAreaContours.append(contour)
	cv2.drawContours(thresholdImageClean, contours, -1, 255, -1)
	
	moments = cv2.moments(thresholdImageClean)
	# Handle cases where light source is out of borders of camera
	if moments["m00"] == 0:
		gesture = classifyGesture((lastPosition[0], lastPosition[1]))
		lastPosition = (0, 0)
		return gesture
		
	centerX = moments["m10"] / moments["m00"]
	centerY = moments["m01"] / moments["m00"]
	
	gesture = trackGesture((centerX, centerY))
	
	lastPosition = (centerX, centerY)
	
	return gesture
	


# find keypoints of light sources by:
# 1. find strong white points (suspicious light sources)
# 2. separate the light source and its environment from the image
# 3. check the environment containment of filter color
# 4. if it's above a certain threshold, then this is a valid light source!
# param image: np.array. image to process
# param threshold: int. threshold value to threshold by.
# param filterLowerBound: tuple. lower bound of color filter, in HSV format (h, s, v)
# param filterUpperBound: tuple. upper bound of color filter, in HSV format (h, s, v)
# return: keypoints data
def findLightSourcesCoordinates(image, lightSourceThreshold, filterAmountThreshold, filterLowerBound, filterUpperBound):
	
	# Setup blob detector parameters
	params = cv2.SimpleBlobDetector_Params()
	params.minDistBetweenBlobs = 30
	params.filterByArea = True
	params.minArea = 50
	params.filterByCircularity = True
	params.minCircularity = 0.4
	params.filterByConvexity = True
	params.minConvexity = 0.4
	blobDetector = cv2.SimpleBlobDetector_create(params)
	
	# Find all light sources in image
	grayImage = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
	_, thresholdImage = cv2.threshold(grayImage, lightSourceThreshold, 255, cv2.THRESH_BINARY)
	thresholdImageInv = cv2.bitwise_not(thresholdImage)
	thresholdImageColor = image.copy()
	thresholdImageColor[:, :, 0] = thresholdImage
	thresholdImageColor[:, :, 1] = thresholdImage
	thresholdImageColor[:, :, 2] = thresholdImage
	thresholdImageColor = cv2.bitwise_and(image, thresholdImageColor)
	keypoints = blobDetector.detect(thresholdImageInv)
	
	# Mark all of the light sources' environments
	# keypointsSquares will hold the environments coordinates of the light sources
	lightSourcesImage = image.copy()
	lightSourcesImage[:,:,:] = 0
	keypointSquares = []
	for keypoint in keypoints:
		centerX = int(keypoint.pt[0])
		centerY = int(keypoint.pt[1])
		radius = int(keypoint.size / 2 * 1.3)
		keypointSquare = Rectangle(centerX - radius, centerX + radius, centerY - radius, centerY + radius, keypoint, np.shape(image))
		keypointSquares.append(keypointSquare)
		upperleft = (keypointSquare.left, keypointSquare.top)
		bottomright = (keypointSquare.right, keypointSquare.bottom)
		cv2.rectangle(lightSourcesImage, upperleft, bottomright, (255, 255, 255), -1)
	
	# Create image with only environments of light sources
	lightSourcesImageOriginal = cv2.bitwise_and(image, lightSourcesImage)
	lightSourcesImageEnv = lightSourcesImageOriginal - thresholdImageColor
	# cv2.imshow("a", lightSourcesImageOriginal)
	# cv2.imshow("b", lightSourcesImageEnv)
	
	# Examine environment of light sources to see which 1 is the one we need
	lightSourcesKeypoints = []
	for keypointSquare in keypointSquares:
		# Notice that in the image, X and Y coordinates are flipped - it's (Y,X,Z)
		keypointRectangleImage = lightSourcesImageEnv[keypointSquare.top:keypointSquare.bottom, keypointSquare.left:keypointSquare.right, :]
		keypointRectangleImageHSV = cv2.cvtColor(keypointRectangleImage, cv2.COLOR_BGR2HSV)
		keypointRectangleImageFiltered = cv2.inRange(keypointRectangleImageHSV, filterLowerBound, filterUpperBound)
		keypointRectangleImageFiltered = cv2.cvtColor(keypointRectangleImageFiltered, cv2.COLOR_GRAY2BGR)
		keypointRectangleImageFiltered = cv2.bitwise_and(keypointRectangleImage, keypointRectangleImageFiltered)
		keypointRectangleImageBinary = cv2.cvtColor(keypointRectangleImage, cv2.COLOR_BGR2GRAY)
		_, keypointRectangleImageBinary = cv2.threshold(keypointRectangleImageBinary, 1, 255, cv2.THRESH_BINARY)
		keypointRectangleImageFilteredBinary = cv2.cvtColor(keypointRectangleImageFiltered, cv2.COLOR_BGR2GRAY)
		imageMoments = cv2.moments(keypointRectangleImageBinary, True)
		imageFilteredMoments = cv2.moments(keypointRectangleImageFilteredBinary, True)
		# moment 00 is the sum of all non-black pixels.
		# we compare the number of pixels in filtered image with the
		# number of pixels in the unfiltered image
		if imageMoments["m00"] > 0 and imageFilteredMoments["m00"] / imageMoments["m00"] > filterAmountThreshold:
			# At this point, we know enough of the environment is at filter color, which means this is a valid light source!
			# print imageFilteredMoments["m00"] / imageMoments["m00"]
			lightSourcesKeypoints.append(keypointSquare.keypoint)
		
	return lightSourcesKeypoints
	
	
	
if __name__ == "__main__":
	blueLowerBound = (90, 100, 100)
	blueUpperBound = (150, 255, 255)
	lightSourceThreshold = 230
	filterAmountThreshold = 0.2
	keypointsColor = (0, 0, 255)
	
	# Setup camera capture
	capture = cv2.VideoCapture(0)
	webcamWidth = capture.get(3)
	webcamHeight = capture.get(4)
	gestureThreshold = (webcamWidth / 4, webcamHeight / 4)
	movementThreshold = (webcamWidth / 10, webcamHeight / 10)
	
	header = ["device: ImageProcessor"]
	ws = create_connection("ws://localhost:12012/", header = header)
	lastKeepAlive = time.time() * 1000

	while True:
		isSingleLightSource = True
		_, image = capture.read()
		image = cv2.flip(image, 1)
		gesture = recognizeGesture(image, lightSourceThreshold)
		if gesture is not None:
			print gesture
			ws.send("{{\"type\":\"{}\", \"gesture\":\"{}\"}}".format('GESTURE', gesture))
		keypoints = findLightSourcesCoordinates(image, lightSourceThreshold, filterAmountThreshold, blueLowerBound, blueUpperBound)
		keypointsImage = cv2.drawKeypoints(image, keypoints, np.array([]), (0, 0, 255), cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
		
		if len(keypoints) != 1:
			if len(keypoints) > 1:
				print "More than one light source found!"
			if time.time() * 1000 - lastKeepAlive > 5000:
				lastKeepAlive = time.time() * 1000
				ws.send("keep-alive")
			isSingleLightSource = False
			
		for keypoint in keypoints:
			center = (int(keypoint.pt[0]), int(keypoint.pt[1]))
			if isSingleLightSource:
				ws.send("{{\"type\":\"{}\", \"x\":\"{}\", \"y\":\"{}\"}}".format('COORDINATE', center[0] / webcamWidth, center[1] / webcamHeight))
			radius = int(keypoint.size/2)
			cv2.circle(keypointsImage, center, radius, (0, 255, 0), thickness=-1)
			cv2.circle(keypointsImage, center, 2, (255, 0, 0), thickness=-1)

		cv2.imshow("Keypoints", keypointsImage)

		if cv2.waitKey(1) & 0xFF == ord('q'):
			break
