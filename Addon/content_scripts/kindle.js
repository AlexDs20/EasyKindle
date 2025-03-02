(() => {
    if (window.kindle_ext_injected) {
        // This should send back that it's already active so that we can keep the "Active flag"
        return;
    }
    window.kindle_ext_injected = true;
    window.kindle_ext_active = false;

    browser.runtime.onMessage.addListener((message)=>{
        if (message.command === "kindle_ext_toggle") {
            window.kindle_ext_active = !window.kindle_ext_active
            if (window.kindle_ext_active) {
                setup();
            } else {
                teardown();
            }
        }
    });

    const cls = "ke-selected";

    function handle_click_wrapper(event) {
        handle_click(event.target);
    }

    function handle_click(elem) {
        const parent_with_cls = elem.closest("."+cls);

        if (parent_with_cls) {
            parent_with_cls.classList.remove(cls);
            parent_with_cls.parentNode.classList.add(cls);
        } else {
            const deleted_elem = delete_all();
            if (deleted_elem === 0) {
                elem.classList.add(cls);
            }
        }
    }

    function delete_all() {
        const all = document.querySelectorAll("."+cls);
        all.forEach((elem) => {
            elem.classList.remove(cls);
        });
        return all.length;
    }

    function downloadAllImages(elem) {
        let imgs = Array.from(elem.parentNode.getElementsByTagName("img"));

        imgs.forEach((img, i) => {
            let canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.drawImage(img, 0, 0);

            // Convert canvas to a downloadable link
            let a = document.createElement("a");
            a.href = canvas.toDataURL("image/png"); // Get image data
            a.download = `saved_image_${i}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    }

    function fetchImage(src) {
        return fetch(src)
            .then(response => response.blob())
            .then((blob) => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            }))
            .catch(error => {
                console.error("Error fetching image: ", error);
                return null;
            });
    }


    function convertAllImages(elem) {
        let imgs = Array.from(elem.getElementsByTagName("img"));
        let canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        imgs.forEach((img) => {
            img.crossOrigin = "anonymous";
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.drawImage(img, 0, 0);

            // Convert canvas to a downloadable link
            const mimeType = "image/png";
            let base64;
            try {
                base64 = canvas.toDataURL(mimeType); // Get image data in Base64
                img.src = base64;
            } catch (error) {
                console.log("Failed: toDataURL for image src: ", img.src);
            }

            if (base64 === "data:,") {
                fetchImage(img.src).then(b64 => img.src = b64);
            }
        });

        canvas.remove();
    }

    function downloadElementAsHTML(orig_element, filename = "download.html") {
        const copy_element = orig_element.cloneNode(true);

        convertAllImages(copy_element);

        // Wrap content in a basic HTML document structure
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${document.title}</title>
            </head>
            <body>
                ${copy_element.outerHTML}
            </body>
            </html>`;

        // Create a Blob and trigger a download
        const blob = new Blob([htmlContent], { type: "text/html" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        a.remove();
    }

    function download_selection(elem) {
        if (elem) {
            downloadElementAsHTML(elem);
        }
    }

    function key_press_wrapper(event) {
        if (event.defaultPrevented) {
            return;
        }
        switch (event.key) {
            case "Enter":
                const elem = document.querySelector("."+cls);
                delete_all();
                download_selection(elem);
                break;
            case "Escape":
                delete_all();
                break;
            default:
                return;
        }
        event.preventDefault();
    }

    function setup() {
        document.addEventListener("click", handle_click_wrapper);
        document.addEventListener("keydown", key_press_wrapper);
    }

    function teardown() {
        delete_all();
        document.removeEventListener("click", handle_click_wrapper);
        document.removeEventListener("keydown", key_press_wrapper);
    }
})();
