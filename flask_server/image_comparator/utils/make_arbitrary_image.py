from PIL import Image
import io
import base64

# Create a red 200x200 pixel image
width, height = 500,500
blank = (0, 0, 0) # R
red = (255, 0, 0) # R
green = (0, 255, 0) # G
blue = (0, 0, 255) # B

blank_image = Image.new("RGB", (width, height), blank)
red_image = Image.new("RGB", (width, height), red)
green_image = Image.new("RGB", (width, height), green)
blue_image = Image.new("RGB", (width, height), blue)

# Save the image to a BytesIO object
blank_image_io = io.BytesIO()
blank_image.save(blank_image_io, format="PNG")

red_image_io = io.BytesIO()
red_image.save(red_image_io, format="PNG")

green_image_io = io.BytesIO()
green_image.save(green_image_io, format="PNG")

blue_image_io = io.BytesIO()
blue_image.save(blue_image_io, format="PNG")

blank_image.save("/home/bearceb/Image-Comparator/flask_server/image_comparator/utils/blank_segmentation.png")
red_image.save("/home/bearceb/Image-Comparator/flask_server/image_comparator/utils/red_segmentation.png")
green_image.save("/home/bearceb/Image-Comparator/flask_server/image_comparator/utils/green_segmentation.png")
blue_image.save("/home/bearceb/Image-Comparator/flask_server/image_comparator/utils/blue_segmentation.png")

# Encode the image in base64
blank_base64_encoded = base64.b64encode(blank_image_io.getvalue()).decode()
red_base64_encoded = base64.b64encode(red_image_io.getvalue()).decode()
green_base64_encoded = base64.b64encode(green_image_io.getvalue()).decode()
blue_base64_encoded = base64.b64encode(blue_image_io.getvalue()).decode()

# Print the base64 encoded image
print(blank_base64_encoded)
print(red_base64_encoded)
print(green_base64_encoded)
print(blue_base64_encoded)
