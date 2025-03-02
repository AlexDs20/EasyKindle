const text_active = "Deactivate Extension";
const text_inactive = "Activate Extension";

function popup_listen_for_clicks() {
    document.getElementById('toggleButton').addEventListener('click', (event)=>{
        // Change the button text based on the extension's state
        if (event.target.textContent == text_active) {
            event.target.textContent = text_inactive;
        } else {
            event.target.textContent = text_active;
        }

        browser.tabs.query({ active: true, currentWindow: true })
            .then((tabs)=>{
                browser.tabs.sendMessage(tabs[0].id, { command: "kindle_ext_toggle" });
            })
            .catch(report_script_error);

    });
}

function report_script_error(error) {
    console.error(`ERROR: ${error}`);
}

browser.tabs.query({ active: true, currentWindow: true })
    .then((tabs)=>{
        browser.tabs.insertCSS(tabs[0].id, { file: "/content_scripts/style.css" });
        browser.tabs.executeScript(tabs[0].id, { file: "/content_scripts/kindle.js" })
            .then(popup_listen_for_clicks)
            .catch(report_script_error);
    })
    .catch(report_script_error);
