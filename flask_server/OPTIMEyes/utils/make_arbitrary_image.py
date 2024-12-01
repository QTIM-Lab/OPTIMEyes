from PIL import Image
import io
import base64

# Create a red 200x200 pixel image
width, height = 1536,1536
blank = (0, 0, 0) # R
red = (255, 0, 0) # R
green = (0, 255, 0) # G
blue = (0, 0, 255) # B
fav_teal = (0, 43,54)

blank_image = Image.new("RGB", (width, height), blank)
red_image = Image.new("RGB", (width, height), red)
green_image = Image.new("RGB", (width, height), green)
blue_image = Image.new("RGB", (width, height), blue)
teal_image = Image.new("RGB", (width, height), fav_teal)

# Save the image to a BytesIO object
blank_image_io = io.BytesIO()
blank_image.save(blank_image_io, format="PNG")

red_image_io = io.BytesIO()
red_image.save(red_image_io, format="PNG")

green_image_io = io.BytesIO()
green_image.save(green_image_io, format="PNG")

blue_image_io = io.BytesIO()
blue_image.save(blue_image_io, format="PNG")

teal_image_io = io.BytesIO()
teal_image.save(teal_image_io, format="PNG")

blank_image.save("/persist/WebApps/OPTIMEyes/flask_server/OPTIMEyes/utils/blank_segmentation.png")
red_image.save("/persist/WebApps/OPTIMEyes/flask_server/OPTIMEyes/utils/red_segmentation.png")
green_image.save("/persist/WebApps/OPTIMEyes/flask_server/OPTIMEyes/utils/green_segmentation.png")
blue_image.save("/persist/WebApps/OPTIMEyes/flask_server/OPTIMEyes/utils/blue_segmentation.png")
teal_image.save("/persist/WebApps/OPTIMEyes/flask_server/OPTIMEyes/utils/teal_segmentation.png")



# Encode the image in base64
blank_base64_encoded = base64.b64encode(blank_image_io.getvalue()).decode()
red_base64_encoded = base64.b64encode(red_image_io.getvalue()).decode()
green_base64_encoded = base64.b64encode(green_image_io.getvalue()).decode()
blue_base64_encoded = base64.b64encode(blue_image_io.getvalue()).decode()
teal_base64_encoded = base64.b64encode(teal_image_io.getvalue()).decode()

# Print the base64 encoded image
print(blank_base64_encoded)
print(red_base64_encoded)
print(green_base64_encoded)
print(blue_base64_encoded)
print(teal_base64_encoded)



teal_image_io = io.BytesIO()
teal_image = Image.open("/persist/WebApps/OPTIMEyes/flask_server/OPTIMEyes/utils/teal_segmentation.png")
teal_image.save(teal_image_io, format="PNG")
teal_base64_encoded = base64.b64encode(teal_image_io.getvalue()).decode()

with open("/persist/WebApps/OPTIMEyes/flask_server/OPTIMEyes/utils/teal_segmentation_base64.txt", "w") as file:
    file.write(teal_base64_encoded)





faf_image_io = io.BytesIO()
faf_image = Image.open("/persist/WebApps/OPTIMEyes/Image-Comparator-Data/ga_progression_modeling/FAF/axis01_10332_508134_2022050515115003487056cca361b0af5.png")
faf_image.save(faf_image_io, format="PNG")
faf_image.save("/persist/WebApps/OPTIMEyes/flask_server/OPTIMEyes/utils/FAF.png")
faf_base64_encoded = base64.b64encode(faf_image_io.getvalue()).decode()

with open("/persist/WebApps/OPTIMEyes/flask_server/OPTIMEyes/utils/faf_base64.txt", "w") as file:
    file.write(faf_base64_encoded)




slo_image_io = io.BytesIO()
slo_image = Image.open("/persist/WebApps/OPTIMEyes/Image-Comparator-Data/ga_progression_modeling/SLOImage/reg_axis01_10332_508134_202205051511417032c87e87fa6a60bb1.png")
slo_image.save(slo_image_io, format="PNG")
slo_image.save("/persist/WebApps/OPTIMEyes/flask_server/OPTIMEyes/utils/SLO.png")
slo_base64_encoded = base64.b64encode(slo_image_io.getvalue()).decode()

with open("/persist/WebApps/OPTIMEyes/flask_server/OPTIMEyes/utils/slo_base64.txt", "w") as file:
    file.write(slo_base64_encoded)



bscan1_image_io = io.BytesIO()
bscan1_image = Image.open("/persist/WebApps/OPTIMEyes/Image-Comparator-Data/ga_progression_modeling/BScan/axis01_10332_508134_202205051511218605061479ee1da0c51.png")
bscan1_image.save(bscan1_image_io, format="PNG")
bscan1_image.save("/persist/WebApps/OPTIMEyes/flask_server/OPTIMEyes/utils/bscan1.png")
bscan1_base64_encoded = base64.b64encode(bscan1_image_io.getvalue()).decode()

with open("/persist/WebApps/OPTIMEyes/flask_server/OPTIMEyes/utils/bscan1_base64.txt", "w") as file:
    file.write(bscan1_base64_encoded)



bscan2_image_io = io.BytesIO()
bscan2_image = Image.open("/persist/WebApps/OPTIMEyes/Image-Comparator-Data/ga_progression_modeling/BScan/axis01_10332_508134_2022050515112254692ba61380a0f5179.png")
bscan2_image.save(bscan2_image_io, format="PNG")
bscan2_base64_encoded = base64.b64encode(bscan2_image_io.getvalue()).decode()

with open("/persist/WebApps/OPTIMEyes/flask_server/OPTIMEyes/utils/bscan2_base64.txt", "w") as file:
    file.write(bscan2_base64_encoded)

