(() => {
    if (window.kindle_ext_injected) {
        // This should send back that it's already active so that we can keep the "Active flag"
        return;
    }
    let browserApi;
    if (chrome !== undefined) {
        browserApi = chrome;
    } else {
        browserApi = browser;
    }
    window.kindle_ext_injected = true;
    window.kindle_ext_active = false;

    browserApi.runtime.onMessage.addListener((message)=>{
        if (message.command === "kindle_ext_toggle") {
            window.kindle_ext_active = !window.kindle_ext_active

            browserApi.runtime.sendMessage({ command: "set_current_active_tab", state: window.kindle_ext_active });
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

            if (base64 === "data:," || !base64.startsWith("data:,")) {
                try {
                    fetchImage(img.src).then(b64 => img.src = b64);
                } catch (error) {
                    console.log("Failed: fetch for image src: ", img.src);
                }
            }
        });

        canvas.remove();
    }

    const tag_specific_styles = {
        "": ["",""],
    };
    const general_styles = [
        "border-width",
        "border-style"
    ];
    function keepStyles(orig, cop) {
        // Get the orig element style and set it inline to the copy
        const tag = orig.tagName;
        const orig_styles = window.getComputedStyle(orig);

        const inline_style = {};
        if (tag in tag_specific_styles) {
            for (const st=0; st<tag_specific_styles[tag]; st++) {
                const style_tag = tag_specific_styles[tag] ;
                inline_style[st] = orig_styles.getPropertyValue(style_tag);
            }
        }

        for (let st = 0; st<general_styles.length; st++) {
            const style_tag = general_styles[st];
            if (!(style_tag in inline_style)) {
                inline_style[style_tag] = orig_styles.getPropertyValue(style_tag);
            }
        }

        let string_style = "";
        for (const [st,v] of Object.entries(inline_style)) {
            string_style += st + ":" + v + "; "
        }

        cop.setAttribute("style", string_style);

        // Go through the children
        const n_children = orig.children.length;
        for (let i=0; i<n_children; i++) {
            orig_child = orig.children[i];
            cop_child = cop.children[i];
            keepStyles(orig_child, cop_child);
        }
    }

    function downloadElementAsHTML(orig_element, filename = undefined) {
        const copy_element = orig_element.cloneNode(true);

        keepStyles(orig_element, copy_element);

        convertAllImages(copy_element);

        // Wrap content in a basic HTML document structure
        const htmlContent = `<!DOCTYPE html>
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
        if (filename === undefined) {
            filename = document.title.replace(/ /g, "_");
        }
        if (!filename.endsWith(".html")) {
            filename += ".html";
        }
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
