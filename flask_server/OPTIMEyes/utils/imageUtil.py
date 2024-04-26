from PIL import Image
import glob
import os

def merge_images(file1, file2):
    print('In merge_images found at Image_Comparator/util:\n')
    """Merge two images into one, displayed side by side
    :param file1: path to first image file
    :param file2: path to second image file
    :return: the merged Image object
    """
    image1 = Image.open(open(file1, 'rb'))
    image2 = Image.open(open(file2, 'rb'))

    (width1, height1) = image1.size
    (width2, height2) = image2.size

    result_width = width1 + width2
    result_height = max(height1, height2)

    result = Image.new('RGB', (result_width, result_height))
    result.paste(im=image1, box=(0, 0))
    result.paste(im=image2, box=(width1, 0))
    return result

# path = "Z:/mactel-rank/ranked_64/ranked_64/"
# files = glob.glob(path + "color_OD/*.png")
#
# for image in files:
#     imageName = image.split("\\", 1)[-1]
#     imageName2 = imageName.replace("D", "S")
#
#     open(path+"color_OD/"+imageName)
#
#     merge = merge_images(path+"color_OD/"+imageName, path+"color_OS/"+imageName2)
#     merge.save(path+"color_merge/"+imageName[:-10] + ".png")

# Group OCT Image Scans

path = "Z:/mactel-rank/ranked_64/ranked_64/"
files = glob.glob(path + "oct_png_all/*.png")
files.sort()

# create folder for each oct scan
# within each folder, images will have a number tag

prevID = ''
counter = 0
for image in files:
    print(image)

    imageName = image.split("\\", 1)[-1]
    imageID = imageName.split("_")[0]
    im = Image.open(open(image, 'rb'))

    if prevID == imageID:
        counter += 1
        im.save(path + "oct_png_group/" + imageID + "/" + str(counter) + ".png")
    else:
        prevID = imageID
        counter = 0

        if not os.path.exists(path + "oct_png_group/" + imageID):
            os.makedirs(path + "oct_png_group/" + imageID)
        im.save(path + "oct_png_group/" + imageID + "/" + str(counter) + ".png")
