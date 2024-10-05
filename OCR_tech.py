import cv2
import numpy as np
import random

# Load the image
image_path = r"C:\Users\Lokghesh VAK\OneDrive\Desktop\Gen AI\pic2.png"  # Update with your image path
image = cv2.imread(image_path)

# Check if the image was loaded successfully
if image is None:
    raise ValueError("Could not open or find the image.")

# Create a copy of the image for masking
masked_image = image.copy()

# List to store masked areas
masked_areas = []

# Number of rectangles to mask
num_rectangles = 10

for _ in range(num_rectangles):
    # Randomly choose coordinates for the rectangle
    x = random.randint(0, image.shape[1] - 1)
    y = random.randint(0, image.shape[0] - 1)

    # Calculate the maximum possible width and height
    max_w = min(50, image.shape[1] - x)
    max_h = min(50, image.shape[0] - y)

    # Ensure there is enough space for the rectangle
    if max_w <= 0 or max_h <= 0:
        continue  # Skip this iteration if there's no space for a rectangle

    # Generate random width and height, ensuring they are within valid bounds
    if max_w > 10 and max_h > 10:  # Check to ensure enough space for both width and height
        w = random.randint(10, max_w)  # Width of the rectangle
        h = random.randint(10, max_h)  # Height of the rectangle

        # Create a random color
        random_color = np.random.randint(0, 256, size=(h, w, 3), dtype=np.uint8)

        # Apply the random color to the masked area
        masked_image[y:y + h, x:x + w] = random_color

        # Store the masked area information
        masked_areas.append({'x': x, 'y': y, 'w': w, 'h': h, 'color': random_color})

# Save the masked areas information
np.save("masked_areas.npy", masked_areas)

# Save the masked image
cv2.imwrite("masked_image_gradient.jpg", masked_image)
print("Masked image and areas saved.")
