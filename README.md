# EasyKindle

The goal of this extansion is to easily be able to download single pages from a website and upload it to a kindle.
This allows to read an article without distractions on a kindle instead of hoping around when reading on a tablet / computer.

## Supported platform
Currently only tested on firefox (linux).
If there is interests, I might make it compatible with chrome-based browsers as well.

## Usage
I have not looked at how to properly package the extension yet.
So, for the moment, install it as developper.

1. Download this code base
1. Open firefox and go to the "url": about:debugging
    1. Under *This Firefox*, click *Load Temporary Add-on...*
    1. Select the *manifest.json* file from this repository.

1. When the add-on is installed, click on the icon where the extensions are usually accessed.
1. Press *Activate Extension*
    - This will activate the extension in the currently open tab only.
    - To deactivate the extension on the tab, press that same button again that now shows *Deactivate Extension*.
1. Click on the part of the webpage you would like to download, you will see a red rectangle surrounding the current selection you just made.
    - Keep on clicking in the currently red selected area if you want to increase the selection to larger element containing where you clicked until you are happy.
    - If you want to cancel the selection press any key on the keyboard besides Enter.
1. Press the *Enter* key on your keyboard to download the selection as an *.html* file.
1. You can send yourself this file via e-mail to your *@kindle.com* mail adress as you would usually do.

## Requests
If you have any requests, feel free to either:
1. Open a PR with your changes
1. Create an issue ticket describing the issue you are encountering or the feature you would like implemented.

## Terms of service
This extension code is free to use and is provided "as is" without any warranty, express or implied.
The author(s) are not responsible for any damages or issues that may arise from the use of this code.
Use at your own risk.
