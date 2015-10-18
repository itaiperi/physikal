class Rectangle:
	def __init__(self, left, right, top, bottom, keypoint, containerSize):
		if right <= left or bottom <= top:
			raise Exception("Parameters are invalid!")
			
		self.top = top if top >= 0 else 0
		self.bottom = bottom if bottom <= containerSize[0] else containerSize[0]
		self.left = left if left >= 0 else 0
		self.right = right if right <= containerSize[1] else containerSize[1]
		self.keypoint = keypoint
		
	def center(self):
		return ((self.left + self.right) / 2, (self.top + self.bottom) / 2)
		
	def width(self):
		return self.right - self.left
		
	def height(self):
		return self.bottom - self.top