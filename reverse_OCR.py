import cv2
import numpy as np

# Load the masked image
masked_image_path =r"C:\Users\Lokghesh VAK\OneDrive\Desktop\Gen AI\pic2.png"  # Ensure this path is correct
masked_image = cv2.imread(masked_image_path)

# Load the masked areas information
masked_areas = np.load("masked_areas.npy", allow_pickle=True)

# Create a copy of the masked image to reconstruct the original
reconstructed_image = masked_image.copy()

# Loop through each masked area and reconstruct the original
for area in masked_areas:
    x = area['x']
    y = area['y']
    w = area['w']
    h = area['h']
    
    # Restore the area to white (or any other color representing 'unmasked')
    reconstructed_image[y:y + h, x:x + w] = (255, 255, 255)  # Assuming white as the original background

# Save the reconstructed image
cv2.imwrite("reconstructed_image.jpg", reconstructed_image)
print("Reconstructed image saved.")
