'''Page Segmentation Modes (PSM):
PSM 0: Orientation and script detection (OSD) only.
PSM 1: Automatic page segmentation with OSD.
PSM 2: Automatic page segmentation but no OSD or OCR.
PSM 3: Fully automatic page segmentation, but no OSD (default mode).
PSM 4: Assume a single column of text of variable sizes.
PSM 5: Assume a single uniform block of vertically aligned text.
PSM 6: Assume a single uniform block of text.
PSM 7: Treat the image as a single text line.
PSM 8: Treat the image as a single word.
PSM 9: Treat the image as a single word in a circle.
PSM 10: Treat the image as a single character.
PSM 11: Sparse text. Find as much text as possible in no particular order.
PSM 12: Sparse text with OSD.
PSM 13: Raw line. Treat the image as a single text line, bypassing horizontal spacing and positioning of characters.

------------------------------------------
OCR Engine Modes (OEM):
OEM 0: Legacy engine only.
OEM 1: Neural nets LSTM engine only.
OEM 2: Legacy + LSTM engines.
OEM 3: Default, based on what is available.
'''
''' We use AI to implement the modes and the engine  :) and use Intel toolkits !!'''
import pytesseract 
import PIL.Image
import cv2
myconfig= r"--psm 12 --oem 3"
text= pytesseract.image_to_string(PIL.Image.open(r"c:\Users\Lokghesh VAK\OneDrive\Desktop\TEST_FILES\pic2.png"),config=myconfig)
print(text,end ="")